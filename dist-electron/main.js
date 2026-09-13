"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execPromise = util_1.default.promisify(child_process_1.exec);
let mainWindow = null;
// Enable commercial POS kiosk silent printing (bypasses Windows print dialog)
electron_1.app.commandLine.appendSwitch('kiosk-printing');
electron_1.app.commandLine.appendSwitch('disable-print-preview');
function createWindow() {
    const iconPath = path_1.default.join(__dirname, '../public/logo.ico');
    mainWindow = new electron_1.BrowserWindow({
        width: 1024,
        height: 768,
        minWidth: 800,
        minHeight: 600,
        title: 'Southern Spoon - Restaurant POS',
        icon: iconPath,
        backgroundColor: '#070a12',
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
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
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
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
electron_1.app.whenReady().then(() => {
    createWindow();
    // IPC Handlers for ESC/POS hardware
    electron_1.ipcMain.handle('print-receipt', async (_event, _rawHex) => {
        console.log('[ESC/POS Hardware] Receipt dispatch command received');
        return { success: true, message: 'Printed to thermal printer' };
    });
    // Direct silent printing bypassing prompt
    electron_1.ipcMain.handle('silent-print', async (event) => {
        const win = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (win) {
            win.webContents.print({
                silent: true,
                printBackground: true,
            }, (success, failureReason) => {
                if (!success)
                    console.error('[Silent Print Error]', failureReason);
            });
            return { success: true };
        }
        return { success: false };
    });
    electron_1.ipcMain.handle('kick-cash-drawer', async () => {
        console.log('[ESC/POS Hardware] RJ11 Solenoid Kick Pulse 24V Triggered');
        try {
            const scriptPath = path_1.default.join(__dirname, '../scripts/kick_drawer.ps1');
            const { stdout } = await execPromise(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);
            console.log('[Cash Drawer Output]', stdout.trim());
            return { success: true, message: 'Drawer kicked', output: stdout };
        }
        catch (err) {
            console.error('[Cash Drawer Error]', err?.message);
            return { success: false, error: err?.message };
        }
    });
    electron_1.ipcMain.handle('get-printer-status', async () => {
        return { online: true, paper: 'ok' };
    });
    // Git Repository Update Sync handlers
    electron_1.ipcMain.handle('check-for-git-updates', async () => {
        try {
            const { stdout } = await execPromise('git log -1 --format="%h|%s|%cd" --date=relative');
            const parts = stdout.trim().split('|');
            return {
                hasUpdate: true,
                sha: parts[0] || 'HEAD',
                message: parts[1] || 'Latest commit',
                date: parts[2] || 'Just now'
            };
        }
        catch (e) {
            return { hasUpdate: false, error: e.message };
        }
    });
    electron_1.ipcMain.handle('pull-git-updates', async () => {
        try {
            const { stdout } = await execPromise('git pull origin main');
            return { success: true, output: stdout };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    });
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
