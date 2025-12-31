const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const config = require('../config/paths');

let frontendProcess;
let backendProcess;

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Start the backend server
  const backendPath = config.BACKEND_PATH;
  backendProcess = spawn('npm', ['start'], { cwd: backendPath, stdio: 'inherit' });

  // Start the frontend server
  const frontendPath = config.FRONTEND_PATH;
  frontendProcess = spawn('npm', ['start'], { cwd: frontendPath, stdio: 'inherit' });

  // Wait a bit for the servers to start
  setTimeout(() => {
    const url = process.env.FRONTEND_URL || 'http://localhost:3000';
    mainWindow.loadURL(url);
  }, 5000);

  // Optionally open devtools when env set
  if (process.env.ELECTRON_DEBUG === 'true') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});

app.on('window-all-closed', function () {
  if (frontendProcess) {
    frontendProcess.kill();
  }
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit()
});
