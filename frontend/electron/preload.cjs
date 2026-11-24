const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  printThermal: (options) => ipcRenderer.invoke('print-thermal', options),
  verifyPin: (pin, action, module) => ipcRenderer.invoke('verify-pin', { pin, action, module }),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
});
