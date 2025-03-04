import { ipcMain } from 'electron'
import { BridgeEvent, EventCode } from '@common/definitions/bridge'

export interface BridgeResponse {
  code: EventCode
  [key: string]: unknown
}

export type EventHandler<T extends unknown[], S> = (...args: T) => Promise<S>

abstract class BaseModule {
  protected eventHandlers: Map<string, EventHandler<unknown[], unknown>>

  private eventPrefix = ''

  constructor(eventPrefix?: string, ignoreEvents?: boolean) {
    this.eventPrefix = eventPrefix || ''
    this.eventHandlers = new Map()
    this.registerEvents()
    ignoreEvents !== false && this.bindEvents()
  }

  protected abstract registerEvents(): void

  private bindEvents(): void {
    this.eventHandlers.forEach((handler, event) => {
      try {
        ipcMain.handle(event, handler.bind(this))
      } catch (e) {
        console.error(`Failed to bind event ${event}:`)
      }
    })
  }

  protected registerHandler<T extends unknown[], S>(
    event: BridgeEvent,
    handler: EventHandler<T, S>
  ): void {
    const eventName = `${this.eventPrefix}:${event}`
    // 使用类型断言来确保类型安全
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, handler as EventHandler<unknown[], unknown>)
    }
  }
}

export default BaseModule
