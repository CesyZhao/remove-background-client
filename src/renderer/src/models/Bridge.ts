import {
  BridgeEvent,
  EnvStatus,
  EventCode,
  FileSelectorType
} from '../../../common/definitions/bridge'

const { electron } = window
const { ipcRenderer } = electron

class Bridge {
  async pickFileOrDirectory(types: FileSelectorType[]): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.PickFileOrDirectoryReply}`]

      func(({ result, code }) => {
        code === EventCode.Success ? resolve(result) : reject(code)
      })

      ipcRenderer.send(BridgeEvent.PickFileOrDirectory, types)
    })
  }

  installRembg(): Promise<EnvStatus> {
    const func = electron[`on${BridgeEvent.InstallRembgReply}`]

    return new Promise((resolve, reject) => {
      func(({ status, code }) => {
        code === EventCode.Success ? resolve(status) : reject(status)
      })

      ipcRenderer.send(BridgeEvent.InstallRembg)
    })
  }

  installPython(checkStatusOnly = true): Promise<EnvStatus> {
    const func = electron[`on${BridgeEvent.InstallPythonReply}`]

    return new Promise((resolve, reject) => {
      func(({ status, code }) => {
        code === EventCode.Success ? resolve(status) : reject(status)
      })

      ipcRenderer.send(BridgeEvent.InstallPython, checkStatusOnly)
    })
  }
}

const bridge = new Bridge()

export default bridge
