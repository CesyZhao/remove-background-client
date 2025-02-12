import { BridgeEvent } from '@common/definitions/events'
import { BridgeEventHandler } from '@common/definitions/types'
import { EventHandlerMap, TypedEventHandler } from '../definitions/bridge'

export class TypedEventMap implements EventHandlerMap {
  private map = new Map<BridgeEvent, BridgeEventHandler>()

  set<E extends BridgeEvent>(event: E, handler: TypedEventHandler<E>): void {
    this.map.set(event, handler as BridgeEventHandler)
  }

  get<E extends BridgeEvent>(event: E): TypedEventHandler<E> | undefined {
    return this.map.get(event) as TypedEventHandler<E> | undefined
  }

  has(event: BridgeEvent): boolean {
    return this.map.has(event)
  }

  delete(event: BridgeEvent): boolean {
    return this.map.delete(event)
  }

  clear(): void {
    this.map.clear()
  }

  forEach(callbackfn: (value: BridgeEventHandler, key: BridgeEvent) => void): void {
    this.map.forEach(callbackfn)
  }
} 