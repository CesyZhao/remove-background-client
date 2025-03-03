import { ElectronAPI } from '@electron-toolkit/preload'

export type apiCallback<T> = (value: T) => void


interface ICustomApi {
  [func: string]: <T>(...args?) => Promise<T>
}

declare global {
  interface Window {
    electron: ElectronAPI & ICustomApi
  }
}
