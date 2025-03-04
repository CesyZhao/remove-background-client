import { BridgeEvent, EnvStatus, EventCode, IpcResponse } from '@common/definitions/bridge'
import { installPython, installRemBG } from '@util/env'
import BaseModule from './Base'

class EnvModule extends BaseModule {
  constructor() {
    super('env')
  }

  protected registerEvents(): void {
    this.registerHandler(BridgeEvent.InstallPython, this.handleInstallPython)
    this.registerHandler(BridgeEvent.InstallRemBG, this.handleInstallRemBG)
  }

  private async handleInstallPython(checkStatusOnly: boolean): Promise<IpcResponse<EnvStatus>> {
    try {
      const status = await installPython(checkStatusOnly)
      return {
        result: status,
        code: EventCode.Success
      }
    } catch (error) {
      throw {
        code: EventCode.Error,
        result: EnvStatus.PythonNotInstalled
      }
    }
  }

  private async handleInstallRemBG(): Promise<IpcResponse<EnvStatus>> {
    try {
      const status = await installRemBG()
      return {
        result: status,
        code: EventCode.Success
      }
    } catch (error) {
      throw {
        code: EventCode.Error,
        result: EnvStatus.RemBGNotInstalled
      }
    }
  }
}

export default EnvModule
