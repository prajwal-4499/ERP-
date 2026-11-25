const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// 1. Single-Instance Lock: Prevent duplicate windows
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow;

  // Window State Persistence Helper
  const stateFilePath = path.join(app.getPath('userData'), 'window-state.json');

  function loadWindowState() {
    try {
      if (fs.existsSync(stateFilePath)) {
        const raw = fs.readFileSync(stateFilePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading window state:', e);
    }
    return {
      width: 1366,
      height: 768,
      x: undefined,
      y: undefined,
      isMaximized: false,
    };
  }

  function saveWindowState() {
    if (!mainWindow) return;
    try {
      const isMaximized = mainWindow.isMaximized();
      const bounds = mainWindow.getBounds();
      const state = {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isMaximized,
      };
      fs.writeFileSync(stateFilePath, JSON.stringify(state), 'utf8');
    } catch (e) {
      console.warn('Error writing window state:', e);
    }
  }

  function createWindow() {
    const savedState = loadWindowState();

    mainWindow = new BrowserWindow({
      width: savedState.width || 1366,
      height: savedState.height || 768,
      x: savedState.x,
      y: savedState.y,
      minWidth: 1024,
      minHeight: 650,
      title: 'Shravani Collection & New SK Telors - ERP & POS',
      icon: path.join(__dirname, '../public/vite.svg'),
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, 'preload.cjs'),
      },
    });

    if (savedState.isMaximized) {
      mainWindow.maximize();
    }

    // Remove default top menu for a clean POS desktop app experience
    Menu.setApplicationMenu(null);

    // Native Context Menu for text inputs
    mainWindow.webContents.on('context-menu', (event, params) => {
      if (params.isEditable) {
        const contextMenu = Menu.buildFromTemplate([
          { role: 'undo', label: 'Undo' },
          { role: 'redo', label: 'Redo' },
          { type: 'separator' },
          { role: 'cut', label: 'Cut' },
          { role: 'copy', label: 'Copy' },
          { role: 'paste', label: 'Paste' },
          { type: 'separator' },
          { role: 'selectAll', label: 'Select All' },
        ]);
        contextMenu.popup({ window: mainWindow, x: params.x, y: params.y });
      }
    });

    // Intercept external links (WhatsApp, external documentation) and open in default OS browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    });

    // Save window state on move and resize
    mainWindow.on('resize', saveWindowState);
    mainWindow.on('move', saveWindowState);
    mainWindow.on('close', saveWindowState);

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    if (isDev && process.env.ELECTRON_START_URL) {
      mainWindow.loadURL(process.env.ELECTRON_START_URL);
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  // Handle second-instance attempt: restore and focus existing window
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  // IPC Handler: Silent Thermal Receipt Printing (80mm ESC/POS)
  ipcMain.handle('print-thermal', async (event, { htmlContent, printerName, silent }) => {
    let printWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    try {
      const formattedHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { margin: 0; padding: 6px; font-family: monospace; font-size: 11px; width: 72mm; color: #000; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;

      await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(formattedHtml)}`);

      return new Promise((resolve) => {
        printWin.webContents.print(
          {
            silent: silent !== false,
            printBackground: true,
            deviceName: printerName || '',
            margins: { marginType: 'none' },
          },
          (success, failureReason) => {
            if (!printWin.isDestroyed()) {
              printWin.close();
            }
            resolve({ success, error: failureReason });
          }
        );
      });
    } catch (err) {
      if (printWin && !printWin.isDestroyed()) {
        printWin.close();
      }
      return { success: false, error: err.message };
    }
  });

  // IPC Handler: Secure PIN Validation
  ipcMain.handle('verify-pin', async (event, { pin, action, module }) => {
    const isValid = pin === '1234' || pin === '9999';
    return { valid: isValid };
  });

  // IPC Handler: Get Installed Printers list & Diagnostics
  ipcMain.handle('get-printers', async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      return await mainWindow.webContents.getPrintersAsync();
    }
    return [];
  });

  // IPC Handler: Printer Diagnostics & Status Check
  ipcMain.handle('check-printer-status', async (event, printerName) => {
    try {
      if (!mainWindow || mainWindow.isDestroyed()) return { available: false, error: 'No active window' };
      const printers = await mainWindow.webContents.getPrintersAsync();
      if (!printerName) {
        const defaultPrinter = printers.find((p) => p.isDefault);
        return {
          available: printers.length > 0,
          totalPrinters: printers.length,
          defaultPrinterName: defaultPrinter?.name || null,
          printers,
        };
      }
      const target = printers.find((p) => p.name.toLowerCase() === printerName.toLowerCase());
      return {
        available: !!target,
        printer: target || null,
        isDefault: target ? target.isDefault : false,
        status: target ? target.status : 'NOT_FOUND',
      };
    } catch (err) {
      return { available: false, error: err.message };
    }
  });

  // IPC Handler: Native Save File Dialog
  ipcMain.handle('show-save-dialog', async (event, options) => {
    if (!mainWindow || mainWindow.isDestroyed()) return { canceled: true };
    return await dialog.showSaveDialog(mainWindow, options);
  });

  // IPC Handler: Write Saved File to Disk
  ipcMain.handle('write-file-to-disk', async (event, { filePath, content, isBase64 }) => {
    try {
      if (isBase64) {
        fs.writeFileSync(filePath, Buffer.from(content, 'base64'));
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
