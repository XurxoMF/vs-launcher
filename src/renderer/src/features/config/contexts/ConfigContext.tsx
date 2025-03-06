import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react"

import { useGetInstalledMods } from "@renderer/features/mods/hooks/useGetInstalledMods"

export enum CONFIG_ACTIONS {
  SET_CONFIG = "SET_CONFIG",

  SET_VERSION = "SET_VERSION",
  SET_LAST_USED_INSTALLATION = "SET_LAST_USED_INSTALLATION",
  SET_DEFAULT_INSTALLATIONS_FOLDER = "SET_DEFAULT_INSTALLATIONS_FOLDER",
  SET_DEFAULT_VERSIONS_FOLDER = "SET_DEFAULT_VERSIONS_FOLDER",
  SET_DEFAULT_BACKUPS_FOLDER = "SET_DEFAULT_BACKUPS_FOLDER",
  SET_ACCOUNT = "SET_ACCOUNT",

  ADD_INSTALLATION = "ADD_INSTALLATION",
  DELETE_INSTALLATION = "DELETE_INSTALLATION",
  EDIT_INSTALLATION = "EDIT_INSTALLATION",
  ADD_INSTALLATION_BACKUP = "ADD_INSTALLATION_BACKUP",
  DELETE_INSTALLATION_BACKUP = "DELETE_INSTALLATION_BACKUP",
  EDIT_INSTALLATION_BACKUP = "EDIT_INSTALLATION_BACKUP",

  ADD_GAME_VERSION = "ADD_GAME_VERSION",
  DELETE_GAME_VERSION = "DELETE_GAME_VERSION",
  EDIT_GAME_VERSION = "EDIT_GAME_VERSION",

  ADD_FAV_MOD = "ADD_FAV_MOD",
  REMOVE_FAV_MOD = "REMOVE_FAV_MOD"
}

export interface SetConfig {
  type: CONFIG_ACTIONS.SET_CONFIG
  payload: ConfigType
}

export interface SetVersion {
  type: CONFIG_ACTIONS.SET_VERSION
  payload: number
}

export interface SetLastUsedInstallation {
  type: CONFIG_ACTIONS.SET_LAST_USED_INSTALLATION
  payload: string | null
}

export interface SetDefaultInstllationsFolder {
  type: CONFIG_ACTIONS.SET_DEFAULT_INSTALLATIONS_FOLDER
  payload: string
}

export interface SetDefaultVersionsFolder {
  type: CONFIG_ACTIONS.SET_DEFAULT_VERSIONS_FOLDER
  payload: string
}

export interface SetDefaultBackupsFolder {
  type: CONFIG_ACTIONS.SET_DEFAULT_BACKUPS_FOLDER
  payload: string
}

export interface SetAccount {
  type: CONFIG_ACTIONS.SET_ACCOUNT
  payload: AccountType
}

export interface AddInstallation {
  type: CONFIG_ACTIONS.ADD_INSTALLATION
  payload: InstallationType
}

export interface DeleteInstallation {
  type: CONFIG_ACTIONS.DELETE_INSTALLATION
  payload: { id: string }
}

export interface EditInstallation {
  type: CONFIG_ACTIONS.EDIT_INSTALLATION
  payload: {
    id: string
    updates: Partial<Omit<InstallationType, "id">>
  }
}

export interface AddInstallationBackup {
  type: CONFIG_ACTIONS.ADD_INSTALLATION_BACKUP
  payload: {
    id: string
    backup: BackupType
  }
}

export interface DeleteInstallationBackup {
  type: CONFIG_ACTIONS.DELETE_INSTALLATION_BACKUP
  payload: {
    id: string
    backupId: string
  }
}

export interface EditInslallationBackup {
  type: CONFIG_ACTIONS.EDIT_INSTALLATION_BACKUP
  payload: {
    id: string
    backupId: string
    updates: Partial<Omit<BackupType, "id">>
  }
}

export interface AddGameVersion {
  type: CONFIG_ACTIONS.ADD_GAME_VERSION
  payload: GameVersionType
}

export interface DeleteGameVersion {
  type: CONFIG_ACTIONS.DELETE_GAME_VERSION
  payload: { version: string }
}

export interface EditGameVersion {
  type: CONFIG_ACTIONS.EDIT_GAME_VERSION
  payload: {
    version: string
    updates: Partial<Omit<GameVersionType, "version">>
  }
}

export interface AddFavMod {
  type: CONFIG_ACTIONS.ADD_FAV_MOD
  payload: {
    modid: number
  }
}

export interface RemoveFavMod {
  type: CONFIG_ACTIONS.REMOVE_FAV_MOD
  payload: {
    modid: number
  }
}

export type ConfigAction =
  | SetConfig
  | SetVersion
  | SetLastUsedInstallation
  | SetDefaultInstllationsFolder
  | SetDefaultVersionsFolder
  | SetDefaultBackupsFolder
  | SetAccount
  | AddInstallation
  | DeleteInstallation
  | EditInstallation
  | AddInstallationBackup
  | DeleteInstallationBackup
  | EditInslallationBackup
  | AddGameVersion
  | DeleteGameVersion
  | EditGameVersion
  | AddFavMod
  | RemoveFavMod

