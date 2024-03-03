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
      if (!error && mainVersion === '3' && subVersion > '7') {
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
      // if (!error) {
      //   resolve(true)
      // }
      // reject(false)
    })
    command.stdout.on('data', (data) => {
      console.log(data, '++++++')
    })
    command.on('error', (error) => {
      console.log(error, 'error---------------')
    })
    command.on('close', (code) => {
      console.log(code, 'close---------------')
    })
  })
}

