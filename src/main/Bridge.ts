import { ipcMain, dialog } from 'electron'
import http from 'http'
import os from 'os'
import { checkPythonInstallStatus, installRemBG } from './env'
import { EnvStatus } from './definitions/env'

class Bridge {
  webContents!: Electron.WebContents

  setupEnvChecker() {
    ipcMain.on('env-check', async () => {
      try {
        const pythonInsalled = await checkPythonInstallStatus()
        this.webContents.send('env-check-reply', pythonInsalled)
        this.webContents.send('env-check-reply', EnvStatus.RembgIsInstalling)
        const result = await installRemBG('rembg[cli]')
        this.webContents.send('env-check-reply', result)
      } catch (e) {
        this.webContents.send('env-check-reply', e)
      }
    })
  }

  setupDictoryPicker() {
    ipcMain.on('choose-target-path', async () => {
      try {
        const result = await dialog.showOpenDialog({
          properties: ['openDirectory']
        })
        if (!result.canceled) {
          this.webContents.send('target-path-chosen', result.filePaths[0])
        }
      } catch (e) {
        console.error(e)
      }
    })
  }

  setupPythonDownload() {
    const isWin = os.platform().includes('win');
    const baseURL = 'https://www.python.org/ftp/python/3.10.10'
    ipcMain.on('choose-target-path', async () => {
      http.get(`${baseURL}/${isWin ? 'python-3.10.10-amd64.exe' : 'python-3.10.10-macos11.pkg'}`, (res) => {
        // https://blog.csdn.net/qq_42172829/article/details/122090748
      })
    })
  }
}

const bridge = new Bridge()

export default bridge
