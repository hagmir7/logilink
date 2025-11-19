import { app, BrowserWindow } from 'electron';
import path from 'path';
import { getPreloadPath, isDev } from '../util.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default function createLoginWindow() {
    let loginWindow = new BrowserWindow({
        width: 600,
        height: 600,
        frame: true,
        icon: path.join(__dirname, '..', 'inter.png'),
        // resizable: false,
        webPreferences: {
            preload: getPreloadPath(),
        }
    });

    //  loginWindow.setMenu(null);

    if (isDev()) {
        loginWindow.loadURL('http://localhost:5123/#login');
    } else {
        loginWindow.loadFile(path.join(app.getAppPath(), 'react-dist', 'index.html'), {
            hash: '/login'
        });
    }

    loginWindow.on('maximize', () => {
        loginWindow.unmaximize();
    });




    return loginWindow;
}