import { ipcMain, app, shell } from "electron"
import fse from "fs-extra"
import { join } from "path"
import os from "os"
import { spawn } from "child_process"
import { Worker } from "worker_threads"

import { logMessage } from "@src/utils/logManager"
import { IPC_CHANNELS } from "@src/ipc/ipcChannels"

import compressWorker from "@src/ipc/workers/compressWorker?modulePath"
import extractWorker from "@src/ipc/workers/extractWorker?modulePath"
import changePermsWorker from "@src/ipc/workers/changePermsWorker?modulePath"
import downloadWorkerPath from "@src/ipc/workers/downloadWorker?modulePath"

ipcMain.handle(IPC_CHANNELS.PATHS_MANAGER.GET_CURRENT_USER_DATA_PATH, (): string => {
  return app.getPath("appData")
})

ipcMain.handle(IPC_CHANNELS.PATHS_MANAGER.DELETE_PATH, (_event, path: string): boolean => {
  try {
    logMessage("info", `[ipcMain] [delete-path] Deleting path: ${path}`)
    fse.removeSync(path)
    logMessage("info", `[ipcMain] [delete-path] Path deleted: ${path}`)
    return true
  } catch (err) {
    logMessage("error", `[ipcMain] [delete-path] Error deleting path: ${err}`)
    return false
  }
})

ipcMain.handle(IPC_CHANNELS.PATHS_MANAGER.FORMAT_PATH, (_event, parts: string[]): string => {
  return join(...parts)
})

ipcMain.handle(IPC_CHANNELS.PATHS_MANAGER.CHECK_PATH_EMPTY, (_event, path: string): boolean => {
  if (!fse.existsSync(path)) return true
  return fse.statSync(path).isDirectory() && fse.readdirSync(path).length === 0
})

ipcMain.handle(IPC_CHANNELS.PATHS_MANAGER.CHECK_PATH_EXISTS, (_event, path: string): boolean => {
  return fse.existsSync(path)
})

ipcMain.handle(IPC_CHANNELS.PATHS_MANAGER.OPEN_PATH_ON_FILE_EXPLORER, async (_event, path: string): Promise<string> => {
  return await shell.openPath(path)
})

ipcMain.handle(IPC_CHANNELS.FILES_MANAGER.DOWNLOAD_ON_PATH, (event, id, url, outputPath) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(downloadWorkerPath, {
      workerData: { url, outputPath }
    })

    worker.on("message", (data) => {
      if (data.type === "progress") {
        event.sender.send(IPC_CHANNELS.FILES_MANAGER.DOWNLOAD_PROGRESS, id, data.progress)
      } else if (data.type === "finished") {
        logMessage("info", `[ipcMain] [download-on-path] Finished`)
        resolve(data.path)
      }
    })

    worker.on("error", (error) => {
      logMessage("error", `[ipcMain] [download-on-path] Worker error: ${error.message}`)
      reject(false)
    })

    worker.on("exit", (code) => {
      logMessage("error", `[ipcMain] [compress-on-path] "Worker stopped with exit code ${code}`)
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
    })
  })
})

