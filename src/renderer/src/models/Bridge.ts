import { BridgeEvent, EnvStatus, FileSelectorType } from '../../../common/definitions/bridge'

const { electron } = window
const { ipcRenderer } = electron

class Bridge {
  async pickFileOrDirectory(types: FileSelectorType[]): Promise<string | undefined> {
    return new Promise((resolve) => {
      const func = electron[`on${BridgeEvent.PickFileOrDirectoryReply}`]

      func((result) => {
        resolve(result)
      })

      ipcRenderer.send(BridgeEvent.pickFileOrDirectory, types)
    })
  }

  installRembg(): Promise<EnvStatus> {
    const func = electron[`on${BridgeEvent.InstallRembgReply}`]

    return new Promise((resolve) => {
      func((result) => {
        resolve(result)
      })

      ipcRenderer.send(BridgeEvent.InstallRembg)
    })
  }

  installPython(checkStatusOnly = true): Promise<EnvStatus> {
    const func = electron[`on${BridgeEvent.InstallPythonReply}`]

    return new Promise((resolve) => {
      func((result) => {
        resolve(result)
      })

      ipcRenderer.send(BridgeEvent.InstallPython, checkStatusOnly)
    })
  }
}

const bridge = new Bridge()

export default bridge
