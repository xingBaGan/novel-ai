import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { fork } from 'child_process'
import type { ChildProcess } from 'child_process'
import initIpcMain from './services/index.js'
import { logger } from './services/logService'

const isDev = !app.isPackaged
const getAssetPath = (...paths: string[]): string => {
  return app.isPackaged
    ? join(process.resourcesPath, 'app.asar', 'out/electron/renderer', ...paths)
    : join(__dirname, '../renderer', ...paths)
}

let mainWindow: BrowserWindow | null = null
let backendProcess: ChildProcess | null = null

function startBackend() {
  const backendPath = app.isPackaged
    ? join(process.resourcesPath, 'app.asar', 'backend/dist/index.js')
    : join(__dirname, '../../../backend/dist/index.js')
  
  logger.info(`Starting backend server from: ${backendPath}`)

  backendProcess = fork(backendPath, [], {
    silent: true, // Pipe stdout/stderr to the parent process
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
  })

  backendProcess.stdout?.on('data', (data) => {
    logger.info(`[Backend]: ${data.toString().trim()}`)
  })

  backendProcess.stderr?.on('data', (data) => {
    logger.error(`[Backend Error]: ${data.toString().trim()}`)
  })

  backendProcess.on('close', (code) => {
    logger.warn(`Backend process exited with code ${code}`)
    // Optionally, you can try to restart it
  })
}

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
  startBackend()
  await createWindow()
})

app.on('window-all-closed', () => {
  logger.info('All windows closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  logger.info('Application will quit, killing backend process.')
  backendProcess?.kill()
})

app.on('activate', () => {
  logger.info('Application activated')
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})