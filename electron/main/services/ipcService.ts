import { ipcMain, dialog, app } from "electron"
import type { BrowserWindow } from "electron"
import { getSettings, saveSettings } from "./fileService"
import { checkEnvironment, installEnvironment } from '../../../script/script.cjs'
import { join } from "path"
import fs from "fs/promises"
import { logger } from './logService'

function initIpcMain(mainWindow: BrowserWindow) {
  // 将 项目 data 下的书，拷贝到 userData  content目录下
  
  // 添加在createWindow函数之后
  ipcMain.handle('window-minimize', () => {
    logger.debug('Window minimized')
    mainWindow?.minimize()
  })

  ipcMain.handle('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      logger.debug('Window unmaximized')
      mainWindow.unmaximize()
      mainWindow.webContents.send('window-unmaximized')
    } else {
      logger.debug('Window maximized')
      mainWindow?.maximize()
      mainWindow?.webContents.send('window-maximized')
    }
  })

  ipcMain.handle('window-close', () => {
    mainWindow?.close()
  })

  ipcMain.handle('get-settings', async () => {
    const settings = await getSettings()
    return settings
  })

  ipcMain.handle('save-settings', async (_, settings: any) => {
    await saveSettings(settings)
  })

  ipcMain.handle('check-environment', async () => {
    return await checkEnvironment()
  })

  ipcMain.handle('install-environment', async () => {
    return await installEnvironment()
  })

  // Add logging handler
  ipcMain.handle('log', async (_, { level, message, meta }) => {
    switch (level) {
      case 'info':
        await logger.info(message, meta);
        break;
      case 'error':
        await logger.error(message, meta);
        break;
      case 'warn':
        await logger.warn(message, meta);
        break;
      case 'debug':
        await logger.debug(message, meta);
        break;
    }
  });
}

export default initIpcMain
