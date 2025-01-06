import { workerData, parentPort } from "worker_threads"
import axios from "axios"
import fse from "fs-extra"
import { join } from "path"

const { url, outputPath } = workerData

const pathToDownload = join(outputPath, url.split("/").pop() ?? "")

axios({
  url,
  method: "GET",
  responseType: "stream"
})
  .then(({ data, headers }) => {
    const totalLength = headers["content-length"]

    if (!fse.existsSync(outputPath)) {
      fse.mkdirSync(outputPath, { recursive: true })
    }

    const writer = fse.createWriteStream(pathToDownload)
    let downloadedLength = 0
    let lastReportedProgress = 0

    data.on("data", (chunk) => {
      downloadedLength += chunk.length
      const progress = Math.round((downloadedLength / totalLength) * 100)
      if (progress > lastReportedProgress) {
        lastReportedProgress = progress
        parentPort?.postMessage({
          type: "progress",
          progress
        })
      }
    })

    data.pipe(writer)

    writer.on("finish", () => {
      parentPort?.postMessage({ type: "finished", path: pathToDownload })
    })

    writer.on("error", (err) => {
      parentPort?.postMessage({ type: "error", error: err })
    })
  })
  .catch((err) => {
    parentPort?.postMessage({ type: "error", error: err })
  })
