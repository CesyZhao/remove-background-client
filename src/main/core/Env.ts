import { IpcMainEvent } from 'electron'
import { BridgeEvent, EnvStatus, EventCode } from '@common/definitions/bridge'
import { ipcMain } from 'electron'
import { installPython, installRemBG } from '../env'

class EnvModule {
  constructor() {
    this.registerEvents()
  }

  private registerEvents(): void {
    ipcMain.on(BridgeEvent.InstallPython, this.handleInstallPython.bind(this))
    ipcMain.on(BridgeEvent.InstallRembg, this.handleInstallRembg.bind(this))
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

  public destroy(): void {
    ipcMain.removeListener(BridgeEvent.InstallPython, this.handleInstallPython)
    ipcMain.removeListener(BridgeEvent.InstallRembg, this.handleInstallRembg)
  }
} 

export default EnvModule