import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { setupIpcHandlers } from './ipc';
import { getAppConfig } from './config/appConfig';
import { spawnService, killAllServices } from './services/processManager';

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  app.setName('Stackly');
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../public/Stackly.png'));
  }
}

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#050B14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/Stackly.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  setupIpcHandlers();
  createWindow();
  
  const config = getAppConfig();
  if (config.autoStartServices) {
    // Only auto-start main services
    spawnService('apache', []);
    spawnService('mysql', []);
    spawnService('php', []);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', async (e) => {
  if (!isQuitting) {
    e.preventDefault();
    isQuitting = true;
    console.log('Shutting down services gracefully...');
    await killAllServices();
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
