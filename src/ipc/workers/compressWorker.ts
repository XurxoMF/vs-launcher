import { parentPort, workerData } from "worker_threads"
import Seven from "node-7z"
import fse from "fs-extra"
import { join } from "path"

const { inputPath, outputPath, outputFileName, compressionLevel = 6, sevenZipBin } = workerData

try {
  if (!fse.existsSync(outputPath)) {
    fse.mkdirSync(outputPath, { recursive: true })
  }

  const archivePath = join(outputPath, outputFileName)
  const sourceGlob = join(inputPath, "*")

  const stream = Seven.add(archivePath, sourceGlob, {
    $bin: sevenZipBin,
    $progress: true,
    recursive: true,
    method: [`x=${compressionLevel}`, "mt=on"],
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
    parentPort?.postMessage({ type: "finished" })
  })

  stream.on("error", (err) => {
    parentPort?.postMessage({ type: "error", message: `Unexpected error: ${err}` })
  })
} catch (err) {
  parentPort?.postMessage({ type: "error", message: `Unexpected error: ${err}` })
}
