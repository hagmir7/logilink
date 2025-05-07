import { app, BrowserWindow } from 'electron';
import path from 'path';
import { getPreloadPath, isDev } from '../util.js';

export default function createLoginWindow() {
    let loginWindow = new BrowserWindow({
        width: 600,
        height: 600,
        // frame: false,
        // resizable: false,
        webPreferences: {
            preload: getPreloadPath(),
        }
    });

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




    return loginWindow;
}