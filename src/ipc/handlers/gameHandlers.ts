import { ipcMain } from "electron"
import { spawn } from "child_process"
import fse from "fs-extra"
import { join } from "path"
import os from "os"
import { logMessage } from "@src/utils/logManager"
import { IPC_CHANNELS } from "@src/ipc/ipcChannels"

ipcMain.handle(IPC_CHANNELS.GAME_MANAGER.EXECUTE_GAME, async (_event, version: GameVersionType, installation: InstallationType): Promise<boolean> => {
  logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Trying to run Vintage Story ${version.version} from ${version.path} on ${installation.path}.`)

  let command: string
  let params: string[]

  if (os.platform() === "linux") {
    logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Linux platform detected.`)

    try {
      const files = fse.readdirSync(version.path)

      if (files.includes("Vintagestory")) {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Vintagestory found.`)
        command = join(version.path, "Vintagestory")
        params = [`--dataPath=${installation.path}`, installation.startParams]
      } else if (files.includes("Vintagestory.exe")) {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Vintagestory.exe found.`)
        command = "mono"
        params = [join(version.path, "Vintagestory.exe"), `--dataPath=${installation.path}`, installation.startParams]
      } else {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Couldn't find a way to run the game, aborting...`)
        return false
      }
    } catch (err) {
      logMessage("error", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error detecting how to run the game.`)
      logMessage("verbose", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error detecting how to run the game: ${err}`)
      return false
    }
  } else if (os.platform() === "win32") {
    logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Windows platform detected.`)

    try {
      const files = fse.readdirSync(version.path)

      if (files.includes("Vintagestory")) {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Vintagestory found.`)
        command = join(version.path, "Vintagestory.exe")
        params = [`--dataPath=${installation.path}`, installation.startParams]
      } else {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Couldn't find a way to run the game, aborting...`)
        return false
      }
    } catch (err) {
      logMessage("error", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error detecting how to run the game.`)
      logMessage("verbose", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error detecting how to run the game: ${err}`)
      return false
    }
  } else if (os.platform() === "darwin") {
    logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] MacOS platform detected. Not yet supported.`)
    return false
  } else {
    logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Not platform detected.`)
    return false
  }

  if (command && params) {
    return new Promise((resolve, reject) => {
      logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Running Vintagestory with ${command} + ${params.join(" + ")}.`)

      const externalApp = spawn(command, params)

      externalApp.stdout.on("data", (data) => {
        logMessage("verbose", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] ${data}`)
      })

      externalApp.stderr.on("data", (data) => {
        logMessage("error", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Vintage Story threw an error! Check verbose logs for more info.`)
        logMessage("verbose", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] ${data}`)
      })

      externalApp.on("close", (code) => {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Vintage Story closed: ${code}`)
        resolve(true)
      })

      externalApp.on("error", (error) => {
        logMessage("error", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error running Vintage Story.`)
        logMessage("verbose", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] ${error}`)
        reject(false)
      })
    })
  } else {
    logMessage("error", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] No command or params found.`)
    return false
  }
})
