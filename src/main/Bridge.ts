import { ipcMain, dialog } from 'electron'
import { installPython, installRemBG } from './env'
import { BridgeEvent, FileSelectorType } from '../common/definitions/bridge'
import { fileSelectorCommandMap } from './definitions/bridge'

class Bridge {
  webContents!: Electron.WebContents

  constructor(webContents) {
    this.webContents = webContents

    const eventHandlerMap = new Map([
      [BridgeEvent.InstallPython, this.installPython.bind(this)],
      [BridgeEvent.InstallRembg, this.installRembg.bind(this)],
      [BridgeEvent.pickFileOrDirectory, this.pickFileOrDirectory.bind(this)]
    ])

    for (const [event, handler] of eventHandlerMap) {
      ipcMain.on(event, handler)
    }
  }

  async installPython(checkStatusOnly = true) {
    let result
    try {
      result = await installPython(checkStatusOnly)
    } catch (e) {
      result = e
    }
    this.webContents.send(BridgeEvent.InstallPythonReply, { status: result })
  }

  async installRembg() {
    let result
    try {
      result =  await installRemBG('rembg[cli]')
    } catch (e) {
      result = e
    }
    this.webContents.send(BridgeEvent.InstallRembgReply, { status: result })
  }

  async pickFileOrDirectory(commands = Array<FileSelectorType>) {
    const commandList = commands.map((command) => {
      return fileSelectorCommandMap.get(command)
    })
    let target
    try {
      const result = await dialog.showOpenDialog({
        properties: commandList
      })
      if (!result.canceled) {
        target = files.filePaths[0]
      }
    } catch (e) {
      target = e
    }
    this.webContents.send(BridgeEvent.pickFileOrDirectoryReply, target)
  }
}

export default Bridge
