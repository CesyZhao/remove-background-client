import { ipcMain, dialog } from 'electron'
import http from 'http'
import os from 'os'
import fs from 'fs'
import path from 'path'
import { checkPythonInstallStatus, installRemBG } from './env'
import { EnvStatus } from './definitions/env'

class Bridge {
  webContents!: Electron.WebContents

  constructor(webContents) {
    this.webContents = webContents
  }

  init() {
    this.setupDictoryPicker()
    this.setupEnvChecker()
    this.setupPythonDownload()
  }

  setupEnvChecker() {
    ipcMain.on('env-check', async () => {
      try {
        const pythonInstalled = await checkPythonInstallStatus()
        this.webContents.send('env-check-reply', { status: pythonInstalled })
        this.webContents.send('env-check-reply',{ status: EnvStatus.RembgIsInstalling })
        const result = await installRemBG('rembg[cli]')
        this.webContents.send('env-check-reply', { status: result })
      } catch (e) {
        this.webContents.send('env-check-reply', { status: e })
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
    const isMac = process.platform === 'darwin'
    const baseURL = 'https://www.python.org/ftp/python/3.10.10'
    ipcMain.on('install-python', async () => {
      http.get(
        `${baseURL}/${isMac ? 'python-3.10.10-macos11.pkg' : 'python-3.10.10-amd64.exe'}`,
        (res) => {
          if (res.statusCode !== '200') {
            const file = fs.createWriteStream(
              path.join(__dirname) +
                `${res.req.path.split('/')[res.req.path.split('/').length - 1]}`
            )

            this.webContents.send('env-check-reply', EnvStatus.PythonDownloading)
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
            res.on('end', () => {
              console.log('下载结束')
              //下载完成执行exe文件
              ToolsUpgrade(
                path.join(__dirname) +
                  `${res.req.path.split('/')[res.req.path.split('/').length - 1]}`
              )
            })
            file
              .on('finish', () => {
                // console.log('文件写入结束')
                file.close()
              })
              .on('error', (err) => {
                fs.unlink(
                  path.join(__dirname) +
                    `${res.req.path.split('/')[res.req.path.split('/').length - 1]}`
                )
                if (err) {
                  console.log(err)
                }
              })
            res.pipe(file)
          } else {
            console.log('网络错误!')
          }
          // https://blog.csdn.net/qq_42172829/article/details/122090748
        }
      )
    })
  }
}

export default Bridge
