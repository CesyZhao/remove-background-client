import { IpcMainEvent } from 'electron'
import { BridgeEvent, EnvStatus, EventCode } from '@common/definitions/bridge'
import { installPython, installRemBG } from '../env'
import BaseModule from './Base'

class EnvModule extends BaseModule {
  protected registerEvents(): void {
    this.registerHandler(BridgeEvent.InstallPython, this.handleInstallPython)
    this.registerHandler(BridgeEvent.InstallRembg, this.handleInstallRembg)
  }

  private async handleInstallPython(event: IpcMainEvent, checkStatusOnly: boolean): Promise<void> {
    let result: EnvStatus
    let code = EventCode.Success
    try {
      result = await installPython(checkStatusOnly)
    } catch (e) {
      result = e as EnvStatus
      code = EventCode.Error
    }
    event.reply(BridgeEvent.InstallPythonReply, { status: result, code })
  }

  private async handleInstallRembg(event: IpcMainEvent): Promise<void> {
    let result: EnvStatus
    let code = EventCode.Success
    try {
      result = await installRemBG('rembg[cli]')
    } catch (e) {
      result = e as EnvStatus
      code = EventCode.Error
    }
    event.reply(BridgeEvent.InstallRembgReply, { status: result, code })
  }
}

export default EnvModule