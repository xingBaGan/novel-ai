import { Folder } from '../../packages/types'

interface IpcRenderer {
  on(channel: string, func: (...args: unknown[]) => void): void;
  removeAllListeners(channel: string): void;
}

interface FileData {
  path: string;
  content: string;
}

interface Settings {
  repoUrl?: string;
  selectedTemplate?: string;
}

interface ElectronAPI {
  versions: NodeJS.ProcessVersions;
  ipcRenderer: IpcRenderer;
  minimize: () => void
  maximize: () => void
  close: () => void
  onMaximize: (callback: () => void) => void
  onUnmaximize: (callback: () => void) => void
  removeMaximize: (callback: () => void) => void
  removeUnmaximize: (callback: () => void) => void
  getSettings: () => Promise<Settings>
  saveSettings: (settings: Settings) => Promise<void>
  log: {
    info: (message: string, meta?: any) => void;
    error: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
    debug: (message: string, meta?: any) => void;
  }
  checkEnvironment: () => Promise<{ needsInstall: boolean }>
  installEnvironment: () => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {} 