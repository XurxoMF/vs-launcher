import { parentPort, workerData } from "worker_threads"
import yauzl from "yauzl"
import fse from "fs-extra"
import path from "path"
import { logMessage } from "@src/utils/logManager"

const { id, filePath, outputPath, deleteZip } = workerData

yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
  if (err) {
    parentPort?.postMessage({ type: "error", message: `Error opening ZIP file: ${err.message}` })
    return
  }

  const totalFiles = zipfile.entryCount
  let extractedCount = 0
  let lastReportedProgress = 0

  zipfile.readEntry()

  zipfile.on("entry", (entry) => {
    const fullPath = path.join(outputPath, entry.fileName)

    if (/\/$/.test(entry.fileName)) {
      fse.ensureDirSync(fullPath)
      extractedCount++
      const progress = Math.round((extractedCount / totalFiles) * 100)
      if (progress > lastReportedProgress) {
        lastReportedProgress = progress
        parentPort?.postMessage({
          type: "progress",
          progress
        })
      }

      if (extractedCount === totalFiles) {
        zipfile.close()

        if (deleteZip) {
          logMessage("info", `[back] [ipc] [ipc/handlers/pathsHandlers.ts] [EXTRACT_ON_PATH] [${id}] [${filePath}] Eeleting origin file ${filePath}.`)

          fse.unlink(filePath, (err) => {
            if (err) {
              parentPort?.postMessage({ type: "error", message: `Error deleting ZIP file: ${err.message}` })
              return
            }
          })
        }

        parentPort?.postMessage({ type: "finished" })
      } else {
        zipfile.readEntry()
      }
    } else {
      zipfile.openReadStream(entry, (err, readStream) => {
        if (err) {
          parentPort?.postMessage({ type: "error", message: `Error opening file ${entry.fileName}: ${err.message}` })
          zipfile.readEntry()
          return
        }

        fse.ensureDirSync(path.dirname(fullPath))
        const writeStream = fse.createWriteStream(fullPath)

        readStream.pipe(writeStream)

        writeStream.on("error", (err) => {
          parentPort?.postMessage({ type: "error", message: `Error writing file ${entry.fileName}: ${err.message}` })
          zipfile.readEntry()
        })

        writeStream.on("finish", () => {
          extractedCount++
          const progress = Math.round((extractedCount / totalFiles) * 100)
          if (progress > lastReportedProgress) {
            lastReportedProgress = progress
            parentPort?.postMessage({
              type: "progress",
              progress
            })
          }

          if (extractedCount === totalFiles) {
            zipfile.close()

            if (deleteZip) {
              fse.unlink(filePath, (err) => {
                if (err) {
                  parentPort?.postMessage({ type: "error", message: `Error deleting ZIP file: ${err.message}` })
                  return
                }
              })
            }

            parentPort?.postMessage({ type: "finished" })
          } else {
            zipfile.readEntry()
          }
        })

        writeStream.on("error", (err) => {
          parentPort?.postMessage({ type: "error", message: `Error writing file ${entry.fileName}: ${err.message}` })
        })
      })
    }
  })

  zipfile.on("error", (err) => {
    parentPort?.postMessage({ type: "error", message: `Error while extracting: ${err.message}` })
  })
})
