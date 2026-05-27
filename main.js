const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { autoUpdater } = require('electron-updater');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'src', 'assets', 'Arabic Radio.ico')
  });

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.setMenuBarVisibility(false);

  // ========== تسجيل الاختصارات العالمية (globalShortcut) ==========
  // Ctrl+Shift+Numpad1..4 للتايمر
  globalShortcut.register('CommandOrControl+Shift+Numpad1', () => {
    mainWindow.webContents.send('shortcut-triggered', 'ctrl+shift+numpad1', 20);
  });
  globalShortcut.register('CommandOrControl+Shift+Numpad2', () => {
    mainWindow.webContents.send('shortcut-triggered', 'ctrl+shift+numpad2', 40);
  });
  globalShortcut.register('CommandOrControl+Shift+Numpad3', () => {
    mainWindow.webContents.send('shortcut-triggered', 'ctrl+shift+numpad3', 60);
  });
  globalShortcut.register('CommandOrControl+Shift+Numpad4', () => {
    mainWindow.webContents.send('shortcut-triggered', 'ctrl+shift+numpad4', 80);
  });
  
  // Ctrl+Numpad1..5 للتبويبات
  globalShortcut.register('CommandOrControl+Numpad1', () => {
    mainWindow.webContents.send('shortcut-triggered', 'ctrl+numpad1');
  });
  globalShortcut.register('CommandOrControl+Numpad2', () => {
    mainWindow.webContents.send('shortcut-triggered', 'ctrl+numpad2');
  });
  globalShortcut.register('CommandOrControl+Numpad3', () => {
    mainWindow.webContents.send('shortcut-triggered', 'ctrl+numpad3');
  });
  globalShortcut.register('CommandOrControl+Numpad4', () => {
    mainWindow.webContents.send('shortcut-triggered', 'ctrl+numpad4');
  });
  globalShortcut.register('CommandOrControl+Numpad5', () => {
    mainWindow.webContents.send('shortcut-triggered', 'ctrl+numpad5');
  });
  
  // Ctrl+O
  globalShortcut.register('CommandOrControl+O', () => {
    mainWindow.webContents.send('shortcut-triggered', 'ctrl+o');
  });

  // ========== احتياط: اعتراض الاختصارات عبر before-input-event (معطل لتجنب التداخل) ==========
  /*
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const ctrl = input.control;
    const shift = input.shift;
    const key = input.key.toUpperCase();

    if (ctrl && shift && key.startsWith('NUMPAD') && ['NUMPAD1','NUMPAD2','NUMPAD3','NUMPAD4'].includes(key)) {
      event.preventDefault();
      let timerMinutes = 0;
      switch (key) {
        case 'NUMPAD1': timerMinutes = 20; break;
        case 'NUMPAD2': timerMinutes = 40; break;
        case 'NUMPAD3': timerMinutes = 60; break;
        case 'NUMPAD4': timerMinutes = 80; break;
      }
      mainWindow.webContents.send('shortcut-triggered', `ctrl+shift+numpad${key.slice(-1)}`, timerMinutes);
    }
  });
  */
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// ========== دوال إدارة اللغة ==========
ipcMain.handle('get-config-language', () => {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  try {
    if (require('fs').existsSync(configPath)) {
      const data = require('fs').readFileSync(configPath, 'utf8');
      const config = JSON.parse(data);
      return config.language || 'ar';
    }
  } catch (err) {
    console.error('Error reading config.json:', err);
  }
  return null;
});

ipcMain.handle('save-config-language', async (event, lang) => {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  try {
    await fs.writeFile(configPath, JSON.stringify({ language: lang }, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving config.json:', err);
    return false;
  }
});

// ========== دوال التحكم الأساسية ==========
ipcMain.on('set-always-on-top', (event, flag) => {
  if (mainWindow) mainWindow.setAlwaysOnTop(flag);
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('set-window-size', (event, width, height) => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    }
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setSize(width, height);
      }
    }, 50);
  }
});

// ========== دوال دعم الوضع المصغر ==========
ipcMain.handle('get-current-window-size', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const [width, height] = mainWindow.getSize();
    return { width, height };
  }
  return { width: 950, height: 700 };
});

ipcMain.handle('is-full-screen', () => {
  return mainWindow ? mainWindow.isFullScreen() : false;
});

ipcMain.handle('set-full-screen', (event, flag) => {
  if (mainWindow) {
    mainWindow.setFullScreen(flag);
  }
});

ipcMain.handle('is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.handle('unmaximize', () => {
  if (mainWindow && mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  }
});

ipcMain.handle('get-always-on-top', () => {
  return mainWindow ? mainWindow.isAlwaysOnTop() : false;
});

// ========== دوال الحصول على وتعيين موضع النافذة ==========
ipcMain.handle('get-window-position', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const [x, y] = mainWindow.getPosition();
    return { x, y };
  }
  return { x: 0, y: 0 };
});

ipcMain.handle('set-window-position', (event, x, y) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setPosition(x, y);
  }
});

// ========== دالة الحصول على مسار مجلد الأصول ==========
ipcMain.handle('get-assets-dir', () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets');
  } else {
    return path.join(__dirname, 'src', 'assets');
  }
});

// ========== دوال أيقونات المستخدم ==========
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('file-exists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('save-file', async (event, filePath, data) => {
  try {
    await fs.writeFile(filePath, data);
    return true;
  } catch (err) {
    console.error('Error saving file:', err);
    return false;
  }
});

ipcMain.handle('mkdir', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (err) {
    console.error('Error creating directory:', err);
    return false;
  }
});

// ========== دوال التحديثات ==========
ipcMain.handle('check-for-updates', () => {
  autoUpdater.checkForUpdates();
});

ipcMain.handle('is-packaged', () => app.isPackaged);

// ========== معالج لإعادة التشغيل بعد التحديث ==========
ipcMain.on('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

// ========== التحديث التلقائي ==========
app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update_available', info);
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) mainWindow.webContents.send('update_downloaded', info);
  });
  
  autoUpdater.on('update-not-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update_not_available', info);
  });
  
  autoUpdater.on('error', (err) => {
    if (mainWindow) mainWindow.webContents.send('update_error', err);
  });
});