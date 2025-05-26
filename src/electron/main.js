import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { getPreloadPath, isDev } from "./util.js";
import createLoginWindow from "./windows/loginWindow.js";


let mainWindow;
let loginWindow;

const createMainWindow = () => {
    const mainWindow = new BrowserWindow({
        title: "Production - INTERCOCINA",
        width: 1300,
        height: 800,
        webPreferences: {
            preload: getPreloadPath(),
            // contextIsolation: true,
            nodeIntegration: true,
            // sandbox: false,
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
