import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      onEnvCheckReply: (callback) =>
        ipcRenderer.once('env-check-reply', (_event, value) => callback(value)),
      onTargetPathChosen: (callback) =>
        ipcRenderer.once('target-path-chosen', (_event, value) => callback(value))
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}
