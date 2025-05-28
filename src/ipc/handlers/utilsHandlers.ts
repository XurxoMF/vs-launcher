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

ipcMain.on(IPC_CHANNELS.UTILS.SET_PREVENT_APP_CLOSE, (_event, action: "add" | "remove", id: string, desc: string) => {
  setShouldPreventClose(action, id, desc)
})

ipcMain.on(IPC_CHANNELS.UTILS.OPEN_ON_BROWSER, (_event, url: string): void => {
  logMessage("info", `[back] [ipc] [ipc/handlers/utilsHandlers.ts] [OPEN_ON_BROWSER] Opening ${url} on the default browser.`)

  shell.openExternal(url)
})

ipcMain.handle(IPC_CHANNELS.UTILS.SELECT_FOLDER_DIALOG, async (_event, options?: { type?: "file" | "folder"; mode?: "single" | "multi"; extensions?: string[] }): Promise<string[]> => {
  logMessage("info", `[back] [ipc] [ipc/handlers/utilsHandlers.ts] [SELECT_FOLDER_DIALOG] Opening folder selection.`)

  const properties: ("openFile" | "openDirectory" | "multiSelections")[] = [options?.type === "file" ? "openFile" : "openDirectory"]

  if (options?.mode === "multi") properties.push("multiSelections")

  const result = await dialog.showOpenDialog({
    title: "Selecciona una carpeta",
    properties,
    filters: options?.extensions && [{ name: options.extensions.join(", "), extensions: options.extensions }]
  })

  if (result.canceled) {
    logMessage("warn", `[back] [ipc] [ipc/handlers/utilsHandlers.ts] [SELECT_FOLDER_DIALOG] Operation cancelled.`)
    return []
  }

  logMessage("info", `[back] [ipc] [ipc/handlers/utilsHandlers.ts] [SELECT_FOLDER_DIALOG] Folder selected: ${result}.`)

  return result.filePaths
})
