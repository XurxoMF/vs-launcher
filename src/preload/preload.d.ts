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
      setPreventAppClose: (action: "add" | "remove", id: string) => void
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
    pathsManager: {
      getCurrentUserDataPath: () => Promise<string>
      formatPath: (parts: string[]) => Promise<string>
      deletePath: (path: string) => Promise<boolean>
      checkPathEmpty: (path: string) => Promise<boolean>
      checkPathExists: (path: string) => Promise<boolean>
      openPathOnFileExplorer: (path: string) => Promise<string>
      downloadOnPath: (id: string, url: string, outputPath: string) => Promise<string>
      extractOnPath: (id: string, filePath: string, outputPath: string) => Promise<boolean>
      onDownloadProgress: (callback: ProgressCallback) => void
      onExtractProgress: (callback: ProgressCallback) => void
      changePerms: (paths: string[], perms: number) => void
      lookForAGameVersion: (path: string) => Promise<{ exists: boolean; installedGameVersion: string | undefined }>
    }
    gameManager: {
      executeGame: (version: GameVersionType, installation: InstallationType) => Promise<boolean>
    }
  }

  interface Window {
    electron: ElectronAPI
    api: BridgeAPI
  }

  type ErrorTypes = "error" | "warn" | "info" | "debug" | "verbose"
}
