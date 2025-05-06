const electron = require("electron");


electron.contextBridge.exposeInMainWorld('electron', {
    login: (payload) => electron.ipcRenderer.invoke('login', payload),
})