import { ipcMain } from "electron"
import { autoUpdater } from "electron-updater"

import { IPC_CHANNELS } from "../ipcChannels"

ipcMain.on(IPC_CHANNELS.APP_UPDATER.UPDATE_AND_RESTART, () => {
  autoUpdater.quitAndInstall()
})
