"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose safe IPC APIs to the renderer
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    printReceipt: (rawHex) => electron_1.ipcRenderer.invoke('print-receipt', rawHex),
    silentPrint: () => electron_1.ipcRenderer.invoke('silent-print'),
    kickCashDrawer: () => electron_1.ipcRenderer.invoke('kick-cash-drawer'),
    getPrinterStatus: () => electron_1.ipcRenderer.invoke('get-printer-status'),
    checkForGitUpdates: () => electron_1.ipcRenderer.invoke('check-for-git-updates'),
    pullGitUpdates: () => electron_1.ipcRenderer.invoke('pull-git-updates'),
    saveReportFile: (data) => electron_1.ipcRenderer.invoke('save-report-file', data),
    openReportsFolder: (subfolder) => electron_1.ipcRenderer.invoke('open-reports-folder', subfolder),
});
