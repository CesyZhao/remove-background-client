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


export const installRemBG = (type: string) => {
  return new Promise((resolve, reject) => {
    const command = exec(`pip3 install ${type}`, (error, stdout, stderr) => {
      console.log(error)
      if (error) {
        reject(false)
      }
    })
    command.on('close', (code) => {
      if (code === 0) {
        resolve(true)
      }
      reject(false)
    })
  })
}

