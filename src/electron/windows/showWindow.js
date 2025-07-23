import { BrowserWindow, app } from 'electron';
import path from 'path';
import { getPreloadPath, isDev } from '../util.js';

let mainWindowReference = null;
let childWindow = null;

export const setMainWindow = (window) => {
    mainWindowReference = window;
};

export const createShowWindow = (data) => {
    if (childWindow) return childWindow;

    childWindow = new BrowserWindow({
        width: data.width ?? 1200,
        height: data.height ?? 700,
        // resizable: false,
        // parent: mainWindowReference, 
        // modal: true,
        // minimizable: false,
        // alwaysOnTop: true,
        webPreferences: {
            preload: getPreloadPath()
        }
    });

    // childWindow.setMenu(null);

    if (isDev()) {
        childWindow.loadURL(`http://localhost:5123/#${data.url}`);
        
    } else {
         childWindow.loadFile(path.join(app.getAppPath(), 'react-dist', 'index.html'), {
            hash: data.url
        });
    }

    childWindow.on('closed', () => {
        childWindow = null;
    });

    return childWindow;
};
