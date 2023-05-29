const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

let backendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 620,
    webPreferences: {
      nodeIntegration: true,
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
}

app.whenReady().then(() => {
  backendProcess = require('child_process').fork(
    path.join(__dirname, '../backend/server.js'),
    {
      env: { ...process.env, MONGODB_URI: process.env.MONGODB_URI },
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
