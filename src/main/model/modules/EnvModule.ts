import { IpcMainEvent } from 'electron'
import { BridgeModule } from '../BridgeModule'
import { installPython, installRemBG } from '../../env'
import { BridgeEvent, EventCode } from '@common/definitions/events'
import { InstallResponse } from '@common/definitions/responses'
import { BridgeEventHandler, BridgeError } from '@common/definitions/types'

type InstallPythonHandler = BridgeEventHandler<[boolean]>
type InstallRembgHandler = BridgeEventHandler<[]>

export class EnvModule extends BridgeModule {
  protected registerEvents(): void {
    this.eventHandlerMap.set(
      BridgeEvent.InstallPython,
      (async (event: IpcMainEvent, checkStatusOnly: boolean) => {
        let result: string
        let code = EventCode.Success
        try {
          result = await installPython(checkStatusOnly)
        } catch (e) {
          const error = e as BridgeError
          result = typeof error === 'string' ? error : error.message
          code = EventCode.Error
        }
        const response: InstallResponse = { status: result, code }
        event.reply(BridgeEvent.InstallPythonReply, response)
      }) as InstallPythonHandler
    )

    this.eventHandlerMap.set(
      BridgeEvent.InstallRembg,
      (async (event: IpcMainEvent) => {
        let result: string
        let code = EventCode.Success
        try {
          result = await installRemBG('rembg[cli]')
        } catch (e) {
          const error = e as BridgeError
          result = typeof error === 'string' ? error : error.message
          code = EventCode.Error
        }
        const response: InstallResponse = { status: result, code }
        event.reply(BridgeEvent.InstallRembgReply, response)
      }) as InstallRembgHandler
    )
  }
} 