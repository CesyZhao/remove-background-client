import { BridgeEvent, EnvStatus, EventCode } from '@common/definitions/bridge'
const { electron } = window
const { ipcRenderer } = electron

class Env {
  installRemBG(): Promise<EnvStatus> {
    const func = electron[`on${BridgeEvent.installRemBGReply}`]

    return new Promise((resolve, reject) => {
      func(({ status, code }) => {
        code === EventCode.Success ? resolve(status) : reject(status)
      })

      ipcRenderer.send(BridgeEvent.installRemBG)
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

export default Env
