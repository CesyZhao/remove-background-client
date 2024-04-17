

class Bridge {
  async chooseDirectory() {
    return new Promise((resolve) => {
      window.electron.onTargetPathChosen((result) => {
        console.log('++++++++------')
        resolve(result)
      })
      window.electron.ipcRenderer.send('choose-target-path')
    })
  }
}

const bridge = new Bridge()

export default bridge

