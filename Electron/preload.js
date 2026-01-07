const { contextBridge, ipcMain, ipcRenderer } = require('electron');

/**
 * Preload script - exposes safe APIs to the renderer process
 */

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Store operations (for persisting app state)
  storeSet: (key, value) => ipcRenderer.send('store-set', key, value),
  storeGet: (key) => ipcRenderer.sendSync('store-get', key),

  // File dialogs
  openFile: (options) => ipcRenderer.invoke('dialog-open', options),
  saveFile: (options) => ipcRenderer.invoke('dialog-save', options),

  // API communication to backend
  callAPI: async (method, endpoint, data) => {
    try {
      const baseURL = 'http://localhost:5000';
      const url = `${baseURL}${endpoint}`;
      
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);
      const responseData = await response.json();
      
      return {
        success: response.ok,
        status: response.status,
        data: responseData
      };
    } catch (error) {
      console.error('API Call Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get version
  getVersion: () => process.env.npm_package_version || '1.0.0',
});
