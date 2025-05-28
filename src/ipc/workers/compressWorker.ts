import { parentPort, workerData } from "worker_threads"
import archiver from "archiver"
import fse from "fs-extra"
import { join } from "path"

const { inputPath, outputPath, outputFileName, compressionLevel = 6 } = workerData

const output = fse.createWriteStream(join(outputPath, outputFileName))
const archive = archiver("zip", { zlib: { level: compressionLevel } })

let totalFiles = 0
let lastReportedProgress = 0

function countFiles(dirPath: string): void {
  const entries = fse.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name)

    totalFiles++

    if (entry.isDirectory()) countFiles(fullPath)
  }
}

try {
  countFiles(inputPath)

  if (!fse.existsSync(outputPath)) {
    fse.mkdirSync(outputPath, { recursive: true })
  }

  archive.on("progress", ({ entries }) => {
    const progress = Math.floor((entries.processed / totalFiles) * 100)
    if (progress > lastReportedProgress) {
      lastReportedProgress = progress
      parentPort?.postMessage({
        type: "progress",
        progress
      })
    }
  })

  archive.on("error", (err) => {
    parentPort?.postMessage({ type: "error", message: `Unexpected error: ${err}` })
  })

  output.on("close", () => {
    parentPort?.postMessage({ type: "progress", progress: 100 })
    parentPort?.postMessage({ type: "finished" })
  })

  archive.pipe(output)

  archive.directory(inputPath, false)

  archive.finalize()
} catch (err) {
  parentPort?.postMessage({ type: "error", message: `Unexpected error: ${err}` })
}
