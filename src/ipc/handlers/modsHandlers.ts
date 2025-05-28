import { app, ipcMain } from "electron"
import fse from "fs-extra"
import yauzl from "yauzl"
import { IPC_CHANNELS } from "../ipcChannels"
import { logMessage } from "@src/utils/logManager"
import { join } from "path"
import JSON5 from "json5"
import { v4 as uuidv4 } from "uuid"

ipcMain.handle(IPC_CHANNELS.MODS_MANAGER.GET_INSTALLED_MODS, async (_event, path: string): Promise<{ mods: InstalledModType[]; errors: ErrorInstalledModType[] }> => {
  try {
    logMessage("info", `[back] [mods] [ipc/handlers/modsHandlers.ts] [GET_INSTALLED_MODS] Looking for mods at ${path}.`)

    if (!fse.pathExistsSync(path)) {
      logMessage("info", `[back] [mods] [ipc/handlers/modsHandlers.ts] [GET_INSTALLED_MODS] That path does not exists. 0 mods detected.`)
      return { mods: [], errors: [] }
    }

    const infoMods = await getMods(path)

    logMessage("info", `[back] [mods] [ipc/handlers/modsHandlers.ts] [GET_INSTALLED_MODS] Found ${infoMods.mods.length} mods and ${infoMods.errors.length} mods with errors.`)
    if (infoMods.errors.length > 0)
      logMessage("debug", `[back] [mods] [ipc/handlers/modsHandlers.ts] [GET_INSTALLED_MODS] Found ${infoMods.errors.length} mods with errors: ${infoMods.errors.map((mwe) => mwe.zipname)}`)
    return { mods: infoMods.mods, errors: infoMods.errors }
  } catch (err) {
    logMessage("error", `[back] [mods] [ipc/handlers/modsHandlers.ts] [GET_INSTALLED_MODS] Error getting installed mods.`)
    logMessage("debug", `[back] [mods] [ipc/handlers/modsHandlers.ts] [GET_INSTALLED_MODS] Error getting installed mods: ${err}`)
    return { mods: [], errors: [] }
  }
})

/**
 * Get a list of mods in a folder and read the modinfo.json of each one to get the mod information.
 *
 * @param {string} path The path to the folder with the mods.
 * @returns {Promise<{mods: InstalledModType[]; errors: ErrorInstalledModType[]}>} A list with the succesfully parsed mods and another list with the mods that threw an error.
 */
async function getMods(path: string): Promise<{ mods: InstalledModType[]; errors: ErrorInstalledModType[] }> {
  const pathToImages = join(app.getPath("userData"), "Cache", "Images", "Mods")

  const mods: InstalledModType[] = []
  const errors: ErrorInstalledModType[] = []

  const files = fse.readdirSync(path).filter((file) => file.endsWith(".zip"))

  logMessage("info", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] Found ${files.length} zip files. Starting reading them looking for mods.`)

  // Wait for all the mods to be parsed.
  await Promise.all(
    files.map((file) => {
      const zipPath = join(path, file)

      return new Promise<void>((resolve) => {
        let imageFound: string | undefined = undefined
        let modFound: InstalledModType | undefined = undefined

        yauzl.open(zipPath, { lazyEntries: true }, (err, zip) => {
          if (err) {
            logMessage("error", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error opening zip file.`)
            logMessage("debug", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error opening zip file: ${err}`)
            errors.push({ zipname: file, path: zipPath })
            return resolve()
          }

          if (zip.isOpen) zip.readEntry()

          function closeZipReturnResolve(): void {
            if (zip && zip.isOpen) {
              zip.close()
              return resolve()
            } else {
              return resolve()
            }
          }

          zip.on("entry", (entry) => {
            if (entry.fileName === "modinfo.json") {
              zip.openReadStream(entry, (err, stream) => {
                if (err) {
                  logMessage("error", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error reading stream for ${entry}.`)
                  logMessage("debug", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error reading stream for ${entry}: ${err}`)
                  errors.push({ zipname: file, path: zipPath })
                  closeZipReturnResolve()
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
                      modFound = mod

                      if (imageFound) {
                        const imgName = `${mod.modid}.png`

                        const origin = join(pathToImages, imageFound)
                        const destination = join(pathToImages, imgName)

                        fse.moveSync(origin, destination, { overwrite: true })

                        modFound._image = imgName

                        mods.push(modFound)
                      }
                    } else {
                      logMessage("error", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Couldn't identify a mod.`)
                      logMessage("debug", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Couldn't identify a mod: ${JSON.stringify(json)}`)
                      errors.push({ zipname: file, path: zipPath })
                      resolve()
                    }
                  } catch (err) {
                    logMessage("error", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error parsing modinfo.json.`)
                    logMessage("debug", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error parsing modinfo.json: ${err}`)
                    errors.push({ zipname: file, path: zipPath })
                    closeZipReturnResolve()
                  } finally {
                    if (modFound && imageFound) closeZipReturnResolve()
                    if (zip.isOpen) zip.readEntry()
                  }
                })

                stream.on("error", (err) => {
                  logMessage("error", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error reading modinfo.json.`)
                  logMessage("debug", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error reading modinfo.json: ${err}`)
                })
              })
            } else if (entry.fileName === "modicon.png") {
              zip.openReadStream(entry, (err, stream) => {
                if (err) {
                  logMessage("error", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error reading stream for ${entry}.`)
                  logMessage("debug", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error reading stream for ${entry}: ${err}`)
                  closeZipReturnResolve()
                }

                const chunks: Buffer[] = []
                stream.on("data", (chunk) => chunks.push(chunk))
                stream.on("end", async () => {
                  try {
                    const imageBuffer = Buffer.concat(chunks)

                    let imageName = `${uuidv4()}.png`
                    if (modFound) imageName = `${modFound.name}.png`

                    const imagePath = join(pathToImages, imageName)

                    fse.ensureDirSync(pathToImages)

                    fse.writeFileSync(imagePath, imageBuffer)

                    imageFound = imageName

                    if (modFound) {
                      modFound._image = imageName

                      mods.push(modFound)
                    }
                  } catch (imageErr) {
                    logMessage("error", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error saving the mod's logo.`)
                  } finally {
                    if (modFound && imageFound) closeZipReturnResolve()
                    if (zip.isOpen) zip.readEntry()
                  }
                })

                stream.on("error", (err) => {
                  logMessage("error", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error reading image.png.`)
                  logMessage("debug", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error reading image.png: ${err}`)
                })
              })
            } else {
              if (zip.isOpen) zip.readEntry()
            }
          })

          zip.on("end", () => {
            if (modFound && !imageFound) mods.push(modFound)
            closeZipReturnResolve()
          })

          zip.on("error", (err) => {
            logMessage("error", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error with ZIP file.`)
            logMessage("debug", `[back] [mods] [ipc/handlers/modsHandlers.ts] [getModsInfo] [${file}] Error with ZIP file: ${err}`)
            errors.push({ zipname: file, path: zipPath })
            closeZipReturnResolve()
          })
        })
      })
    })
  )
  return { mods: mods, errors: errors }
}
