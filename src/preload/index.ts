import { contextBridge, ipcRenderer } from "electron"
import { autoUpdater } from "electron-updater"
import { IPC_CHANNELS } from "@src/ipc/ipcChannels"

import { electronAPI } from "@electron-toolkit/preload"
import { logMessage } from "@src/utils/logManager"

// Custom APIs for renderer
const api: BridgeAPI = {
  utils: {
    getAppVersion: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.UTILS.GET_APP_VERSION),
    logMessage: (mode: ErrorTypes, message: string): void => ipcRenderer.send(IPC_CHANNELS.UTILS.LOG_MESSAGE, mode, message),
    setPreventAppClose: (value: boolean): void => ipcRenderer.send(IPC_CHANNELS.UTILS.SET_PREVENT_APP_CLOSE, value),
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
    openPathOnFileExplorer: (path: string): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.OPEN_PATH_ON_FILE_EXPLORER, path)
  },
  gameVersionsManager: {
    downloadGameVersion: (gameVersion: GameVersionType, outputPath: string): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.GAME_VERSIONS_MANAGER.DOWNLOAD_GAME_VERSION, gameVersion, outputPath),
    extractGameVersion: (filePath: string, outputPath: string): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.GAME_VERSIONS_MANAGER.EXTRACT_GAME_VERSION, filePath, outputPath),
    onDownloadGameVersionProgress: (callback: ProgressCallback) => ipcRenderer.on(IPC_CHANNELS.GAME_VERSIONS_MANAGER.DOWNLOAD_GAME_VERSION_PROGRESS, callback),
    onExtractGameVersionProgress: (callback: ProgressCallback) => ipcRenderer.on(IPC_CHANNELS.GAME_VERSIONS_MANAGER.EXTRACT_GAME_VERSION_PROGRESS, callback),
    uninstallGameVersion: (gameVersion: InstalledGameVersionType): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.GAME_VERSIONS_MANAGER.UNINSTALL_GAME_VERSION, gameVersion),
    lookForAGameVersion: (path: string): Promise<{ exists: boolean; installedGameVersion: string | undefined }> => ipcRenderer.invoke(IPC_CHANNELS.GAME_VERSIONS_MANAGER.LOOK_FOR_A_GAME_VERSION, path)
  },
  gameManager: {
    executeGame: (version: InstalledGameVersionType, installation: InstallationType): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.GAME_MANAGER.EXECUTE_GAME, version, installation)
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
