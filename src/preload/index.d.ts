import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: IElectronAPI
    api: unknown
  }
}

export interface IElectronAPI {
  checkForUpdates: () => Promise<{ updateAvailable: boolean; version?: string; error?: string }>
  startDownload: () => Promise<{ success: boolean; error?: string }>
  installUpdate: () => void
  onDownloadProgress: (callback: (progress: { percent: number }) => void) => () => void
  onUpdateDownloaded: (callback: () => void) => () => void
}
