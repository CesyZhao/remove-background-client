import { IpcMainEvent } from 'electron'
import { ipcMain } from 'electron'
import { BridgeEvent } from '@common/definitions/bridge'

type EventHandler = (event: IpcMainEvent, ...args: any[]) => Promise<void>

abstract class BaseModule {
  protected eventHandlers: Map<BridgeEvent, EventHandler>

  constructor() {
    this.eventHandlers = new Map()
    this.registerEvents()
    this.bindEvents()
  }

  protected abstract registerEvents(): void

  private bindEvents(): void {
    this.eventHandlers.forEach((handler, event) => {
      ipcMain.on(event, handler.bind(this))
    })
  }

  public destroy(): void {
    this.eventHandlers.forEach((handler, event) => {
      ipcMain.removeListener(event, handler)
    })
    this.eventHandlers.clear()
  }

  protected registerHandler(event: BridgeEvent, handler: EventHandler): void {
    this.eventHandlers.set(event, handler)
  }
} 

export default BaseModule