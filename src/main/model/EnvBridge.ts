import { ipcMain } from 'electron'
import { installPython, installRemBG } from '../env'
import { BridgeEvent, EventCode } from '@common/definitions/bridge'

class EnvBridge {
  constructor() {
    const eventHandlerMap = new Map([
      [BridgeEvent.InstallPython, this.installPython.bind(this)],
      [BridgeEvent.InstallRembg, this.installRembg.bind(this)]
    ])

    for (const [event, handler] of eventHandlerMap) {
      ipcMain.on(event, handler)
    }
  }

  async installPython(event, checkStatusOnly) {
    let result
    let code = EventCode.Success
    try {
      result = await installPython(checkStatusOnly)
    } catch (e) {
      result = e
      code = EventCode.Error
    }
    event.reply(BridgeEvent.InstallPythonReply, { status: result, code })
  }

  async installRembg(event) {
    let result
    let code = EventCode.Success
    try {
      result = await installRemBG('rembg[cli]')
    } catch (e) {
      result = e
      code = EventCode.Error
    }
    event.reply(BridgeEvent.InstallRembgReply, { status: result, code })
  }
}

export default EnvBridge 