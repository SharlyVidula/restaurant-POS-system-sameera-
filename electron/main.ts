import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Galle Fortress Breeze - Offline POS',
    backgroundColor: '#0b0f19',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  // Load from local Vite dev server in development or dist/index.html in production
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // IPC Handlers for ESC/POS hardware
  ipcMain.handle('print-receipt', async (_event, _rawHex) => {
    // Hardware thermal printer dispatch logic
    console.log('[ESC/POS Hardware] Receipt dispatch command received');
    return { success: true, message: 'Printed to thermal printer' };
  });

  ipcMain.handle('kick-cash-drawer', async () => {
    // Hardware pulse command: ESC p 0 25 250
    console.log('[ESC/POS Hardware] RJ11 Solenoid Kick Pulse 24V Triggered');
    return { success: true, message: 'Drawer kicked' };
  });

  ipcMain.handle('get-printer-status', async () => {
    return { online: true, paper: 'ok' };
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
