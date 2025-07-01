import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { getPreloadPath, isDev } from "./util.js";
import createLoginWindow from "./windows/loginWindow.js";
import { createShowWindow } from "./windows/showWindow.js";
import pkg from 'electron-updater';
const { autoUpdater } = pkg;


let showWindow;


let mainWindow;
let loginWindow;


const createMainWindow = () => {
    const mainWindow = new BrowserWindow({
        title: "Production - INTERCOCINA",
        width: 1300,
        height: 800,
        webPreferences: {
            preload: getPreloadPath(),
            nodeIntegration: true,
        },
    });

    
    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), 'react-dist', 'index.html'));
    }

    return mainWindow;
};

ipcMain.handle('login', async (event, data) => {
    try {
        if (data.access_token) {
            if (loginWindow && !loginWindow.isDestroyed()) {
                loginWindow.close();
            }

            mainWindow = createMainWindow();
            return true;
        }
        return null;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
});

ipcMain.handle('logout', async () => {
    try {
        if (mainWindow) {
            mainWindow.close();
        }

        if (!loginWindow || loginWindow.isDestroyed()) {
            loginWindow = createLoginWindow();
        } else {
            loginWindow.show();
        }

        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('user', async (event, data) => {
    try {

        if (data.access_token) {
            if (loginWindow && !loginWindow.isDestroyed()) {
                loginWindow.close();
            }

            mainWindow = createMainWindow();
            return true;
        }
        return null;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
});


app.on('ready', () => {
    loginWindow = createLoginWindow();

    if (!isDev()) {
        autoUpdater.checkForUpdatesAndNotify();
    }

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        loginWindow = createLoginWindow();
    }
});

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});



ipcMain.on('openShow', async (event, preload) => {
    
    try {
        if (!showWindow || showWindow.isDestroyed()) {
            showWindow = createShowWindow(preload);
        } else {
            showWindow.show();
        }

        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
});



// Print Window


let printWindow;

ipcMain.on('print', () => {
  printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  printWindow.loadURL('http://localhost:5123');

  printWindow.webContents.on('did-fail-load', (_, __, errorDescription) => {
    console.error('Failed to load print window:', errorDescription);
  });
});




ipcMain.on("print-content", (event, htmlContent) => {
  const printWindow = new BrowserWindow({ show: false });
  printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  printWindow.webContents.on("did-finish-load", () => {
    printWindow.webContents.print({}, (success) => {
      if (!success) console.log("Print failed");
      printWindow.close();
    });
  });
});







