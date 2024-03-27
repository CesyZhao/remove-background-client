import { EnvStatus } from './definition/env'

const childProcess = require('child_process')
const { exec } = childProcess

export const checkPythonInstallStatus = () => {
  return new Promise((resolve, reject) => {
    exec('python3 --version', (error, stdout, stderr) => {
      const version = stdout?.replace('Python', '')?.trim()
      const versionArray = version?.split('.')
      const mainVersion = versionArray?.[0]
      const subVersion =versionArray?.[1]
      if (!error && mainVersion === '3' && subVersion > 7 && subVersion < 12){
        resolve(EnvStatus.PythonInstalled)
      }
      reject(EnvStatus.PythonNotInstalled)
    })
  })
}

export const checkRembgInstallStatus = () => {
    return new Promise((resolve, reject) => {
    exec('rembg --help', (error, stdout, stderr) => {
      if (!error) {
        resolve(EnvStatus.RembgInstalled)
      }
      reject(EnvStatus.RembgNotInstalled)
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
        const command = exec(`pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple "${type}"`, (error, stdout, stderr) => {
          if (error) {
            reject(EnvStatus.RembgNotInstalled)
          }
        })
        command.stdout.on('data', (data) => {
          console.log(data)
        })
        command.on('close', (code) => {
          if (code === 0) {
            resolve(EnvStatus.RembgInstalled)
          }
          reject(EnvStatus.RembgNotInstalled)
        })
      })
  })
}

