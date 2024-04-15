export enum CunstomApi {
  OnEnvCheckReply = 'onEnvCheckReply',
  OnTargetPathChosen = 'onTargetPathChosen'
}

export type apiCallback<T> = (value: T) => void
