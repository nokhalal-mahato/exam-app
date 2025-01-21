import { app, shell, BrowserWindow, ipcMain, Menu, globalShortcut, protocol } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const { autoUpdater } = require('electron-updater')

app.disableHardwareAcceleration()
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    // kiosk: true, // Prevent users from exiting fullscreen mode
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      // preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  globalShortcut.register('F12', () => {
    console.log('Developer Tools shortcut disabled.')
  })

  mainWindow.on('blur', () => {
    console.log('Window lost focus. Flagging potential cheating!')
  })

  mainWindow.webContents.on('context-menu', (event) => {
    event.preventDefault()
  })

  app.whenReady().then(() => {
    globalShortcut.register('Alt+F4', () => {
      if (mainWindow.isFocused()) {
        console.log('Alt+F4 pressed, but prevented.')
        return false
      }
      return true
    })

    globalShortcut.register('Alt+Tab', () => {
      if (mainWindow.isFocused()) {
        console.log('Alt+Tab pressed, but prevented.')
        return false
      }
      return true
    })
  })

  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available')
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded')
  })

  mainWindow.webContents.closeDevTools()

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL('https://learning-beta.earlywave.in/') // Replace with your desired URL

    // mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

Menu.setApplicationMenu(null)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  protocol.registerFileProtocol('exam-app', (request) => {
    const url = request.url.replace('myapp://', '')
    // Handle the URL or open specific windows based on the URL
    console.log('Received URL:', url)
  })
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
