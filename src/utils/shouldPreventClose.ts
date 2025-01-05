import { logMessage } from "./logManager"

const tasksBlockingClose = new Set()

export const getShouldPreventClose = (): boolean => tasksBlockingClose.size > 0

export const setShouldPreventClose = (action: "add" | "remove", id: string): void => {
  logMessage("info", `[utils] [shouldPreventClose] [${id}] [${action}]`)

  if (action === "add") {
    tasksBlockingClose.add(id)
  } else if (action === "remove") {
    tasksBlockingClose.delete(id)
  }
}
