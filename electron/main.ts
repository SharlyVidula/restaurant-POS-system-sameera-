import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
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
  // IPC Handlers for ESC/POS hardware
  ipcMain.handle('print-receipt', async (_event, rawHex: string) => {
    try {
      console.log(`[ESC/POS Hardware] Receipt dispatch command received (${rawHex ? rawHex.length : 0} bytes)`);
      if (rawHex && rawHex.trim()) {
        const tempPath = path.join(os.tmpdir(), 'pos_slip_dump.hex');
        await fs.promises.writeFile(tempPath, rawHex.trim(), 'utf8');
        const scriptPath = path.join(__dirname, '../scripts/print_raw.ps1');
        const { stdout } = await execPromise(`powershell -ExecutionPolicy Bypass -Command "$hex = Get-Content -Raw '${tempPath}'; & '${scriptPath}' -HexDump $hex"`);
        console.log('[ESC/POS Hardware Output]', stdout.trim());
        return { success: true, message: stdout.trim() };
      }
    } catch (err: any) {
      console.error('[ESC/POS Hardware Error]', err?.message);
      return { success: false, error: err?.message };
    }
    return { success: true, message: 'Dispatched to printer' };
  });

  // Direct silent printing bypassing prompt with automatic device name resolution
  ipcMain.handle('silent-print', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      try {
        const printers = await win.webContents.getPrintersAsync();
        const targetPrinter = printers.find(p => p.isDefault) || 
                              printers.find(p => p.name.toUpperCase().includes('XP') || p.name.toUpperCase().includes('POS') || p.name.toUpperCase().includes('THERMAL')) || 
                              printers[0];
        const deviceName = targetPrinter ? targetPrinter.name : '';
        console.log(`[Silent Print] Target device: "${deviceName}"`);

        win.webContents.print({
          silent: true,
          printBackground: true,
          deviceName: deviceName,
          margins: { marginType: 'none' }
        }, (success, failureReason) => {
          if (!success) {
            console.error('[Silent Print Error]', failureReason);
          } else {
            console.log('[Silent Print Success] Dispatched to', deviceName);
          }
        });
        return { success: true };
      } catch (e: any) {
        console.error('[Silent Print Exception]', e.message);
      }
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

  // Save Non-Editable Official Audit Report to Computer Storage
  ipcMain.handle('save-report-file', async (_event, data: { subfolder: string; filename: string; content: string }) => {
    try {
      const documentsPath = path.join(os.homedir(), 'Documents', 'SouthernSpoon_Reports', data.subfolder || 'General');
      await fs.promises.mkdir(documentsPath, { recursive: true });
      const targetFilePath = path.join(documentsPath, data.filename);

      // Write file content (UTF-8)
      await fs.promises.writeFile(targetFilePath, data.content, 'utf8');

      // Set read-only attribute on Windows so it cannot be casually modified
      try {
        if (process.platform === 'win32') {
          await execPromise(`attrib +R "${targetFilePath}"`);
        } else {
          fs.chmodSync(targetFilePath, 0o444);
        }
      } catch (attrErr) {
        console.warn('Could not set read-only attribute', attrErr);
      }

      console.log('[Audit Report Saved]', targetFilePath);
      return {
        success: true,
        filePath: targetFilePath,
        message: `Saved official report to ${targetFilePath}`
      };
    } catch (err: any) {
      console.error('[Save Report Error]', err);
      return { success: false, error: err.message };
    }
  });

  // Open Reports Folder in Windows File Explorer
  ipcMain.handle('open-reports-folder', async (_event, subfolder?: string) => {
    try {
      const documentsPath = path.join(os.homedir(), 'Documents', 'SouthernSpoon_Reports', subfolder || '');
      await fs.promises.mkdir(documentsPath, { recursive: true });
      await shell.openPath(documentsPath);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
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
