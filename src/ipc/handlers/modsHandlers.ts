import { ipcMain } from "electron"
import fse from "fs-extra"
import { IPC_CHANNELS } from "../ipcChannels"
import { logMessage } from "@src/utils/logManager"

ipcMain.handle(IPC_CHANNELS.MODS_MANAGER.COUNT_MODS, async (_event, path: string): Promise<{ status: boolean; count: number }> => {
  try {
    if (!fse.pathExistsSync(path)) return { status: true, count: 0 }
    const modCount = fse.readdirSync(path).length
    return { status: true, count: modCount }
  } catch (err) {
    logMessage("error", `[ipcMain] [count-mods] There was an error counting mods`)
    return { status: false, count: 0 }
  }
})

ipcMain.handle(IPC_CHANNELS.MODS_MANAGER.GET_INSTALLED_MODS, async (_event, path: string): Promise<InstalledModType[]> => {
  console.log(path)

  return []
})
