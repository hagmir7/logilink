import { app, BrowserWindow } from 'electron';
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

    
    childWindow.setMenu(null);
    if (isDev()) {
        childWindow.loadURL(`http://localhost:5123${routeUrl}`);
    } else {
        // Use file:// protocol instead of loadFile
        const filePath = path.join(app.getAppPath(), 'react-dist', 'index.html');
        childWindow.loadURL(`file://${filePath}#${routeUrl}`);
    }

    childWindow.on('closed', () => {
        childWindow = null;
    });

    return childWindow;
};