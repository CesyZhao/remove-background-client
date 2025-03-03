import { EnvStatus, IpcResponse } from '@common/definitions/bridge'
const { electron } = window
const { ipcRenderer } = electron

class Env {
  async installRemBG(): Promise<IpcResponse<EnvStatus>> {
    return electron.installRemBG()
  }

  async installPython(checkStatusOnly = true): Promise<IpcResponse<EnvStatus>> {
    return electron.installPython(checkStatusOnly)
  }
}

export default Env
