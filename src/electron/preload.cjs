// preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  login: (payload) => ipcRenderer.invoke("login", payload),
  logout: () => ipcRenderer.invoke("logout"),
  user: (payload) => ipcRenderer.invoke("user", payload),
  print: () => ipcRenderer.send("print"),
  openShow: (payload) => ipcRenderer.send('openShow', payload),

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
