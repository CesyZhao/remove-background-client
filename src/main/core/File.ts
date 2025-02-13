import { IpcMainEvent, dialog } from 'electron'
import { BridgeEvent, EventCode, FileSelectorCommand, FileSelectorType } from '@common/definitions/bridge'
import { fileSelectorCommandMap } from '../definitions/bridge'
import BaseModule from './Base'

class FileModule extends BaseModule {
  protected registerEvents(): void {
    this.registerHandler<[Array<FileSelectorType>]>(
      BridgeEvent.PickFileOrDirectory,
      this.handlePickFileOrDirectory
    )
  }

  private async handlePickFileOrDirectory(event: IpcMainEvent, commands: Array<FileSelectorType>): Promise<void> {
    const commandList: FileSelectorCommand[] = commands.map((command) => {
      return fileSelectorCommandMap.get(command) || FileSelectorCommand.openFile
    })

    try {
      const result = await dialog.showOpenDialog({
        properties: commandList
      })

      this.sendReply(event, BridgeEvent.PickFileOrDirectoryReply, {
        result: result.canceled ? undefined : result.filePaths[0],
        code: EventCode.Success
      })
    } catch (e) {
      this.sendReply(event, BridgeEvent.PickFileOrDirectoryReply, {
        result: undefined,
        code: EventCode.Error
      })
    }
  }
}

export default FileModule
