import { ipcMain } from "electron"
import { spawn } from "child_process"
import fse from "fs-extra"
import { join } from "path"
import os from "os"
import { logMessage } from "@src/utils/logManager"
import { IPC_CHANNELS } from "@src/ipc/ipcChannels"

ipcMain.handle(IPC_CHANNELS.GAME_MANAGER.EXECUTE_GAME, async (_event, version: GameVersionType, installation: InstallationType, account: AccountType | null): Promise<boolean> => {
  logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Trying to run Vintage Story ${version.version} from ${version.path} on ${installation.path}.`)

  const processEnv = installation.envVars.split(",").reduce((acc, entry) => {
    const [key, value] = entry.trim().split("=")
    if (key && value) acc[key] = value
    return acc
  }, {})

  let command: string
  let params: string[]
  let env: NodeJS.ProcessEnv = { ...process.env, ...processEnv }

  if (os.platform() === "linux") {
    logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Linux platform detected.`)

    try {
      const files = fse.readdirSync(version.path)

      if (files.includes("Vintagestory")) {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Vintagestory found.`)
        command = join(version.path, "Vintagestory")
        params = [`--dataPath=${installation.path}`, installation.startParams]
        if (installation.mesaGlThread) env = { ...env, MESA_GLTHREAD: "true" }
      } else if (files.includes("Vintagestory.exe")) {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Vintagestory.exe found.`)
        command = "mono"
        params = [join(version.path, "Vintagestory.exe"), `--dataPath=${installation.path}`, installation.startParams]
      } else {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Couldn't find a way to run Vintage Story, aborting...`)
        return false
      }
    } catch (err) {
      logMessage("error", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error detecting how to run Vintage Story.`)
      logMessage("verbose", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error detecting how to run Vintage Story: ${err}`)
      return false
    }
  } else if (os.platform() === "win32") {
    logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Windows platform detected.`)

    try {
      const files = fse.readdirSync(version.path)

      if (files.includes("Vintagestory.exe")) {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Vintagestory found.`)
        command = join(version.path, "Vintagestory.exe")
        params = [`--dataPath=${installation.path}`, installation.startParams]
      } else {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Couldn't find a way to run Vintage Story, aborting...`)
        return false
      }
    } catch (err) {
      logMessage("error", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error detecting how to run Vintage Story.`)
      logMessage("verbose", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error detecting how to run Vintage Story: ${err}`)
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
      if (account) {
        logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Logged in. Setting session keys.`)

        !(async (): Promise<void> => {
          try {
            const clientsettingsPath = join(installation.path, "clientsettings.json")

            if (!fse.existsSync(clientsettingsPath)) {
              fse.ensureFileSync(clientsettingsPath)
              fse.writeJSONSync(clientsettingsPath, {
                stringSettings: {
                  mptoken: account.mptoken,
                  sessionkey: account.sessionKey,
                  sessionsignature: account.sessionSignature,
                  useremail: account.email,
                  entitlements: account.playerEntitlements,
                  playeruid: account.playerUid,
                  playername: account.playerName,
                  hostgameserver: account.hostGameServer
                }
              })
            } else {
              const clientsettings = fse.readJSONSync(clientsettingsPath, "utf-8")

              clientsettings["stringSettings"]["mptoken"] = account.mptoken
              clientsettings["stringSettings"]["sessionkey"] = account.sessionKey
              clientsettings["stringSettings"]["sessionsignature"] = account.sessionSignature
              clientsettings["stringSettings"]["useremail"] = account.email
              clientsettings["stringSettings"]["entitlements"] = account.playerEntitlements
              clientsettings["stringSettings"]["playeruid"] = account.playerUid
              clientsettings["stringSettings"]["playername"] = account.playerName
              clientsettings["stringSettings"]["hostgameserver"] = account.hostGameServer

              fse.writeJSONSync(clientsettingsPath, clientsettings)
            }
          } catch (err) {
            logMessage("error", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error setting login session keys.`)
            logMessage("debug", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Error setting login session keys: ${err}`)
          }
        })()
      }

      logMessage("info", `[back] [ipc] [ipc/handlers/gameHandlers.ts] [EXECUTE_GAME] Running Vintagestory with ${command} + ${params.join(" + ")}.`)

      const externalApp = spawn(command, params, { env })

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

ipcMain.handle(IPC_CHANNELS.GAME_MANAGER.LOOK_FOR_A_GAME_VERSION, async (_event, path: string) => {
  logMessage("info", `[component] [look-for-a-game-version] Looking for the game at ${path}`)

  let command: string
  let params: string[]

  const res: { exists: boolean; installedGameVersion: string | undefined } = { exists: false, installedGameVersion: undefined }

  if (os.platform() === "linux") {
    logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Linux platform detected.`)

    try {
      const files = fse.readdirSync(path)

      if (files.includes("Vintagestory")) {
        logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Vintagestory found.`)
        command = join(path, "Vintagestory")
        params = [`-v`]
      } else if (files.includes("Vintagestory.exe")) {
        logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Vintagestory.exe found.`)
        command = "mono"
        params = [join(path, "Vintagestory.exe"), `-v`]
      } else {
        logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Couldn't find Vintage Story on that folder.`)
        return false
      }
    } catch (err) {
      logMessage("error", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Error looking for Vintage Story.`)
      logMessage("verbose", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Error looking for Vintage Story: ${err}`)
      return false
    }
  } else if (os.platform() === "win32") {
    logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Windows platform detected.`)

    try {
      const files = fse.readdirSync(path)

      if (files.includes("Vintagestory.exe")) {
        logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Vintagestory found.`)
        command = join(path, "Vintagestory.exe")
        params = [`-v`]
      } else {
        logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Couldn't find Vintage Story on that folder.`)
        return false
      }
    } catch (err) {
      logMessage("error", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Error looking for Vintage Story.`)
      logMessage("verbose", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Error looking for Vintage Story: ${err}`)
      return false
    }
  } else if (os.platform() === "darwin") {
    logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] MacOS platform detected. Not yet supported.`)
    return false
  } else {
    logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Not platform detected.`)
    return false
  }

  if (command && params) {
    const checkGameVersion = await new Promise<string | undefined>((resolve, reject) => {
      logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Checking Vintage Story version with ${command} + ${params.join(" + ")}.`)

      const externalApp = spawn(command, params)
      let versionResult: string

      externalApp.stdout.on("data", (data) => {
        logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] ${data}`)
        versionResult = data.toString().trim()
        resolve(versionResult)
      })

      externalApp.stderr.on("data", (data) => {
        logMessage("error", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Vintage Story threw an error! Check verbose logs for more info.`)
        logMessage("verbose", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] ${data}`)
      })

      externalApp.on("close", (code) => {
        logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Vintage Story closed: ${code}`)
        resolve(versionResult)
      })

      externalApp.on("error", (error) => {
        logMessage("error", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] Error looking for the Vintage Story version.`)
        logMessage("verbose", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] ${error}`)
        reject(undefined)
      })
    })

    res.exists = true
    res.installedGameVersion = checkGameVersion
    return res
  } else {
    logMessage("error", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [LOOK_FOR_A_GAME_VERSION] No command or params found.`)
    return res
  }
})
