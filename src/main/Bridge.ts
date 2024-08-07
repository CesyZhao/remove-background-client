import { ipcMain, dialog, shell } from 'electron'
import https from 'https'
import fs from 'fs'
import path from 'path'
import { checkPythonInstallStatus, installRemBG } from './env'
import { EnvStatus } from './definitions/env'
import cluster from 'child_process'

class Bridge {
  webContents!: Electron.WebContents

  constructor(webContents) {
    this.webContents = webContents
  }

  init() {
    this.setupDirectoryPicker()
    this.setupEnvChecker()
    this.setupPythonDownload()
  }

  setupEnvChecker() {
    ipcMain.on('env-check', async () => {
      try {
        const pythonInstalled = await checkPythonInstallStatus()
        this.webContents.send('env-check-reply', { status: pythonInstalled })
        this.webContents.send('env-check-reply', { status: EnvStatus.RembgIsInstalling })
        const result = await installRemBG('rembg[cli]')
        this.webContents.send('env-check-reply', { status: result })
      } catch (e) {
        this.webContents.send('env-check-reply', { status: e })
      }
    })
  }

  setupDirectoryPicker() {
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

  setupFilesPicker() {
    ipcMain.on('choose-files', async () => {
      try {
        const result = await dialog.showOpenDialog({
          properties: ['openDirectory', 'openFile', 'multiSelections']
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
    const isMac = process.platform === 'darwin'
    const baseURL = 'https://www.python.org/ftp/python/3.10.10'
    const requestPath = `${baseURL}/${isMac ? 'python-3.10.10-macos11.pkg' : 'python-3.10.10-amd64.exe'}`
    ipcMain.on('install-python', async () => {
      this.webContents.send('env-check-reply', { status: EnvStatus.PythonDownloading })
      https.get(requestPath, (res) => {
        const filePaths = requestPath.split('/')
        const targetPath = path.join(__dirname) + `${filePaths[filePaths.length - 1]}`
        if (res.statusCode === 200) {
          const file = fs.createWriteStream(
            targetPath
          )
          // 进度
          // const len = parseInt(res.headers['content-length']) // 文件总长度
          // console.log(len)
          // let cur = 0
          // res.on('data', function (chunk) {
          //   cur += chunk.length
          //   const progress = ((100.0 * cur) / len).toFixed(2) // 当前进度
          //   // const currProgress = (cur / 1048576).toFixed(2) // 当前了多少
          //   this.webContents.send('env-check-reply', progress)
          //   //这里开启新的线程启动子窗子 将进度条数据传送至子窗口 显示下载进度。
          //   // console.log(progress);
          //   // console.log(currProgress + "M");
          // })
          res.on('end', (e) => {
            isMac
              ? shell.openPath(targetPath)
              : cluster.exec('"' + targetPath + '"', (err, res) => {
            })
          })
          file
            .on('finish', () => {
              file.close()
            })
            .on('error', (err) => {
              fs.unlink(targetPath, () => {})
              if (err) {
                console.log(err)
              }
            })
          res.pipe(file)
        } else {
          console.log('网络错误!')
        }
        // https://blog.csdn.net/qq_42172829/article/details/122090748
      })
    })
  }
}

export default Bridge
