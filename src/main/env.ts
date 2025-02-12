import { MaxPythonSubVersion, MinPythonSubVersion, PythonMainVersion } from './definitions/env'
import childProcess from 'child_process'
import { shell } from 'electron'
import { inRange } from 'lodash'
import path from 'path'
import { EnvStatus } from '@common/definitions/events'
import { AsyncResult } from '@common/definitions/types'

const { exec } = childProcess

export const checkPythonInstallStatus = (): AsyncResult<EnvStatus> => {
  return new Promise((resolve, reject) => {
    exec('python3 --version', (error, stdout) => {
      const version = stdout?.replace('Python', '')?.trim()
      const versionArray = version?.split('.')
      const [mainVersion, subVersion] = versionArray
      !error &&
      Number(mainVersion) === PythonMainVersion &&
      inRange(Number(subVersion), MinPythonSubVersion, MaxPythonSubVersion)
        ? resolve(EnvStatus.PythonInstalled)
        : reject(EnvStatus.PythonNotInstalled)
    })
  })
}

export const installPython = (checkStatusOnly = true): AsyncResult<string> => {
  return new Promise((resolve, reject) => {
    checkPythonInstallStatus()
      .then((res) => {
        resolve(res)
      })
      .catch(() => {
        if (checkStatusOnly) {
          reject(EnvStatus.PythonNotInstalled)
          return
        }
        const isMac = process.platform === 'darwin'
        const pkgName = isMac ? 'python-3.10.10-macos11.pkg' : 'python-3.10.10-amd64.exe'
        const targetPath = path.join(__dirname, `../../resources/${pkgName}`)
        if (isMac) {
          shell.openPath(targetPath).then((error) => {
            if (error) {
              reject(error)
            }
          })
        } else {
          exec('"' + targetPath + '"', (err) => {
            if (err) {
              reject(err)
            }
          })
        }
      })
  })
}

export const checkRembgInstallStatus = (): AsyncResult<EnvStatus> => {
  return new Promise((resolve, reject) => {
    exec('rembg --help', (error) => {
      error ? reject(EnvStatus.RembgNotInstalled) : resolve(EnvStatus.RembgInstalled)
    })
  })
}

export const installRemBG = (type: string): AsyncResult<string> => {
  return new Promise((resolve, reject) => {
    checkRembgInstallStatus()
      .then((res) => {
        resolve(res)
      })
      .catch(() => {
        const command = exec(
          `pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple "${type}"`,
          (error) => {
            if (error) {
              reject(error)
            }
          }
        )
        command.on('close', (code) => {
          code === 0 ? resolve(EnvStatus.RembgInstalled) : reject(EnvStatus.RembgNotInstalled)
        })
      })
  })
}
