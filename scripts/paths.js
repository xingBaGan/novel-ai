import { join } from 'path'
import os from 'os'
import data from '../package.json'
// 获取用户数据目录
function getUserDataPath() {
  const homedir = os.homedir()
  
  switch (process.platform) {
    case 'win32':
      return join(homedir, 'AppData', 'Roaming', data.name)
    case 'darwin':
      return join(homedir, 'Library', 'Application Support', data.name)
    case 'linux':
      return join(homedir, '.config', data.name)
    default:
      return join(homedir, '.' + data.name)
  }
}

export const paths = {
  userData: getUserDataPath(),
  content: join(getUserDataPath(), 'content')
} 