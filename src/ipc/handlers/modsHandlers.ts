import { app, ipcMain } from "electron"
import fse from "fs-extra"
import yauzl from "yauzl"
import { IPC_CHANNELS } from "../ipcChannels"
import { logMessage } from "@src/utils/logManager"
import { join } from "path"
import JSON5 from "json5"

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

ipcMain.handle(IPC_CHANNELS.MODS_MANAGER.GET_INSTALLED_MODS, async (_event, path: string): Promise<{ mods: InstalledModType[]; errors: ErrorInstalledModType[] }> => {
  try {
    if (!fse.pathExistsSync(path)) return { mods: [], errors: [] }

    const infoMods = await getModsInfo(path)
    const mods = await addImagesToMods(infoMods.mods)

    return { mods: mods, errors: infoMods.errors }
  } catch (err) {
    logMessage("error", `[ipcMain] [get-installed-mods] There was an error getting installed mods: ${err}`)
    return { mods: [], errors: [] }
  }
})

/**
 * Get a list of mods in a folder and read the modinfo.json of each one to get the mod information.
 *
 * @param {string} path The path to the folder with the mods.
 * @returns {Promise<{mods: InstalledModType[]; errors: ErrorInstalledModType[]}>} A list with the succesfully parsed mods and another list with the mods that threw an error.
 */
async function getModsInfo(path: string): Promise<{ mods: InstalledModType[]; errors: ErrorInstalledModType[] }> {
  const mods: InstalledModType[] = []
  const errors: ErrorInstalledModType[] = []

  const files = fse.readdirSync(path).filter((file) => file.endsWith(".zip"))

  // Wait for all the mods to be parsed.
  await Promise.all(
    files.map((file) => {
      const zipPath = join(path, file)

      return new Promise<void>((resolve) => {
        yauzl.open(zipPath, { lazyEntries: true }, (err, zip) => {
          if (err) {
            logMessage("error", `[ipcMain] [get-installed-mods] [getModsInfo] An error occurred opening ${file}: ${err}`)
            errors.push({ zipname: file, path: zipPath })
            return resolve()
          }

          zip.readEntry()

          zip.on("entry", (entry) => {
            if (entry.fileName === "modinfo.json") {
              zip.openReadStream(entry, (err, stream) => {
                if (err) {
                  logMessage("error", `[ipcMain] [get-installed-mods] [getModsInfo] Error reading stream for ${file}: ${err}`)
                  errors.push({ zipname: file, path: zipPath })
                  return resolve()
                }

                let data = ""
                stream.on("data", (chunk) => (data += chunk))
                stream.on("end", () => {
                  try {
                    const json = JSON5.parse(data)

                    const mod: InstalledModType = {
                      name: json["name"] || json["Name"],
                      modid: json["modid"] || json["Modid"] || json["ModID"] || json["modID"] || json["modId"],
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
                      logMessage("error", `[ipcMain] [get-installed-mods] [getModsInfo] Missing modid, version, name, or path for ${file}`)
                      errors.push({ zipname: file, path: zipPath })
                    }
                  } catch (err) {
                    logMessage("error", `[ipcMain] [get-installed-mods] [getModsInfo] Error parsing JSON for ${file}: ${err}`)
                    errors.push({ zipname: file, path: zipPath })
                  } finally {
                    resolve()
                  }
                })
              })
            } else {
              zip.readEntry()
            }
          })

          zip.on("end", () => {
            zip.close()
            resolve()
          })

          zip.on("error", (err) => {
            logMessage("error", `[ipcMain] [get-installed-mods] [getModsInfo] Zip error for ${file}: ${err}`)
            errors.push({ zipname: file, path: zipPath })
            resolve()
          })
        })
      })
    })
  )

  return { mods: mods, errors: errors }
}

/**
 * Get a list of mods in a folder and read the modinfo.json of each one to get the mod information.
 *
 * @param {InstalledModType[]} modsInfo List of mods.
 * @returns {Promise<InstalledModType[]>} A list with the same mods but with the image added to _image. Undefined if there is no image.
 */
async function addImagesToMods(modsInfo: InstalledModType[]): Promise<InstalledModType[]> {
  const pathToImages = join(app.getPath("userData"), "Cache", "Images")

  const modsWithImages = [...modsInfo]

  // Wait for all the mods to be parsed.
  await Promise.all(
    modsWithImages.map(async (iMod) => {
      // Add a promise to the list while the current mod is parsed.
      await new Promise<void>((resolve) => {
        yauzl.open(iMod.path, { lazyEntries: true }, (err, zip) => {
          if (err) {
            logMessage("error", `[ipcMain] [get-installed-mods] [addImagesToMods] An error occurred opening ${iMod.path}: ${err}`)
            return resolve()
          }

          zip.readEntry()

          zip.on("entry", (entry) => {
            if (entry.fileName === "modicon.png") {
              zip.openReadStream(entry, (err, stream) => {
                if (err) {
                  logMessage("error", `[ipcMain] [get-installed-mods] [addImagesToMods] Error reading stream for ${iMod.path}: ${err}`)
                  return resolve()
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
                    logMessage("error", `[ipcMain] [get-installed-mods] [addImagesToMods] Error saving the image of the ${iMod.path} mod: ${imageErr}`)
                  } finally {
                    resolve()
                  }
                })
              })
            } else {
              zip.readEntry()
            }
          })

          zip.on("end", () => {
            zip.close()
            resolve()
          })

          zip.on("error", (err) => {
            logMessage("error", `[ipcMain] [get-installed-mods] [addImagesToMods] Zip error for ${iMod.path}: ${err}`)
            resolve()
          })
        })
      })
    })
  )

  return modsWithImages
}
