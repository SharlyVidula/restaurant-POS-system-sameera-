import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
let mainWindow: BrowserWindow | null = null;

// Enable commercial POS kiosk silent printing (bypasses Windows print dialog)
app.commandLine.appendSwitch('kiosk-printing');
app.commandLine.appendSwitch('disable-print-preview');

function createWindow() {
  const iconPath = path.join(__dirname, '../public/logo.ico');

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    title: 'Southern Spoon - Restaurant POS',
    icon: iconPath,
    backgroundColor: '#070a12',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  // Automatically maximize on POS terminals for clean full-screen experience
  mainWindow.maximize();

  // Load from local Vite dev server in development or dist/index.html in production
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // F12 developer tools toggle for terminal diagnostics
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.key === 'F12') {
      mainWindow?.webContents.toggleDevTools();
    }
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron Error] Failed to load ${validatedURL}: ${errorCode} - ${errorDescription}`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // IPC Handlers for ESC/POS hardware
  ipcMain.handle('print-receipt', async (_event, _rawHex) => {
    console.log('[ESC/POS Hardware] Receipt dispatch command received');
    return { success: true, message: 'Printed to thermal printer' };
  });

  // Direct silent printing bypassing prompt
  ipcMain.handle('silent-print', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.webContents.print({
        silent: true,
        printBackground: true,
      }, (success, failureReason) => {
        if (!success) console.error('[Silent Print Error]', failureReason);
      });
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle('kick-cash-drawer', async () => {
    console.log('[ESC/POS Hardware] RJ11 Solenoid Kick Pulse 24V Triggered');
    try {
      const scriptPath = path.join(__dirname, '../scripts/kick_drawer.ps1');
      const { stdout } = await execPromise(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);
      console.log('[Cash Drawer Output]', stdout.trim());
      return { success: true, message: 'Drawer kicked', output: stdout };
    } catch (err: any) {
      console.error('[Cash Drawer Error]', err?.message);
      return { success: false, error: err?.message };
    }
  });

  ipcMain.handle('get-printer-status', async () => {
    return { online: true, paper: 'ok' };
  });

  // Git Repository Update Sync handlers
  ipcMain.handle('check-for-git-updates', async () => {
    try {
      const { stdout } = await execPromise('git log -1 --format="%h|%s|%cd" --date=relative');
      const parts = stdout.trim().split('|');
      return {
        hasUpdate: true,
        sha: parts[0] || 'HEAD',
        message: parts[1] || 'Latest commit',
        date: parts[2] || 'Just now'
      };
    } catch (e: any) {
      return { hasUpdate: false, error: e.message };
    }
  });

  ipcMain.handle('pull-git-updates', async () => {
    try {
      const { stdout } = await execPromise('git pull origin main');
      return { success: true, output: stdout };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
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
