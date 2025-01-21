import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useEffect, useState } from 'react'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const [checking, setChecking] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [updateReady, setUpdateReady] = useState(false)
  const [error, setError] = useState(null)
  const [newVersion, setNewVersion] = useState(null)

  useEffect(() => {
    const removeProgressListener = window.electronAPI.onDownloadProgress((progress) => {
      setDownloadProgress(progress.percent)
    })

    // Listen for download completion
    const removeDownloadedListener = window.electronAPI.onUpdateDownloaded(() => {
      setUpdateReady(true)
      setDownloading(false)
    })

    return (): void => {
      removeProgressListener()
      removeDownloadedListener()
    }
  }, [])

  const checkForUpdates = async (): Promise<void> => {
    try {
      setChecking(true)
      setError(null)
      const result = await window.electronAPI.checkForUpdates()
      if (result.updateAvailable) {
        setUpdateAvailable(true)
        //@ts-ignore
        setNewVersion(result.version)
      } else {
        setUpdateAvailable(false)
      }
    } catch (err) {
      //@ts-ignore
      setError(err.message)
    } finally {
      setChecking(false)
    }
  }

  const downloadUpdate = async (): Promise<void> => {
    try {
      setDownloading(true)
      setError(null)
      await window.electronAPI.startDownload()
    } catch (err) {
      //@ts-ignore
      setError(err)
      setDownloading(false)
    }
  }

  const installUpdate = (): void => {
    window.electronAPI.installUpdate()
  }

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
        <input type="text" placeholder="Type something..." />
      </div>
      <Versions></Versions>
      <h2 className="text-xl font-bold mb-4">Software Update</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!checking && !updateAvailable && !downloading && !updateReady && (
        <button
          onClick={checkForUpdates}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Check for Updates
        </button>
      )}

      {checking && <div className="text-gray-600">Checking for updates...</div>}

      {updateAvailable && !downloading && !updateReady && (
        <div>
          <p className="mb-2">New version {newVersion} is available!</p>
          <button
            onClick={downloadUpdate}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Download Update
          </button>
        </div>
      )}

      {downloading && (
        <div>
          <p className="mb-2">Downloading update: {downloadProgress.toFixed(2)}%</p>
          <div className="w-full bg-gray-200 rounded">
            <div className="bg-blue-500 rounded h-2" style={{ width: `${downloadProgress}%` }} />
          </div>
        </div>
      )}

      {updateReady && (
        <div>
          <p className="mb-2">Update is ready to install!</p>
          <button
            onClick={installUpdate}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Install and Restart
          </button>
        </div>
      )}
    </>
  )
}

export default App