ipcMain.handle(IPC_CHANNELS.FILES_MANAGER.EXTRACT_ON_PATH, async (event, id: string, filePath: string, outputPath: string) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(extractWorker, {
      workerData: { filePath, outputPath }
    })

    worker.on("message", (message) => {
      if (message.type === "progress") {
        event.sender.send(IPC_CHANNELS.FILES_MANAGER.EXTRACT_PROGRESS, id, message.progress)
      } else if (message.type === "finished") {
        logMessage("info", `[ipcMain] [extract-on-path] Finished`)
        resolve(true)
      }
    })

    worker.on("error", (error) => {
      logMessage("error", `[ipcMain] [extract-on-path] Worker error: ${error.message}`)
      reject(error)
    })

    worker.on("exit", (code) => {
      if (code !== 0) {
        logMessage("error", `[ipcMain] [compress-on-path] "Worker stopped with exit code ${code}`)
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
})

ipcMain.handle(IPC_CHANNELS.FILES_MANAGER.COMPRESS_ON_PATH, async (event, id: string, inputPath: string, outputPath: string) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(compressWorker, {
      workerData: { inputPath, outputPath }
    })

    worker.on("message", (message) => {
      if (message.type === "progress") {
        event.sender.send(IPC_CHANNELS.FILES_MANAGER.COMPRESS_PROGRESS, id, message.progress)
      } else if (message.type === "finished") {
        logMessage("info", `[ipcMain] [compress-on-path] Finished`)
        resolve(true)
      }
    })

    worker.on("error", (error) => {
      logMessage("error", `[ipcMain] [compress-on-path] Worker error: ${error.message}`)
      reject(error)
    })

    worker.on("exit", (code) => {
      if (code !== 0) {
        logMessage("error", `[ipcMain] [compress-on-path] Worker stopped with exit code ${code}`)
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
})

ipcMain.handle(IPC_CHANNELS.FILES_MANAGER.CHANGE_PERMS, async (_event, paths: string[], perms: number) => {
  if (os.platform() === "linux") {
    logMessage("info", `[ipcMain] [change-perms] Linux platform detected`)

    return new Promise((resolve, reject) => {
      const worker = new Worker(changePermsWorker, {
        workerData: { paths, perms }
      })

      worker.on("message", (message) => {
        if (message === "done") {
          logMessage("info", `[ipcMain] [change-perms] Permissions changed successfully`)
          resolve(true)
        }
      })

      worker.on("error", (error) => {
        logMessage("error", `[ipcMain] [change-perms] Worker error: ${error.message}`)
        reject(false)
      })

      worker.on("exit", (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
      })
    })
  }

  return Promise.reject(true)
})

ipcMain.handle(IPC_CHANNELS.FILES_MANAGER.LOOK_FOR_A_GAME_VERSION, async (_event, path: string) => {
  logMessage("info", `[component] [look-for-a-game-version] Looking for the game at ${path}`)

  const files = fse.readdirSync(path)

  if (os.platform() === "linux") {
    logMessage("info", `[component] [look-for-a-game-version] Linux platform detected`)

    for (const file of files) {
      if (file === "Vintagestory") {
        logMessage("info", `[component] [look-for-a-game-version] Game found at ${path}/Vintagestory. Looking for its version...`)

        try {
          const version = await new Promise((resolve, reject) => {
            const child = spawn(join(path, "Vintagestory"), [`-v`])

            child.stdout.on("data", (data) => {
              const version = data.toString().trim()
              resolve(version)
            })

            child.stderr.on("data", (data) => {
              reject(new Error(data.toString().trim()))
            })

            child.on("error", (err) => {
              reject(err)
            })
          })

          return { exists: true, installedGameVersion: version }
        } catch (error) {
          logMessage("error", `[component] [look-for-a-game-version] Error: ${error}`)
          return { exists: false }
        }
      } else if (file === "Vintagestory.exe") {
        logMessage("info", `[component] [look-for-a-game-version] Game found at ${path}/Vintagestory.exe. Looking for its version...`)

        try {
          const version = await new Promise((resolve, reject) => {
            const child = spawn("mono", [join(path, "Vintagestory.exe"), `-v`])

            child.stdout.on("data", (data) => {
              const version = data.toString().trim()
              resolve(version)
            })

            child.stderr.on("data", (data) => {
              reject(new Error(data.toString().trim()))
            })

            child.on("error", (err) => {
              reject(err)
            })
          })

          return { exists: true, installedGameVersion: version }
        } catch (error) {
          logMessage("error", `[component] [look-for-a-game-version] Error: ${error}`)
          return { exists: false }
        }
      }
    }
  } else if (os.platform() === "win32") {
    logMessage("info", `[component] [look-for-a-game-version] Windows platform detected`)

    for (const file of files) {
      if (file === "Vintagestory.exe") {
        logMessage("info", `[component] [look-for-a-game-version] Game found at ${path}\\Vintagestory.exe. Looking for its version...`)

        try {
          const version = await new Promise((resolve, reject) => {
            const child = spawn(`${path}\\${file}`, [`-v`])

            child.stdout.on("data", (data) => {
              const version = data.toString().trim()
              resolve(version)
            })

            child.stderr.on("data", (data) => {
              reject(new Error(data.toString().trim()))
            })

            child.on("error", (err) => {
              reject(err)
            })
          })

          return { exists: true, installedGameVersion: version }
        } catch (error) {
          logMessage("error", `[component] [look-for-a-game-version] Error: ${error}`)
          return { exists: false }
        }
      }
    }
  }

  logMessage("info", `[component] [look-for-a-game-version] Game not found at ${path} or it has no version.`)
  return { exists: false }
})
