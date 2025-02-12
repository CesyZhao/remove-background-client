import { IpcMainEvent } from 'electron'

export type BridgeError = Error | string

export type BridgeEventHandler<T extends unknown[] = []> = (
  event: IpcMainEvent,
  ...args: T
) => void | Promise<void>

export type AsyncResult<T> = Promise<T> 