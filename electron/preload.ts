import { contextBridge, ipcRenderer } from 'electron';

// Expose safe IPC APIs to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  printReceipt: (rawHex: string) => ipcRenderer.invoke('print-receipt', rawHex),
  silentPrint: () => ipcRenderer.invoke('silent-print'),
  kickCashDrawer: () => ipcRenderer.invoke('kick-cash-drawer'),
  getPrinterStatus: () => ipcRenderer.invoke('get-printer-status'),
  checkForGitUpdates: () => ipcRenderer.invoke('check-for-git-updates'),
  pullGitUpdates: () => ipcRenderer.invoke('pull-git-updates'),
});
