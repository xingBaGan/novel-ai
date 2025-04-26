import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import initIpcMain from './services/index.js'
import { logger } from './services/logService'

const isDev = !app.isPackaged
const getAssetPath = (...paths: string[]): string => {
  return app.isPackaged
    ? join(process.resourcesPath, 'app.asar', 'out/electron/renderer', ...paths)
    : join(__dirname, '../renderer', ...paths)
}

let mainWindow: BrowserWindow | null = null

async function createWindow() {
  logger.info('Creating main window')
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: false
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    logger.debug('Loaded development URL')
  } else {
    await mainWindow.loadFile(getAssetPath('index.html'))
    logger.debug('Loaded production HTML file')
  }

  mainWindow.webContents.openDevTools({
    mode: 'detach'
  })

  initIpcMain(mainWindow)
  logger.info('Main window created successfully')
}

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise })
})

app.whenReady().then(async () => {
  logger.info('Application starting')
  await createWindow()
})

app.on('window-all-closed', () => {
  logger.info('All windows closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  logger.info('Application activated')
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})