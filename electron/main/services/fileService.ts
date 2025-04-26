import fs, { copyFile, mkdir, readdir, readFile, writeFile } from 'fs/promises'
import { join, extname } from 'path'
import { app } from 'electron'

// 支持的文件类型
const SUPPORTED_EXTENSIONS = ['.md', '.mdx', '.txt']
const initialSettings = {
  repoUrl: ''
}


export async function getSettings(): Promise<Record<string, any>> {
  const settingsPath = join(app.getPath('userData'), 'settings.json');
  try {
    const data = await readFile(settingsPath, 'utf-8');
    const settings = JSON.parse(data);
    return settings;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      // File does not exist, create a new one with default settings
      const defaultSettings = {
        repoUrl: '',
        selectedTemplate: ''
      };
      await fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    } else {
      console.error(`Error reading settings from ${settingsPath}:`, error);
      throw error;
    }
  }
}

export async function saveSettings(settings: any): Promise<void> {
  const settingsPath = join(app.getPath('userData'), 'settings.json');
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
}