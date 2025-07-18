import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { getPreloadPath, isDev } from "./util.js";
import createLoginWindow from "./windows/loginWindow.js";
import { createShowWindow } from "./windows/showWindow.js";
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import bwipjs from 'bwip-js';

async function generateBarcodeBase64(data) {
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer({
            bcid: 'code128',       // Barcode type
            text: data.toString(), // Text to encode
            scale: 3,              // 3x scaling factor
            height: 10,            // Bar height
            includetext: false,    // Show text below barcode
            textxalign: 'center',  // Center the text
        }, (err, png) => {
            if (err) {
                reject(err);
            } else {
                const base64 = `data:image/png;base64,${png.toString('base64')}`;
                resolve(base64);
            }
        });
    });
}



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
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      sandbox: false,
    },
  });

  printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  printWindow.webContents.on("did-finish-load", () => {
    const printOptions = {
      silent: false,                  // Set to true to skip print dialog
      printBackground: true,          // Print CSS backgrounds
      deviceName: '',                 // Specify printer by name (e.g., 'Brother HL-2270DW series')
      color: true,                    // Print in color
      margins: {
        marginType: 'none',        // 'default', 'none', 'printableArea', 'custom'
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      landscape: false,               // false = portrait, true = landscape
      pagesPerSheet: 1,
      collate: true,
      copies: 1,
      dpi: {
        horizontal: 600,
        vertical: 600,
      },
      scaleFactor: 100,               // 100% scaling
      pageSize: 'A4',                 // Could also be 'Letter', { height: 100000, width: 100000 }, etc.
    };

    printWindow.webContents.print(printOptions, (success, errorType) => {
      if (!success) {
        console.error("Print failed:", errorType);
      }
      printWindow.close();
    });
  });
});


// ---- Tiket

ipcMain.handle('get-printers', async (event) => {
    const printers = await event.sender.getPrintersAsync();
    return printers;
});


ipcMain.handle('print-tickets', async (event, { printerName, tickets }) => {
    for (const ticket of tickets.doclignes) {
        const ticketWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        console.log(ticket.line.di);

        const barcodeImage = await generateBarcodeBase64(ticket.line.id);

        const ticketHtml = `
         <html>
            <head>
                <style>
                    html, body {
                        width: 6cm;
                        height: 4cm;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-family: monospace, monospace;
                        font-size: 16px;
                        text-align: center;
                        background: white;
                        -webkit-print-color-adjust: exact;
                    }
                    .ticket {
                        box-sizing: border-box;
                    }
            
                    .line {
                        margin: 8px 0;
                        font-weight: 700;
                        font-size: 14px;
                        border-bottom: 1.5px solid #000;
                        padding-bottom: 4px;
                    }
                    .footer {
                        margin-top: 12px;
                        font-weight: 900;
                        font-size: 17px;
                    }
                    .barcode {
                        padding: 0;
                    }
                    .barcode img {
                        width: 100%;
                        height: auto;
                        max-height: 90px;
                        object-fit: contain;
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="barcode">
                        <img src="${barcodeImage}" />
                    </div>
                    <div class="line">${ticket.DO_Piece} = ${tickets.docentete.DO_Tiers}</div>
                    <div class="line">${ticket.article.AR_Ref} (${parseFloat(ticket.line.quantity.toFixed(3))})</div>
                </div>
            </body>
        </html>

        `;

        ticketWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(ticketHtml)}`);

        await new Promise(resolve => {
            ticketWindow.webContents.on('did-finish-load', () => {
                ticketWindow.webContents.print({
                    silent: true,
                    deviceName: printerName,
                    margins: { marginType: 'none' },
                    pageSize: {
                        width: 60000,
                        height: 40000
                    }
                }, (success, errorType) => {
                    if (!success) console.error('Print failed:', errorType);
                    ticketWindow.close();
                    resolve();
                });
            });
        });
    }
});
