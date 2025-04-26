import { app } from "electron"
import path from "path"

  // 添加获取根路径的函数
  export function getRootPath() {
    // 在开发环境中 
    if (process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'preview') {
        return process.cwd()
    }
    // 在生产环境中
    return path.join(app.getAppPath(), '../')
  }
  
  // 获取 package.json 的路径
  export function getPackageJsonPath() {
    return path.join(getRootPath(), 'package.json')
  }