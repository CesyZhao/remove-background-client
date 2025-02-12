import { BridgeEvent } from '@common/definitions/events'
import { BridgeEventHandler } from '@common/definitions/types'
import { FileSelectorType, FileSelectorCommand } from '@common/definitions/events'

export const fileSelectorCommandMap: Map<FileSelectorType, FileSelectorCommand> = new Map([
  [FileSelectorType.SingleFile, FileSelectorCommand.openFile],
  [FileSelectorType.Multiple, FileSelectorCommand.multiSelections],
  [FileSelectorType.Folder, FileSelectorCommand.openDirectory]
])

export interface BridgeModule {
  initialize(): void
  destroy(): void
}

export interface BridgeModuleMap {
  env: BridgeModule
  file: BridgeModule
}

export type EventParams<E extends BridgeEvent> = E extends BridgeEvent.InstallPython
  ? [boolean]
  : E extends BridgeEvent.InstallRembg
  ? []
  : E extends BridgeEvent.PickFileOrDirectory
  ? [FileSelectorType[]]
  : never

export type TypedEventHandler<E extends BridgeEvent> = BridgeEventHandler<EventParams<E>>

export type EventHandlerMap = {
  set<E extends BridgeEvent>(event: E, handler: TypedEventHandler<E>): void
  get<E extends BridgeEvent>(event: E): TypedEventHandler<E> | undefined
  has(event: BridgeEvent): boolean
  delete(event: BridgeEvent): boolean
  clear(): void
  forEach(callbackfn: (value: BridgeEventHandler, key: BridgeEvent) => void): void
}
