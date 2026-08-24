import { contextBridge, ipcRenderer } from 'electron';

// Expose safe IPC APIs to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  printReceipt: (rawHex: string) => ipcRenderer.invoke('print-receipt', rawHex),
  kickCashDrawer: () => ipcRenderer.invoke('kick-cash-drawer'),
  getPrinterStatus: () => ipcRenderer.invoke('get-printer-status'),
});
