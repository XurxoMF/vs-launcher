import Logger from "electron-log"

export function logMessage(mode: ErrorTypes, message: string): void {
  switch (mode) {
    case "error":
      Logger.error(`${message}`)
      break
    case "warn":
      Logger.warn(`${message}`)
      break
    case "info":
      Logger.info(`${message}`)
      break
    case "debug":
      Logger.debug(`${message}`)
      break
    case "verbose":
      Logger.verbose(`${message}`)
      break
    default:
      break
  }
}
