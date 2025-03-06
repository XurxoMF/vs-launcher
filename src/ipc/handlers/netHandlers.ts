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

ipcMain.handle(IPC_CHANNELS.NET_MANAGER.VS_LOGIN, async (_event, url, body: { email: string; password: string; twofacode?: string; preLoginToken?: string }): Promise<string> => {
  const reqData = new URLSearchParams()
  reqData.append("email", body.email)
  reqData.append("password", body.password)
  reqData.append("totpcode", body.twofacode ?? "")
  reqData.append("prelogintoken", body.preLoginToken ?? "")

  const request = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: reqData
  })

  const res = await request.json()

  return res
})
