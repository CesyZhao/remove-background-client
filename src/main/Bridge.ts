import { ipcMain, dialog } from 'electron'
import { installRemBG } from './env'
import { BridgeEvent, fileSelectorCommandMap, FileSelectorType } from './definitions/bridge'

class Bridge {
  webContents!: Electron.WebContents

  constructor(webContents) {
    this.webContents = webContents

    const eventHandlerMap = new Map([
      [BridgeEvent.InstallPython, this.installPython.bind(this)],
      [BridgeEvent.InstallRembg, this.installRembg.bind(this)],
      [BridgeEvent.ChooseFileOrFolder, this.pickFileOrDirectory.bind(this)]
    ])

    for (const [event, handler] of eventHandlerMap) {
      ipcMain.on(event, handler)
    }
  }

  init() {
    this.setupDirectoryPicker()
    this.setupEnvChecker()
    this.setupPythonDownload()
  }

  installPython() {
    let result
    try {
      result = await installPython()
    } catch (e) {
      result = e
    }
    this.webContents.send(BridgeEvent.InstallPythonReply, { status: result })
  }

  installRembg() {
    let result
    try {
      result =  await installRemBG('rembg[cli]')
    } catch (e) {
      result = e
    }
    this.webContents.send(BridgeEvent.InstallRembgReply, { status: result })
  }

  pickFileOrDirectory(commands = Array<FileSelectorType>) {
    const commands = commands.map((command) => {
      return fileSelectorCommandMap.get(command)
    })
    let target
    try {
      const result = await dialog.showOpenDialog({
        properties: commands
      })
      if (!result.canceled) {
        target = files.filePaths[0]
      }
    } catch (e) {
      target = e
    }
    this.webContents.send(BridgeEvent.ChooseFileOrFolderReply, target)
  }
}

export default Bridge
