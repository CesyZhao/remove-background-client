import { IpcMainEvent, dialog } from 'electron'
import { BridgeEvent, EventCode, FileSelectorCommand, FileSelectorType } from '@common/definitions/bridge'
import { ipcMain } from 'electron'
import { fileSelectorCommandMap } from '../definitions/bridge'

class FileModule {
  constructor() {
    this.registerEvents()
  }

  private registerEvents(): void {
    ipcMain.on(BridgeEvent.PickFileOrDirectory, this.handlePickFileOrDirectory.bind(this))
  }

  private async handlePickFileOrDirectory(event: IpcMainEvent, commands: Array<FileSelectorType>): Promise<void> {
    const commandList: FileSelectorCommand[] = commands.map((command) => {
      return fileSelectorCommandMap.get(command) || FileSelectorCommand.openFile
    })

    let target: string | undefined
    let code = EventCode.Success

    try {
      const result = await dialog.showOpenDialog({
        properties: commandList
      })
      if (!result.canceled) {
        target = result.filePaths[0]
      }
    } catch (e) {
      target = undefined
      code = EventCode.Error
    }

    event.reply(BridgeEvent.PickFileOrDirectoryReply, { result: target, code })
  }

  public destroy(): void {
    ipcMain.removeListener(BridgeEvent.PickFileOrDirectory, this.handlePickFileOrDirectory)
  }
} 

export default FileModule