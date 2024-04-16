import { ElectronAPI } from '@electron-toolkit/preload'

export enum CustomApi {
  OnEnvCheckReply = 'onEnvCheckReply',
  OnTargetPathChosen = 'onTargetPathChosen'
}

export type apiCallback<T> = (value: T) => void


interface ICustomApi {
  [func: CustomApi]: (callback: apiCallback) => void
}

declare global {
  interface Window {
    electron: ElectronAPI & ICustomApi
  }
}
