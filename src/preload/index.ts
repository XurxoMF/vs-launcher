import { contextBridge, ipcRenderer } from "electron"
import { autoUpdater } from "electron-updater"
import { IPC_CHANNELS } from "@src/ipc/ipcChannels"

import { electronAPI } from "@electron-toolkit/preload"
import { logMessage } from "@src/utils/logManager"

// Custom APIs for renderer
const api: BridgeAPI = {
  utils: {
    getAppVersion: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.UTILS.GET_APP_VERSION),
    getOs: (): Promise<NodeJS.Platform> => ipcRenderer.invoke(IPC_CHANNELS.UTILS.GET_OS),
    logMessage: (mode: ErrorTypes, message: string): void => ipcRenderer.send(IPC_CHANNELS.UTILS.LOG_MESSAGE, mode, message),
    setPreventAppClose: (action: "add" | "remove", id: string, desc: string): void => ipcRenderer.send(IPC_CHANNELS.UTILS.SET_PREVENT_APP_CLOSE, action, id, desc),
    openOnBrowser: (url: string): void => ipcRenderer.send(IPC_CHANNELS.UTILS.OPEN_ON_BROWSER, url),
    selectFolderDialog: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.UTILS.SELECT_FOLDER_DIALOG)
  },
  appUpdater: {
    onUpdateAvailable: (callback) => ipcRenderer.on(IPC_CHANNELS.APP_UPDATER.UPDATE_AVAILABLE, callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on(IPC_CHANNELS.APP_UPDATER.UPDATE_DOWNLOADED, callback),
    updateAndRestart: () => autoUpdater.quitAndInstall()
  },
  configManager: {
    getConfig: (): Promise<ConfigType> => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_MANAGER.GET_CONFIG),
    saveConfig: (configJson: ConfigType): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_MANAGER.SAVE_CONFIG, configJson)
  },
  pathsManager: {
    getCurrentUserDataPath: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.GET_CURRENT_USER_DATA_PATH),
    deletePath: (path: string): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.DELETE_PATH, path),
    formatPath: (parts: string[]): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.FORMAT_PATH, parts),
    checkPathEmpty: (path: string): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.CHECK_PATH_EMPTY, path),
    checkPathExists: (path: string): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.CHECK_PATH_EXISTS, path),
    openPathOnFileExplorer: (path: string): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.OPEN_PATH_ON_FILE_EXPLORER, path),
    downloadOnPath: (id: string, url: string, outputPath: string): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.FILES_MANAGER.DOWNLOAD_ON_PATH, id, url, outputPath),
    extractOnPath: (id: string, filePath: string, outputPath: string): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.FILES_MANAGER.EXTRACT_ON_PATH, id, filePath, outputPath),
    onDownloadProgress: (callback: ProgressCallback) => ipcRenderer.on(IPC_CHANNELS.FILES_MANAGER.DOWNLOAD_PROGRESS, callback),
    onExtractProgress: (callback: ProgressCallback) => ipcRenderer.on(IPC_CHANNELS.FILES_MANAGER.EXTRACT_PROGRESS, callback),
    changePerms: (paths: string[], perms: number): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.FILES_MANAGER.CHANGE_PERMS, paths, perms),
    lookForAGameVersion: (path: string): Promise<{ exists: boolean; installedGameVersion: string | undefined }> => ipcRenderer.invoke(IPC_CHANNELS.FILES_MANAGER.LOOK_FOR_A_GAME_VERSION, path)
  },
  gameManager: {
    executeGame: (version: GameVersionType, installation: InstallationType): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.GAME_MANAGER.EXECUTE_GAME, version, installation)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI)
    contextBridge.exposeInMainWorld("api", api)
    logMessage("info", "[preload] Exposed Electron APIs")
  } catch (error) {
    logMessage("error", "[preload] Failed to expose Electron APIs")
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api

  logMessage("info", "[preload] Exposed Electron APIs")
}

export type ApiType = typeof api
