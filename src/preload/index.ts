import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { BridgeEvent } from '../common/definitions/bridge'
import { upperFirst } from 'lodash'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

const api = {
  ...electronAPI
}

const additionalAPIKeys = [
  BridgeEvent.InstallPythonReply,
  BridgeEvent.InstallRembgReply,
  BridgeEvent.PickFileOrDirectoryReply
]

additionalAPIKeys.forEach(k => {
  api[`on${upperFirst(k)}`] = (callback) => {
    ipcRenderer.on(k, (_event, value) => callback(value))
  }
})

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}
