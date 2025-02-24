import { IpcMainEvent } from 'electron'
import { BridgeEvent, EnvStatus, EventCode } from '@common/definitions/bridge'
import { installPython, installRemBG } from '../env'
import BaseModule from './Base'

class EnvModule extends BaseModule {
  protected registerEvents(): void {
    this.registerHandler<[boolean]>(BridgeEvent.InstallPython, this.handleInstallPython)
    this.registerHandler<[]>(BridgeEvent.InstallRemBG, this.handleInstallRemBG)
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

  private async handleInstallRemBG(event: IpcMainEvent): Promise<void> {
    try {
      const status = await installRemBG(() => {
        this.sendReply(event, BridgeEvent.InstallRemBGReply, {
          code: EventCode.Pending
        })
      })
      this.sendReply(event, BridgeEvent.InstallRemBGReply, {
        status,
        code: EventCode.Success
      })
    } catch (e) {
      this.sendReply(event, BridgeEvent.InstallRemBGReply, {
        status: e as EnvStatus,
        code: EventCode.Error
      })
    }
  }
}

export default EnvModule
