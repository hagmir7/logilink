import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { getPreloadPath, isDev } from '../util.js';

export default function createLoginWindow() {
    let loginWindow = new BrowserWindow({
        width: 400,
        height: 600,
        // frame: false,
        // resizable: false,
        webPreferences: {
            preload: getPreloadPath(),
        }
    });

    // loginWindow

    if (isDev()) {
        loginWindow.loadURL('http://localhost:5123/#login');
    } else {
        loginWindow.loadFile(path.join(app.getAppPath(), 'react-dist', 'index.html'), {
            hash: '/login'
        });
    }

    // loginWindow.on('maximize', () => {
    //     loginWindow.unmaximize();
    // });

    ipcMain.on('registerUser', (event, payload) => {
        new UserController().create(payload);
    });

    ipcMain.on('sendFrameAction', (event, payload) => {
        switch (payload) {
            case "CLOSE":
                loginWindow.close()
                break;
            case "MINIMIZE":
                loginWindow.minimize()
                break;
            default:
                // loginWindow.maximize()
                break;
        }
    })

    return loginWindow;
}