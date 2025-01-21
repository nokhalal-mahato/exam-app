import { contextBridge, ipcRenderer, IpcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

contextBridge.exposeInMainWorld('electronAPI', {
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  startDownload: () => ipcRenderer.invoke('start-download'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, progress) => callback(progress, event))
    return (): IpcRenderer => ipcRenderer.removeListener('download-progress', callback)
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback)
    return (): IpcRenderer => ipcRenderer.removeListener('update-downloaded', callback)
  }
})
