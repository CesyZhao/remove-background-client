import { dialog, IpcMainEvent } from 'electron'
import { BridgeModule } from '../BridgeModule'
import {
  BridgeEvent,
  EventCode,
  FileSelectorCommand,
  FileSelectorType
} from '@common/definitions/events'
import { FilePickerResponse } from '@common/definitions/responses'
import { fileSelectorCommandMap, TypedEventHandler } from '../../definitions/bridge'

type FilePickerHandler = TypedEventHandler<typeof BridgeEvent.PickFileOrDirectory>

export class FileModule extends BridgeModule {
  protected registerEvents(): void {
    const handler: FilePickerHandler = async (event: IpcMainEvent, commands: FileSelectorType[]) => {
      const commandList: FileSelectorCommand[] = commands.map((command) => {
        return fileSelectorCommandMap.get(command) || FileSelectorCommand.openFile
      })
      let target: string | null = null
      let code = EventCode.Success
      try {
        const result = await dialog.showOpenDialog({
          properties: commandList
        })
        if (!result.canceled) {
          target = result.filePaths[0]
        }
      } catch (e) {
        target = null
        code = EventCode.Error
      }
      const response: FilePickerResponse = { result: target, code }
      event.reply(BridgeEvent.PickFileOrDirectoryReply, response)
    }

    this.eventHandlerMap.set(BridgeEvent.PickFileOrDirectory, handler)
  }
} 