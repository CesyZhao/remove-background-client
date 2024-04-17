class Bridge {
  async chooseDirectory() {
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
}

const bridge = new Bridge()

export default bridge
