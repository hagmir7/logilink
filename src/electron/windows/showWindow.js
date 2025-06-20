import { app, BrowserWindow, ipcMain } from 'electron';
import path from "path";
import { getPreloadPath, isDev } from '../util.js';

let mainWindow;
let childWindow;

export const createShowWindow = (routeUrl) => { 
    if (childWindow) return childWindow;

    childWindow = new BrowserWindow({
        width: 700,
        height: 600,
        resizable: false,
        parent: mainWindow,
        modal: true,
        minimizable: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: getPreloadPath()
        }
    });

    //childWindow.webContents.openDevTools()
    childWindow.setMenu(null);
    if (isDev()) {
        childWindow.loadURL(`http://localhost:5123${routeUrl}`);
    } else {
        childWindow.loadFile(
            path.join(app.getAppPath(), 'react-dist', "index.html"),
            { hash: routeUrl }
        );
    }

    childWindow.on('closed', () => {
        childWindow = null;
    });

    return childWindow;
};