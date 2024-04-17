import { ElectronAPI } from '@electron-toolkit/preload'

export type apiCallback<T> = (value: T) => void


interface ICustomApi {
  [func: string]: (callback: apiCallback) => void
}

declare global {
  interface Window {
    electron: ElectronAPI & ICustomApi
  }
}
