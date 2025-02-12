import { IpcMainEvent, dialog } from 'electron'
import { BridgeEvent, EventCode, FileSelectorCommand, FileSelectorType } from '@common/definitions/bridge'
import { fileSelectorCommandMap } from '../definitions/bridge'
import BaseModule from './Base'

class FileModule extends BaseModule {
  protected registerEvents(): void {
    this.registerHandler(BridgeEvent.PickFileOrDirectory, this.handlePickFileOrDirectory)
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
}

export default FileModule