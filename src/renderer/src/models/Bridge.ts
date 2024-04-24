class Bridge {
  async chooseDirectory(): Promise<string | undefined> {
    return new Promise((resolve) => {
      window.electron.onTargetPathChosen((result) => {
        resolve(result)
      })
      window.electron.ipcRenderer.send('choose-target-path')
    })
  }

  setupEnvStatusChecker(callback) {
    window.electron.onEnvCheckReply((result) => {
      callback(result)
    })

    window.electron.ipcRenderer.send('env-check')
  }

  recheckEnv() {
    window.electron.ipcRenderer.send('env-check')
  }

  installPython() {
    window.electron.ipcRenderer.send('install-python')
  }
}

const bridge = new Bridge()

export default bridge
