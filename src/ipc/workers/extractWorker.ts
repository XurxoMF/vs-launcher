import { parentPort, workerData } from "worker_threads"
import Seven from "node-7z"
import fse from "fs-extra"

const { filePath, outputPath, deleteZip, sevenZipBin } = workerData

try {
  fse.ensureDirSync(outputPath)

  const stream = Seven.extractFull(filePath, outputPath, {
    $bin: sevenZipBin,
    $progress: true,
    recursive: true,
  })

  let lastReportedProgress = 0

  stream.on("progress", ({ percent }) => {
    if (percent > lastReportedProgress) {
      lastReportedProgress = percent
      parentPort?.postMessage({ type: "progress", progress: percent })
    }
  })

  stream.on("end", () => {
    parentPort?.postMessage({ type: "progress", progress: 100 })

    if (deleteZip) {
      fse.unlink(filePath, (err) => {
        if (err) {
          parentPort?.postMessage({ type: "error", message: `Error deleting ZIP file: ${err.message}` })
        }
      })
    }

    parentPort?.postMessage({ type: "finished" })
  })

  stream.on("error", (err) => {
    parentPort?.postMessage({ type: "error", message: `Unexpected error: ${err}` })
  })
} catch (err) {
  parentPort?.postMessage({ type: "error", message: `Unexpected error: ${err}` })
}
