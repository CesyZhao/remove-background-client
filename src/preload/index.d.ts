import { ElectronAPI } from '@electron-toolkit/preload'

interface ICustomApi {
  [func: CustomApi]: (callback: apiCallback) => void
}

declare global {
  interface Window {
    electron: ElectronAPI & ICustomApi
  }
}
