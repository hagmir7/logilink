import { BrowserWindow, app } from 'electron';
import path from 'path';
import { getPreloadPath, isDev } from '../util.js';

let mainWindowReference = null;
let childWindow = null;

export const setMainWindow = (window) => {
    mainWindowReference = window;
};

export const createShowWindow = (routeUrl) => {
    if (childWindow) return childWindow;

    childWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        // resizable: false,
        // parent: mainWindowReference, 
        // modal: true,
        // minimizable: false,
        // alwaysOnTop: true,
        webPreferences: {
            preload: getPreloadPath()
        }
    });

    childWindow.setMenu(null);

    if (isDev()) {
        childWindow.loadURL(`http://localhost:5123/#${routeUrl}`);
        
    } else {
         childWindow.loadFile(path.join(app.getAppPath(), 'react-dist', 'index.html'), {
            hash: routeUrl
        });
    }

    childWindow.on('closed', () => {
        childWindow = null;
    });

    return childWindow;
};
