import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { BridgeEvent } from '@common/definitions/bridge'
import { lowerFirst } from 'lodash'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

const apiGroup = {
  env: [BridgeEvent.InstallPython, BridgeEvent.InstallRemBG],
  file: [
    BridgeEvent.PickFileOrDirectory,
    BridgeEvent.GetSetting,
    BridgeEvent.RemoveBackground,
    BridgeEvent.RemoveBackgroundBatch,
    BridgeEvent.GetImagePreview,
    BridgeEvent.DeleteImage,
    BridgeEvent.RevealInFinder,
    BridgeEvent.GetDirectoryImages,
    BridgeEvent.RemoveBackgroundFromBase64
  ]
}

const additionalApi = {}

Object.entries(apiGroup).forEach(([prefix, apiList]) => {
  apiList.forEach((api) => {
    additionalApi[lowerFirst(api)] = (...args) => {
      return ipcRenderer.invoke(`${prefix}:${api}`, ...args)
    }
  })
})

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', additionalApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}
