import { parentPort, workerData } from "worker_threads"
import fse from "fs-extra"
import { join } from "path"

const { paths, perms } = workerData

const changePermissionsRecursively = (path: string): void => {
  if (fse.existsSync(path)) {
    const stats = fse.statSync(path)

    if (stats.isDirectory()) {
      const items = fse.readdirSync(path)
      for (const item of items) {
        changePermissionsRecursively(join(path, item))
      }
    }

    fse.chmodSync(path, perms)
  }
}

for (const path of paths) {
  window.api.utils.logMessage("info", `[back] [worker] [ipc/workers/changePermsWorker.ts] [for loop] Changing perms to ${path}.`)
  changePermissionsRecursively(path)
}

parentPort?.postMessage("done")
