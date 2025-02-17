import { app, ipcMain } from "electron"
import fse from "fs-extra"
import yauzl from "yauzl"
import { IPC_CHANNELS } from "../ipcChannels"
import { logMessage } from "@src/utils/logManager"
import { join } from "path"

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
  try {
    if (!fse.pathExistsSync(path)) return []

    const modsInfo = await getModsInfo(path)
    const mods = await addImagesToMods(modsInfo)

    return mods
  } catch (err) {
    logMessage("error", `[ipcMain] [get-installed-mods] There was an error getting installed mods: ${err}`)
    return []
  }
})

async function getModsInfo(path: string): Promise<InstalledModType[]> {
  const mods: InstalledModType[] = []

  const files = fse.readdirSync(path).filter((file) => file.endsWith(".zip"))

  await Promise.all(
    files.map(async (file) => {
      const zipPath = join(path, file)

      return new Promise<void>((resolve, reject) => {
        yauzl.open(zipPath, { lazyEntries: true }, (err, zip) => {
          if (err) {
            zip.close()
            if (err?.message.includes("End of central directory record signature not found.")) return resolve()
            return reject(err)
          }

          zip.readEntry()

          zip.on("entry", (entry) => {
            if (entry.fileName === "modinfo.json") {
              zip.openReadStream(entry, (err, stream) => {
                if (err) {
                  zip.close()
                  return reject(err)
                }

                let data = ""
                stream.on("data", (chunk) => (data += chunk))
                stream.on("end", () => {
                  try {
                    const json = JSON.parse(data)

                    // This is ugly as fuck and I should not do it... but some modders decided that using camelcase or uppercase was fun for some reason
                    // and if I don't do this it'll break everything related to mods...
                    const mod: InstalledModType = {
                      name: json["name"] || json["Name"],
                      modid: json["modid"] || json["Modid"] || json["ModID"] || json["modID"],
                      version: json["version"] || json["Version"],
                      path: zipPath,
                      description: json["description"] || json["Description"],
                      side: json["side"] || json["Side"],
                      authors: json["authors"] || json["Authors"] || (json["author"] && [json["author"]]) || (json["Authors"] && [json["Authors"]]),
                      contributors: json["contributors"] || json["Contributors"],
                      type: json["type"] || json["Type"]
                    }

                    if (mod.modid && mod.version && mod.name && mod.path) {
                      mods.push(mod)
                    } else {
                      logMessage("error", `[ipcMain] [get-installed-mods] [getModsInfo] A mod could not be loaded: ${json}`)
                    }

                    resolve()
                  } catch (parseErr) {
                    reject(parseErr)
                  } finally {
                    zip.close()
                  }
                })
              })
            } else {
              zip.readEntry()
            }
          })

          zip.once("end", () => {
            zip.close()
            resolve()
          })
        })
      })
    })
  )

  return mods
}

async function addImagesToMods(modsInfo: InstalledModType[]): Promise<InstalledModType[]> {
  const pathToImages = join(app.getPath("userData"), "Cache", "Images")

  const mods = [...modsInfo]

  await Promise.all(
    mods.map(async (iMod) => {
      await new Promise<void>((resolve, reject) => {
        yauzl.open(iMod.path, { lazyEntries: true }, (err, zip) => {
          if (err) {
            zip.close()
            if (err?.message.includes("End of central directory record signature not found.")) return resolve()
            return reject(err)
          }

          zip.readEntry()

          zip.on("entry", (entry) => {
            if (entry.fileName === "modicon.png") {
              zip.openReadStream(entry, (err, stream) => {
                if (err) {
                  zip.close()
                  return reject(err)
                }

                const chunks: Buffer[] = []
                stream.on("data", (chunk) => chunks.push(chunk))
                stream.on("end", async () => {
                  try {
                    const imageBuffer = Buffer.concat(chunks)
                    const modId = iMod.modid
                    const imageName = `${modId}.png`
                    const imagePath = join(pathToImages, imageName)

                    if (!fse.existsSync(pathToImages)) {
                      fse.mkdirSync(pathToImages, { recursive: true })
                    }

                    fse.writeFileSync(imagePath, imageBuffer)

                    iMod._image = imageName
                  } catch (imageErr) {
                    return reject(imageErr)
                  } finally {
                    zip.close()
                    resolve()
                  }
                })
              })
            } else {
              zip.readEntry()
            }
          })

          zip.once("end", () => {
            zip.close()
            resolve()
          })
        })
      })
    })
  )

  return mods
}
