import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  main: {
    build: {
      outDir: 'out/electron/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts')
        },
        external: [
          'electron',
          ...Object.keys(require('./package.json').dependencies || {})
        ]
      }
    }
  },
  preload: {
    build: {
      outDir: 'out/electron/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts')
        },
        external: [
          'electron',
          ...Object.keys(require('./package.json').dependencies || {})
        ]
      }
    }
  },
  renderer: {
    root: __dirname,
    base: './',
    build: {
      outDir: 'out/electron/renderer',
      assetsDir: '',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        }
      },
      emptyOutDir: true,
    },
    publicDir: 'public',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    plugins: [react()]
  }
}) 