const electron = require("electron");


electron.contextBridge.exposeInMainWorld('electron', {
    login: (payload) => electron.ipcRenderer.invoke('login', payload),
    logout: () => electron.ipcRenderer.invoke("logout"),
    user: (payload) => electron.ipcRenderer.invoke('user', payload),
})