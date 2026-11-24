const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
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

  // Remove default top menu for a clean POS desktop app experience
  Menu.setApplicationMenu(null);

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
  // Master PIN validation: 1234 (Owner/Manager Default) or 9999 (Master Override)
  const isValid = pin === '1234' || pin === '9999';
  return { valid: isValid };
});

// IPC Handler: Get Installed Printers list
ipcMain.handle('get-printers', async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return await mainWindow.webContents.getPrintersAsync();
  }
  return [];
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
