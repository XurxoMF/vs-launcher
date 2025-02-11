import { app, shell, BrowserWindow, protocol, net } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import { autoUpdater } from "electron-updater"
import log from "electron-log"
import { pathToFileURL } from "url"

const customUserDataPath = join(app.getPath("appData"), "VSLauncher")
app.setPath("userData", customUserDataPath)

import { ensureConfig } from "@src/config/configManager"
import { getShouldPreventClose } from "@src/utils/shouldPreventClose"
import icon from "../../resources/icon.png?asset"
import { logMessage } from "@src/utils/logManager"
import { IPC_CHANNELS } from "@src/ipc/ipcChannels"

import "@src/ipc"

autoUpdater.logger = log
autoUpdater.logger.info("Logger configured for auto-updater")

let mainWindow: BrowserWindow

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: `VS Launcher`,
    show: false,
    autoHideMenuBar: true,
    fullscreenable: false,
    minWidth: 1280,
    minHeight: 720,
    icon: icon,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      sandbox: false,
      preload: join(__dirname, "../preload/index.js")
    }
  })

  mainWindow.on("ready-to-show", () => {
    logMessage("info", "[main] Main window ready to show")
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })

  mainWindow.on("close", (e) => {
    if (getShouldPreventClose()) {
      logMessage("info", "[main] Prevented from closing")
      e.preventDefault()
      return false
    }
    logMessage("info", "[main] Main window closing")
    return true
  })

  // HMR for renderer base on electron-vite cli. Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"))
  }
}

// This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  logMessage("info", "[main] Electron ready")

  // Handler for mod icons
  protocol.handle("cachemodimg", (req) => {
    const srcPath = join(app.getPath("userData"), "Cache", "Images")
    const reqURL = new URL(req.url)
    const fileToPathURL = pathToFileURL(join(srcPath, reqURL.pathname)).toString()
    return net.fetch(fileToPathURL)
  })

  await ensureConfig()

  // Set app user model id for windows
  electronApp.setAppUserModelId("xyz.xurxomf")

  // Default open or close DevTools by F12 in development and ignore CommandOrControl + R in production.
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // Check for updates
  autoUpdater.checkForUpdatesAndNotify()

  // If there is an update available send an event to the client.
  autoUpdater.on("update-available", () => {
    mainWindow.webContents.send(IPC_CHANNELS.APP_UPDATER.UPDATE_AVAILABLE)
  })

  // If there is an update downloaded send an event to the client.
  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send(IPC_CHANNELS.APP_UPDATER.UPDATE_DOWNLOADED)
  })

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  logMessage("info", "[main] All windows closed")
  if (process.platform !== "darwin") {
    app.quit()
  }
})
