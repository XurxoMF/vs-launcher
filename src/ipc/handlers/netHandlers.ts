import { ipcMain, net } from "electron"
import { IPC_CHANNELS } from "../ipcChannels"
import { logMessage } from "@src/utils/logManager"

ipcMain.handle(IPC_CHANNELS.NET_MANAGER.QUERY_URL, async (_event, url): Promise<string> => {
  return new Promise((resolve, reject) => {
    const request = net.request(url)
    let data = ""

    request.on("response", (response) => {
      response.on("data", (chunk) => {
        data += chunk
      })
      response.on("end", () => {
        resolve(data)
      })
    })

    request.on("error", (err) => {
      logMessage("error", `[back] [ipc] [ipc/handlers/netHandlers.ts] [QUERY_URL] Error with the ${url} query.`)
      logMessage("debug", `[back] [ipc] [ipc/handlers/netHandlers.ts] [QUERY_URL] Error with the ${url} query: ${err}`)
      reject(err)
    })

    request.end()
  })
})
