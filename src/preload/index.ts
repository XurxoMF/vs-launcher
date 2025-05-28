import { contextBridge, ipcRenderer } from "electron"
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
    selectFolderDialog: (options?: { type?: "file" | "folder"; mode?: "single" | "multi"; extensions?: string[] }): Promise<string[]> =>
      ipcRenderer.invoke(IPC_CHANNELS.UTILS.SELECT_FOLDER_DIALOG, options),
    onPreventedAppClose: (callback: (event: Electron.IpcRendererEvent, desc: string) => void) => ipcRenderer.on(IPC_CHANNELS.UTILS.PREVENTED_APP_CLOSE, callback)
  },
  appUpdater: {
    onUpdateAvailable: (callback) => ipcRenderer.on(IPC_CHANNELS.APP_UPDATER.UPDATE_AVAILABLE, callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on(IPC_CHANNELS.APP_UPDATER.UPDATE_DOWNLOADED, callback),
    updateAndRestart: () => ipcRenderer.send(IPC_CHANNELS.APP_UPDATER.UPDATE_AND_RESTART)
  },
  configManager: {
    getConfig: (): Promise<ConfigType> => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_MANAGER.GET_CONFIG),
    saveConfig: (configJson: ConfigType): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_MANAGER.SAVE_CONFIG, configJson)
  },
  modsManager: {
    getInstalledMods: (path: string): Promise<{ mods: InstalledModType[]; errors: ErrorInstalledModType[] }> => ipcRenderer.invoke(IPC_CHANNELS.MODS_MANAGER.GET_INSTALLED_MODS, path)
  },
  pathsManager: {
    getCurrentUserDataPath: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.GET_CURRENT_USER_DATA_PATH),
    deletePath: (path: string): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.DELETE_PATH, path),
    formatPath: (parts: string[]): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.FORMAT_PATH, parts),
    removeFileFromPath: (path: string): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.REMOVE_FILE_FROM_PATH, path),
    checkPathEmpty: (path: string): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.CHECK_PATH_EMPTY, path),
    checkPathExists: (path: string): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.CHECK_PATH_EXISTS, path),
    ensurePathExists: (path: string): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.ENSURE_PATH_EXISTS, path),
    openPathOnFileExplorer: (path: string): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.OPEN_PATH_ON_FILE_EXPLORER, path),
    downloadOnPath: (id: string, url: string, outputPath: string, fileName: string): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.DOWNLOAD_ON_PATH, id, url, outputPath, fileName),
    extractOnPath: (id: string, filePath: string, outputPath: string, deleteZip: boolean): Promise<boolean> =>
      ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.EXTRACT_ON_PATH, id, filePath, outputPath, deleteZip),
    compressOnPath: (id: string, inputPath: string, outputPath: string, outputFileName: string, compressionLevel?: number): Promise<boolean> =>
      ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.COMPRESS_ON_PATH, id, inputPath, outputPath, outputFileName, compressionLevel),
    onDownloadProgress: (callback: ProgressCallback) => ipcRenderer.on(IPC_CHANNELS.PATHS_MANAGER.DOWNLOAD_PROGRESS, callback),
    onExtractProgress: (callback: ProgressCallback) => ipcRenderer.on(IPC_CHANNELS.PATHS_MANAGER.EXTRACT_PROGRESS, callback),
    onCompressProgress: (callback: ProgressCallback) => ipcRenderer.on(IPC_CHANNELS.PATHS_MANAGER.COMPRESS_PROGRESS, callback),
    changePerms: (paths: string[], perms: number): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.CHANGE_PERMS, paths, perms),
    copyToIcons: (path: string, name: string): Promise<{ status: true; file: string } | { status: false }> => ipcRenderer.invoke(IPC_CHANNELS.PATHS_MANAGER.COPY_TO_ICONS, path, name)
  },
  gameManager: {
    executeGame: (version: GameVersionType, installation: InstallationType, account: AccountType | null): Promise<boolean> =>
      ipcRenderer.invoke(IPC_CHANNELS.GAME_MANAGER.EXECUTE_GAME, version, installation, account),
    lookForAGameVersion: (path: string): Promise<{ exists: boolean; installedGameVersion: string | undefined }> => ipcRenderer.invoke(IPC_CHANNELS.GAME_MANAGER.LOOK_FOR_A_GAME_VERSION, path)
  },
  netManager: {
    queryURL: (url: string): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.NET_MANAGER.QUERY_URL, url),
    postUrl: (url: string, body: { email: string; password: string; twofacode?: string; preLoginToken?: string }): Promise<object> => ipcRenderer.invoke(IPC_CHANNELS.NET_MANAGER.VS_LOGIN, url, body)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI)
    contextBridge.exposeInMainWorld("api", api)
    logMessage("info", `[back] [index] [preload/index.ts] Exposed Electron's API.`)
  } catch (err) {
    logMessage("error", `[back] [index] [preload/index.ts] Error exposing Electron's API.`)
    logMessage("error", `[back] [index] [preload/index.ts] Error exposing Electron's API: ${err}`)
    console.error(err)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api

  logMessage("info", `[back] [index] [preload/index.ts] Exposed Electron's API.`)
}

export type ApiType = typeof api
