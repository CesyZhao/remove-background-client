import { IpcMainEvent } from 'electron'
import { ipcMain } from 'electron'
import { BridgeEvent, EventCode } from '@common/definitions/bridge'

export interface BridgeResponse {
  code: EventCode
  [key: string]: unknown
}

export type EventHandler<T extends unknown[] = unknown[]> = (
  event: IpcMainEvent,
  ...args: T
) => Promise<void>

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

  protected registerHandler<T extends unknown[]>(
    event: BridgeEvent,
    handler: EventHandler<T>
  ): void {
    this.eventHandlers.set(event, handler)
  }

  protected sendReply(event: IpcMainEvent, replyEvent: BridgeEvent, response: BridgeResponse): void {
    event.reply(replyEvent, response)
  }
}

export default BaseModule
