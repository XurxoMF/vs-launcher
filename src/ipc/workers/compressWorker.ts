import { parentPort, workerData } from "worker_threads"
import yazl from "yazl"
import fs from "fs"
import path from "path"

const { inputPath, outputPath } = workerData

const zipFile = new yazl.ZipFile()
const output = fs.createWriteStream(outputPath)

let totalSize = 0
let processedSize = 0
let lastReportedProgress = 0

function addFolderToZip(dirPath: string, basePath: string = ""): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    const relativePath = path.join(basePath, entry.name)

    if (entry.isDirectory()) {
      zipFile.addEmptyDirectory(relativePath)
      addFolderToZip(fullPath, relativePath)
    } else {
      const stats = fs.statSync(fullPath)
      totalSize += stats.size
      zipFile.addFile(fullPath, relativePath)
    }
  }
}

try {
  addFolderToZip(inputPath)

  zipFile.outputStream.on("data", (chunk: Buffer) => {
    // TODO: totalSize is the base size. processedSize is the compressed size. So processedSize will allways be smaller than totalSize.
    // TODO: This causes the progress to not get to 100 never.
    // TODO: I don't know how to solve this... there is no way to calculate it using the file count, no way to get the uncompressed size,
    // TODO: no way to get the compressed size for the totalSize...
    processedSize += chunk.length
    const progress = Math.round((processedSize / totalSize) * 100)
    if (progress > lastReportedProgress) {
      lastReportedProgress = progress
      parentPort?.postMessage({ type: "progress", progress })
    }
  })

  zipFile.outputStream.pipe(output)

  output.on("close", () => {
    parentPort?.postMessage({ type: "progress", progress: 100 })
    parentPort?.postMessage({ type: "finished" })
  })

  zipFile.end()
} catch (err) {
  parentPort?.postMessage({ type: "error", message: `Unexpected error: ${err}` })
}
