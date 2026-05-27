const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  log: (msg) => console.log("من preload:", msg),
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag),
  getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top'),
  closeApp: () => ipcRenderer.send('close-app'),
  setWindowSize: (width, height) => ipcRenderer.send('set-window-size', width, height),
  getConfigLanguage: () => ipcRenderer.invoke('get-config-language'),
  saveConfigLanguage: (lang) => ipcRenderer.invoke('save-config-language', lang),
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  quitAndInstall: () => ipcRenderer.send('quit-and-install'),
  getCurrentWindowSize: () => ipcRenderer.invoke('get-current-window-size'),
  isFullScreen: () => ipcRenderer.invoke('is-full-screen'),
  setFullScreen: (flag) => ipcRenderer.invoke('set-full-screen', flag),
  getAssetsDir: () => ipcRenderer.invoke('get-assets-dir'),
  onShortcutTriggered: (callback) => ipcRenderer.on('shortcut-triggered', (event, data) => callback(data)),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  fileExists: (filePath) => ipcRenderer.invoke('file-exists', filePath),
  saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
  mkdir: (dirPath) => ipcRenderer.invoke('mkdir', dirPath),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  isPackaged: () => ipcRenderer.invoke('is-packaged'),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  setWindowPosition: (x, y) => ipcRenderer.invoke('set-window-position', x, y),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update_not_available', callback),
onUpdateError: (callback) => ipcRenderer.on('update_error', callback)
});