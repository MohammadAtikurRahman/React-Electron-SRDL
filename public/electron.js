const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

let backendProcess;
let isReloaded = false;

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 620,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      contentSecurityPolicy: "default-src 'self'; script-src 'self'",
      preload: path.join(__dirname, 'preload.js')

    },
  });

  win.on('close', (event) => {
    event.preventDefault();
    win.minimize();
  });

  const loadURL = () => {
    win.loadURL(
      isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`
    );
  };

  if (isDev) {
    setTimeout(loadURL, 3000);
  } else {
    loadURL();
  }

  // Reload the window once, 3 seconds after the 'ready-to-show' event
  win.webContents.on('did-fail-load', () => {
    console.log('Failed to load the URL, retrying...');
    loadURL();
  });


  win.once('ready-to-show', () => {
    setTimeout(() => {
      if (!isReloaded) {
        win.reload();
        isReloaded = true;
      }
    }, 3000);
  });
}

app.whenReady().then(() => {
  backendProcess = require('child_process').fork(
    path.join(__dirname, '../backend/server.js'),
    {
      env: { ...process.env, MONGO_URI: process.env.MONGO_URI },
    }
  );

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    backendProcess.kill();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
