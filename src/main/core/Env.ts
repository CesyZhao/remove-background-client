import { IpcMainEvent } from 'electron'
import { BridgeEvent, EnvStatus, EventCode } from '@common/definitions/bridge'
import { installPython, installRemBG } from '../env'
import BaseModule from './Base'

class EnvModule extends BaseModule {
  protected registerEvents(): void {
    this.registerHandler<[boolean]>(BridgeEvent.InstallPython, this.handleInstallPython)
    this.registerHandler<[]>(BridgeEvent.InstallRembg, this.handleInstallRembg)
  }

  private async handleInstallPython(event: IpcMainEvent, checkStatusOnly: boolean): Promise<void> {
    try {
      const status = await installPython(checkStatusOnly)
      this.sendReply(event, BridgeEvent.InstallPythonReply, {
        status,
        code: EventCode.Success
      })
    } catch (e) {
      this.sendReply(event, BridgeEvent.InstallPythonReply, {
        status: e as EnvStatus,
        code: EventCode.Error
      })
    }
  }

  private async handleInstallRembg(event: IpcMainEvent): Promise<void> {
    try {
      const status = await installRemBG('rembg[cli]')
      this.sendReply(event, BridgeEvent.InstallRembgReply, {
        status,
        code: EventCode.Success
      })
    } catch (e) {
      this.sendReply(event, BridgeEvent.InstallRembgReply, {
        status: e as EnvStatus,
        code: EventCode.Error
      })
    }
  }
}

export default EnvModule
