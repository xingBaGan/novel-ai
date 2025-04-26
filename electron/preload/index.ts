import { contextBridge, ipcRenderer } from 'electron'

interface Settings {
  repoUrl?: string;
  selectedTemplate?: string;
}

// Add logging interface
interface LogMessage {
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string;
  meta?: any;
}

// 在这里定义你需要暴露给渲染进程的API
const api = {
  versions: process.versions,
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  onMaximize: (callback: () => void) => ipcRenderer.on('window-maximized', callback),
  onUnmaximize: (callback: () => void) => ipcRenderer.on('window-unmaximized', callback),
  removeMaximize: (callback: () => void) => ipcRenderer.removeListener('window-maximized', callback),
  removeUnmaximize: (callback: () => void) => ipcRenderer.removeListener('window-unmaximized', callback),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Settings) => ipcRenderer.invoke('save-settings', settings),
  log: {
    info: (message: string, meta?: any) => 
      ipcRenderer.invoke('log', { level: 'info', message, meta }),
    error: (message: string, meta?: any) => 
      ipcRenderer.invoke('log', { level: 'error', message, meta }),
    warn: (message: string, meta?: any) => 
      ipcRenderer.invoke('log', { level: 'warn', message, meta }),
    debug: (message: string, meta?: any) => 
      ipcRenderer.invoke('log', { level: 'debug', message, meta }),
  }
}

// 使用contextBridge暴露API给渲染进程
contextBridge.exposeInMainWorld('electron', {
  ...api,
  ipcRenderer: {
    on: (channel: string, func: (...args: unknown[]) => void) => {
      ipcRenderer.on(channel, (_event, ...args: unknown[]) => func(...args))
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel)
    }
  }
})
