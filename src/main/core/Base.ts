import { ipcMain } from 'electron'
import { BridgeEvent, EventCode } from '@common/definitions/bridge'

export interface BridgeResponse {
  code: EventCode
  [key: string]: unknown
}

export type EventHandler<T extends unknown[], S> = (...args: T) => Promise<S>

abstract class BaseModule {
  protected eventHandlers: Map<BridgeEvent, EventHandler<unknown[], unknown>>

  constructor() {
    this.eventHandlers = new Map()
    this.registerEvents()
    this.bindEvents()
  }

  protected abstract registerEvents(): void

  private bindEvents(): void {
    this.eventHandlers.forEach((handler, event) => {
      ipcMain.handle(event, handler.bind(this))
    })
  }

  protected registerHandler<T extends unknown[], S>(
    event: BridgeEvent,
    handler: EventHandler<T, S>
  ): void {
    // 使用类型断言来确保类型安全
    this.eventHandlers.set(event, handler as EventHandler<unknown[], unknown>)
  }
}

export default BaseModule
