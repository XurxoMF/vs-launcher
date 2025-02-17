import { parentPort, workerData } from "worker_threads"
import yauzl from "yauzl"
import fse from "fs-extra"
import path from "path"

const { filePath, outputPath, deleteZip } = workerData

yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
  if (err) {
    parentPort?.postMessage({ type: "error", message: `Error opening ZIP file: ${err.message}` })
    return
  }

  const totalFiles = zipfile.entryCount
  let extractedCount = 0
  let lastReportedProgress = 0

  zipfile.readEntry() // Comienza a leer el archivo ZIP

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
          fse.unlink(filePath, (err) => {
            if (err) {
              parentPort?.postMessage({ type: "error", message: `Error deleting ZIP file: ${err.message}` })
              return
            }
          })
        }

        parentPort?.postMessage({ type: "finished" })
      } else {
        zipfile.readEntry() // Leer siguiente entrada
      }
    } else {
      zipfile.openReadStream(entry, (err, readStream) => {
        if (err) {
          parentPort?.postMessage({ type: "error", message: `Error opening file ${entry.fileName}: ${err.message}` })
          zipfile.readEntry()
          return
        }

        fse.ensureDirSync(path.dirname(fullPath)) // Asegura que el directorio exista
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
            zipfile.readEntry() // Leer siguiente entrada
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
