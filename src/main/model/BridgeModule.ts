import { ipcMain } from 'electron'
import { EventHandlerMap, BridgeModule as IBridgeModule } from '../definitions/bridge'
import { TypedEventMap } from './EventMap'

export abstract class BridgeModule implements IBridgeModule {
  protected eventHandlerMap: EventHandlerMap

  constructor() {
    this.eventHandlerMap = new TypedEventMap()
    this.registerEvents()
  }

  protected abstract registerEvents(): void

  public initialize(): void {
    this.eventHandlerMap.forEach((handler, event) => {
      ipcMain.on(event, handler)
    })
  }

  public destroy(): void {
    this.eventHandlerMap.forEach((handler, event) => {
      ipcMain.off(event, handler)
    })
    this.eventHandlerMap.clear()
  }
} 