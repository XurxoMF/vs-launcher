import { ipcMain, dialog, app, shell } from "electron"
import { platform } from "os"

import { IPC_CHANNELS } from "@src/ipc/ipcChannels"
import { logMessage } from "@src/utils/logManager"
import { setShouldPreventClose } from "@src/utils/shouldPreventClose"

ipcMain.handle(IPC_CHANNELS.UTILS.GET_APP_VERSION, () => {
  return app.getVersion()
})

ipcMain.handle(IPC_CHANNELS.UTILS.GET_OS, () => {
  return platform()
})

ipcMain.on(IPC_CHANNELS.UTILS.LOG_MESSAGE, (_event, mode: ErrorTypes, message: string): void => {
  logMessage(mode, message)
})

ipcMain.on(IPC_CHANNELS.UTILS.SET_PREVENT_APP_CLOSE, (_event, action: "add" | "remove", id: string) => {
  setShouldPreventClose(action, id)
})

ipcMain.on(IPC_CHANNELS.UTILS.OPEN_ON_BROWSER, (_event, url: string): void => {
  shell.openExternal(url)
})

ipcMain.handle(IPC_CHANNELS.UTILS.SELECT_FOLDER_DIALOG, async () => {
  const result = await dialog.showOpenDialog({
    title: "Selecciona una carpeta",
    properties: ["openDirectory"]
  })

  if (result.canceled) return null

  return result.filePaths[0]
})
