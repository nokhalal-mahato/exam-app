import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useEffect, useState } from 'react'
import { ipcRenderer } from 'electron'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const [updateStatus, setUpdateStatus] = useState('')

  useEffect(() => {
    ipcRenderer.on('update-available', () => {
      setUpdateStatus('Update available. Downloading...')
    })

    ipcRenderer.on('update-downloaded', () => {
      setUpdateStatus('Update downloaded. Restart the app to install.')
    })

    return (): void => {
      ipcRenderer.removeAllListeners('update-available')
      ipcRenderer.removeAllListeners('update-downloaded')
    }
  }, [])

  const restartApp = (): void => {
    ipcRenderer.send('restart-app')
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
      {updateStatus === 'Update downloaded. Restart the app to install.' && (
        <button onClick={restartApp}>Restart App</button>
      )}
    </>
  )
}

export default App
