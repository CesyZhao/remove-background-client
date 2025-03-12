import { app, shell, BrowserWindow, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// 修改图标导入方式（第4-5行）
import { nativeImage } from 'electron'
import path from 'path'
import Bridge from '@core/Bridge'

// 删除原有的icon导入
// import icon from '../../resources/icon.png?asset'
// import devIcon from '../../resources/dev_icon.icns?asset'

// 创建原生图像实例
const appIcon = nativeImage.createFromPath(
  process.env.NODE_ENV === 'development' 
    ? path.join(__dirname, '../../../resources/dev_icon.icns')
    : path.join(__dirname, '../../../resources/icon.png')
)

let bridge: Bridge | null = null

function createWindow(): void {
  new Tray(appIcon) // 使用原生图像实例
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    transparent: true,
    icon: appIcon, // 直接使用图像实例
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  bridge = new Bridge()
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (bridge) {
    bridge.destroy()
    bridge = null
  }
})
