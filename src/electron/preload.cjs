const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  login: (payload) => ipcRenderer.invoke('login', payload),
  logout: () => ipcRenderer.invoke("logout"),
  user: (payload) => ipcRenderer.invoke('user', payload),
  print: () => ipcRenderer.send('print'),
  notifyPrintReady: () => ipcRenderer.send('print-ready'),
  openShow: (payload) => ipcRenderer.send('openShow', payload),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printTickets: (printerName, tickets) => ipcRenderer.invoke('print-tickets', { printerName, tickets }),
  printPaletteTickets: (printerName, tickets) => ipcRenderer.invoke('print-palette-tickets', { printerName, tickets }),

  ipcRenderer: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    on: (channel, func) => {
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  },

  
});



ipcRenderer.on('update_available', () => {
  alert('Mise à jour disponible. Téléchargement en cours...');
});

ipcRenderer.on('update_downloaded', () => {
  const restart = confirm('Mise à jour téléchargée. Redémarrer maintenant ?');
  if (restart) {
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('restart_app');
  }
})