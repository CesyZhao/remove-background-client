import {
  MaxPythonSubVersion,
  MinPythonSubVersion,
  PythonMainVersion
} from './definitions/env'
import childProcess from 'child_process'
import { shell } from 'electron'
import { inRange } from 'lodash'
import path from 'path'
import { EnvStatus } from '../common/definitions/bridge'

const { exec } = childProcess

export const checkPythonInstallStatus = () => {
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

export const installPython = () => {
  return new Promise((resolve, reject) => {
    checkPythonInstallStatus()
      .then((res) => {
        resolve(res)
      })
      .catch(() => {
        const isMac = process.platform === 'darwin'
        const pkgName = isMac ? 'python-3.10.10-macos11.pkg' : 'python-3.10.10-amd64.exe'
        const targetPath = path.join(__dirname) + `../../resource/${pkgName}`
        isMac
          ? shell.openPath(targetPath).catch((_) => {
              reject(EnvStatus.PythonNotInstalled)
            })
          : exec('"' + targetPath + '"', (err) => {
              if (err) {
                reject(EnvStatus.PythonNotInstalled)
              }
            })
      })
  })
}

export const checkRembgInstallStatus = () => {
  return new Promise((resolve, reject) => {
    exec('rembg --help', (error) => {
      error ? reject(EnvStatus.RembgNotInstalled) : resolve(EnvStatus.RembgInstalled)
    })
  })
}

export const installRemBG = (type: string) => {
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
              reject(EnvStatus.RembgNotInstalled)
            }
          }
        )
        command.on('close', (code) => {
          code === 0 ? resolve(EnvStatus.RembgInstalled) : reject(EnvStatus.RembgNotInstalled)
        })
      })
  })
}
