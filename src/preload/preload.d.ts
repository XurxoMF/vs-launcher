import { ElectronAPI } from "@electron-toolkit/preload"

declare global {
  type ProgressCallback = {
    (event: Electron.IpcRendererEvent, id: string, progress: number): void
  }

  type BridgeAPI = {
    utils: {
      getAppVersion: () => Promise<string>
      getOs: () => Promise<NodeJS.Platform>
      logMessage: (mode: ErrorTypes, message: string) => void
      setPreventAppClose: (action: "add" | "remove", id: string, desc: string) => void
      openOnBrowser: (url: string) => void
      selectFolderDialog: () => Promise<string>
    }
    appUpdater: {
      onUpdateAvailable: (callback) => void
      onUpdateDownloaded: (callback) => void
      updateAndRestart: () => void
    }
    configManager: {
      getConfig: () => Promise<ConfigType>
      saveConfig: (configJson: ConfigType) => Promise<boolean>
    }
    modsManager: {
      countMods: (path: string) => Promise<{ status: boolean; count: number }>
      getInstalledMods: (path: string) => Promise<{ mods: InstalledModType[]; errors: ErrorInstalledModType[] }>
    }
    pathsManager: {
      getCurrentUserDataPath: () => Promise<string>
      formatPath: (parts: string[]) => Promise<string>
      removeFileFromPath(path: string): Promise<string>
      deletePath: (path: string) => Promise<boolean>
      checkPathEmpty: (path: string) => Promise<boolean>
      checkPathExists: (path: string) => Promise<boolean>
      openPathOnFileExplorer: (path: string) => Promise<string>
      downloadOnPath: (id: string, url: string, outputPath: string, fileName: string) => Promise<string>
      extractOnPath: (id: string, filePath: string, outputPath: string, deleteZip: boolean) => Promise<boolean>
      compressOnPath: (id: string, inputPath: string, outputPath: string, outputFileName: string) => Promise<boolean>
      onDownloadProgress: (callback: ProgressCallback) => void
      onExtractProgress: (callback: ProgressCallback) => void
      onCompressProgress: (callback: ProgressCallback) => void
      changePerms: (paths: string[], perms: number) => void
      lookForAGameVersion: (path: string) => Promise<{ exists: boolean; installedGameVersion: string | undefined }>
    }
    gameManager: {
      executeGame: (version: GameVersionType, installation: InstallationType) => Promise<boolean>
    }
    netManager: {
      queryURL: (url: string) => Promise<string>
    }
  }

  interface Window {
    electron: ElectronAPI
    api: BridgeAPI
  }

  type ErrorTypes = "error" | "warn" | "info" | "debug" | "verbose"
}
