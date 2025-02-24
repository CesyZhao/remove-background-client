import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { vitePluginForArco } from '@arco-plugins/vite-vue'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@common': resolve('src/common'),
        '@core': resolve('src/main/core'),
        '@definitions': resolve('src/main/definitions'),
        '@util': resolve('src/main/util')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: {
        '@common': resolve('src/common')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@common': resolve('src/common'),
        '@assets': resolve('src/renderer/src/assets'),
        '@components': resolve('src/renderer/src/components'),
        '@definitions': resolve('src/renderer/src/definitions'),
        '@directives': resolve('src/renderer/src/directives'),
        '@ipc': resolve('src/renderer/src/ipc'),
        '@utils': resolve('src/renderer/src/utils')
      }
    },
    plugins: [vue(), vitePluginForArco({
      style: 'css'
    })]
  }
})
