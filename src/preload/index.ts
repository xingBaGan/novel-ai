import { contextBridge } from 'electron'

// 在这里定义你需要暴露给渲染进程的API
const api = {
  // 示例方法
  versions: process.versions
}

// 使用contextBridge暴露API给渲染进程
contextBridge.exposeInMainWorld('electron', api) 