const configReducer = (config: ConfigType, action: ConfigAction): ConfigType => {
  switch (action.type) {
    case CONFIG_ACTIONS.SET_CONFIG:
      return action.payload
    case CONFIG_ACTIONS.SET_VERSION:
      return { ...config, version: action.payload }
    case CONFIG_ACTIONS.SET_LAST_USED_INSTALLATION:
      return { ...config, lastUsedInstallation: action.payload }
    case CONFIG_ACTIONS.SET_DEFAULT_INSTALLATIONS_FOLDER:
      return { ...config, defaultInstallationsFolder: action.payload }
    case CONFIG_ACTIONS.SET_DEFAULT_VERSIONS_FOLDER:
      return { ...config, defaultVersionsFolder: action.payload }
    case CONFIG_ACTIONS.SET_DEFAULT_BACKUPS_FOLDER:
      return { ...config, backupsFolder: action.payload }
    case CONFIG_ACTIONS.SET_ACCOUNT:
      return { ...config, account: action.payload }
    case CONFIG_ACTIONS.ADD_INSTALLATION:
      return { ...config, installations: [action.payload, ...config.installations] }
    case CONFIG_ACTIONS.DELETE_INSTALLATION:
      return {
        ...config,
        installations: config.installations.filter((installation) => installation.id !== action.payload.id)
      }
    case CONFIG_ACTIONS.EDIT_INSTALLATION:
      return {
        ...config,
        installations: config.installations.map((installation) => (installation.id === action.payload.id ? { ...installation, ...action.payload.updates } : installation))
      }
    case CONFIG_ACTIONS.ADD_INSTALLATION_BACKUP:
      return {
        ...config,
        installations: config.installations.map((installation) =>
          installation.id === action.payload.id ? { ...installation, backups: [action.payload.backup, ...installation.backups] } : installation
        )
      }
    case CONFIG_ACTIONS.DELETE_INSTALLATION_BACKUP:
      return {
        ...config,
        installations: config.installations.map((installation) =>
          installation.id === action.payload.id
            ? {
                ...installation,
                backups: installation.backups.filter((backup) => backup.id !== action.payload.backupId)
              }
            : installation
        )
      }
    case CONFIG_ACTIONS.EDIT_INSTALLATION_BACKUP:
      return {
        ...config,
        installations: config.installations.map((installation) =>
          installation.id === action.payload.id
            ? {
                ...installation,
                backups: installation.backups.map((backup) => (backup.id === action.payload.backupId ? { ...backup, ...action.payload.updates } : backup))
              }
            : installation
        )
      }
    case CONFIG_ACTIONS.ADD_GAME_VERSION:
      return { ...config, gameVersions: [action.payload, ...config.gameVersions] }
    case CONFIG_ACTIONS.DELETE_GAME_VERSION:
      return {
        ...config,
        gameVersions: config.gameVersions.filter((gameVersion) => gameVersion.version !== action.payload.version)
      }
    case CONFIG_ACTIONS.EDIT_GAME_VERSION:
      return {
        ...config,
        gameVersions: config.gameVersions.map((gameVersion) => (gameVersion.version === action.payload.version ? { ...gameVersion, ...action.payload.updates } : gameVersion))
      }
    case CONFIG_ACTIONS.ADD_FAV_MOD:
      return {
        ...config,
        favMods: [...config.favMods, action.payload.modid]
      }
    case CONFIG_ACTIONS.REMOVE_FAV_MOD:
      return {
        ...config,
        favMods: config.favMods.filter((fm) => fm !== action.payload.modid)
      }
    default:
      return config
  }
}

export const initialState: ConfigType = {
  version: 0,
  lastUsedInstallation: null,
  defaultInstallationsFolder: "",
  defaultVersionsFolder: "",
  backupsFolder: "",
  account: {
    email: "",
    password: "",
    playerName: "",
    playerUid: "",
    playerEntitlements: "",
    sessionKey: "",
    sessionSignature: "",
    mptoken: null,
    hostGameServer: false
  },
  installations: [],
  gameVersions: [],
  favMods: []
}

interface ConfigContextType {
  config: ConfigType
  configDispatch: React.Dispatch<ConfigAction>
}

const ConfigContext = createContext<ConfigContextType | null>(null)

const ConfigProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [config, configDispatch] = useReducer(configReducer, initialState)
  const [isConfigLoaded, setIsConfigLoaded] = useState(false)

  const getInstalledMods = useGetInstalledMods()

  const firstExecutedConfigContext = useRef(true)
  useEffect(() => {
    ;(async (): Promise<void> => {
      if (firstExecutedConfigContext.current) {
        firstExecutedConfigContext.current = false
        window.api.utils.logMessage("info", `[front] [config] [features/config/contexts/ConfigCntext.tsx] [ConfigProvider] Setting context config from config file.`)
        const config = await window.api.configManager.getConfig()
        configDispatch({ type: CONFIG_ACTIONS.SET_CONFIG, payload: config })
      }
    })()
  }, [])

  useEffect(() => {
    if (!isConfigLoaded && config.version !== 0) setIsConfigLoaded(true)
    if (!isConfigLoaded) return
    window.api.configManager.saveConfig(config)
  }, [config])

  useEffect(() => {
    if (!isConfigLoaded) return
    config.installations.forEach(async (i) => {
      const mods = await getInstalledMods({ path: i.path })
      const totalMods = mods.errors.length + mods.mods.length
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: i.id, updates: { _modsCount: totalMods } } })
    })
  }, [isConfigLoaded])

  useEffect(() => {
    if ((!config.lastUsedInstallation || !config.installations.some((i) => i.id === config.lastUsedInstallation)) && config.installations.length > 0)
      configDispatch({ type: CONFIG_ACTIONS.SET_LAST_USED_INSTALLATION, payload: config.installations[0].id })
  }, [config.installations])

  return <ConfigContext.Provider value={{ config, configDispatch }}>{children}</ConfigContext.Provider>
}

const useConfigContext = (): ConfigContextType => {
  const context = useContext(ConfigContext)
  if (context === null) {
    throw new Error("useConfigContext must be used within a ConfigProvider")
  }
  return context
}

export { ConfigProvider, useConfigContext }
