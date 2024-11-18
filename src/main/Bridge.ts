import { ipcMain, dialog } from 'electron'
import { installPython, installRemBG } from './env'
import { BridgeEvent, EventCode, FileSelectorType } from '../common/definitions/bridge'
import { fileSelectorCommandMap } from './definitions/bridge'

class Bridge {
  constructor() {
    const eventHandlerMap = new Map([
      [BridgeEvent.InstallPython, this.installPython.bind(this)],
      [BridgeEvent.InstallRembg, this.installRembg.bind(this)],
      [BridgeEvent.PickFileOrDirectory, this.PickFileOrDirectory.bind(this)]
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
      result =  await installRemBG('rembg[cli]')
    } catch (e) {
      result = e
      code = EventCode.Error
    }
    event.reply(BridgeEvent.InstallRembgReply, { status: result, code })
  }

  async PickFileOrDirectory(event, commands: Array<FileSelectorType>) {
    const commandList = commands.map((command) => {
      return fileSelectorCommandMap.get(command)
    })
    let target
    let code = EventCode.Success
    try {
      const result = await dialog.showOpenDialog({
        properties: commandList
      })
      if (!result.canceled) {
        target = result.filePaths[0]
      }
    } catch (e) {
      target = e
      code = EventCode.Error
    }
    event.reply(BridgeEvent.PickFileOrDirectoryReply, { result: target, code })
  }
}

export default Bridge
