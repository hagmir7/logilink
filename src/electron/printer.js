import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
}



ipcMain.handle('get-printers', async (event) => {
    const printers = await event.sender.getPrintersAsync();
    return printers;
});


ipcMain.handle('print-tickets', async (event, { printerName, tickets }) => {
    for (const ticket of tickets) {
        const ticketWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false
            }
        });

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
                        font-family: monospace;
                        font-size: 14px;
                        text-align: center;
                    }
                    .ticket {
                        padding: 8px;
                        width: 90%;
                    }
                    .header {
                        font-weight: bold;
                        font-size: 16px;
                        margin-bottom: 8px;
                    }
                    .line {
                        margin: 4px 0;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 8px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">***** TICKET *****</div>
                    <div class="line">Order: #${ticket.order}</div>
                    <div class="line">Product: ${ticket.product}</div>
                    <div class="line">Quantity: ${ticket.qty}</div>
                    <div class="line">Total: $${ticket.total}</div>
                    <div class="footer">******************</div>
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
                    margins: { marginType: 'none' }, // Remove default margins
                    pageSize: {
                        width: 60000,  // 6 cm in microns
                        height: 40000  // 4 cm in microns
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


app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createMainWindow(); });
