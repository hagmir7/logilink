import { app, BrowserWindow } from "electron";
import path from "path";
import { getPreloadPath, isDev } from "./util.js";


app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        title: "Production - INTERCOCINA",
        width: 1300,
        height: 800,
        webPreferences: {
            preload: getPreloadPath()
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5123')
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), "react-dist/index.html"));
    }
})