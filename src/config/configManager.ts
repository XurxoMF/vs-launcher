import { app } from "electron"
import fse from "fs-extra"
import { join } from "path"
import { logMessage } from "@src/utils/logManager"

/**
 * VERSIONS LIST
 * 1.0: 0.0.1 -> 0.0.5
 * 1.1: 1.0.0
 * 1.2: 1.1.0 -> 1.2.3
 * 1.3: 1.3.0 -> 1.3.2
 * 1.4: 1.4.0
 */
const defaultConfig: ConfigType = {
  version: 1.4,
  lastUsedInstallation: null,
  defaultInstallationsFolder: join(app.getPath("appData"), "VSLInstallations"),
  defaultVersionsFolder: join(app.getPath("appData"), "VSLGameVersions"),
  backupsFolder: join(app.getPath("appData"), "VSLBackups"),
  account: null,
  installations: [],
  gameVersions: [],
  favMods: []
}

const defaultInstallation: InstallationType = {
  id: "",
  name: "",
  path: "",
  version: "",
  startParams: "",
  backupsLimit: 3,
  backupsAuto: false,
  compressionLevel: 0,
  backups: [],
  lastTimePlayed: -1,
  totalTimePlayed: 0,
  mesaGlThread: false
}

const defaultGameVersion: GameVersionType = {
  version: "",
  path: ""
}

let configPath: string

export async function saveConfig(config: ConfigType): Promise<boolean> {
  try {
    const cleanedConfig = JSON.parse(
      JSON.stringify(config, (key, value) => {
        return key.startsWith("_") ? undefined : value
      })
    )
    await fse.writeJSON(configPath, cleanedConfig)
    return true
  } catch (err) {
    logMessage("error", `[back] [config] [config/configManager.ts] [saveConfig] Error saving config at ${configPath}.`)
    logMessage("debug", `[back] [config] [config/configManager.ts] [saveConfig] Error saving config at ${configPath}: ${err}`)
    return false
  }
}

export async function getConfig(): Promise<ConfigType> {
  try {
    if (!(await ensureConfig())) return defaultConfig
    const config = await fse.readJSON(configPath, "utf-8")
    const ensuredConfig = ensureConfigProperties(config)
    return ensuredConfig
  } catch (err) {
    logMessage("error", `[back] [config] [config/configManager.ts] [getConfig] Error getting config at ${configPath}. Using default config.`)
    logMessage("debug", `[back] [config] [config/configManager.ts] [getConfig] Error getting config at ${configPath}: ${err}`)
    await saveConfig(defaultConfig)
    return defaultConfig
  }
}

export async function ensureConfig(): Promise<boolean> {
  configPath = join(app.getPath("userData"), "config.json")
  try {
    logMessage("info", `[back] [config] [config/configManager.ts] [ensureConfig] Looking for config at ${configPath}.`)
    if (!(await fse.pathExists(configPath))) {
      logMessage("info", `[back] [config] [config/configManager.ts] [ensureConfig] Config not found. Creating default config.`)
      return await saveConfig(defaultConfig)
    }
    logMessage("info", `[back] [config] [config/configManager.ts] [ensureConfig] Config found.`)
    return true
  } catch (err) {
    logMessage("error", `[back] [config] [config/configManager.ts] [ensureConfig] Error ensuring config.`)
    logMessage("error", `[back] [config] [config/configManager.ts] [ensureConfig] Error ensuring config at ${configPath}: ${err}`)
    return false
  }
}

function ensureConfigProperties(config: ConfigType): ConfigType {
  const installations: InstallationType[] = config.installations.map((installation) => ({
    id: installation.id ?? defaultInstallation.id,
    name: installation.name ?? defaultInstallation.name,
    path: installation.path ?? defaultInstallation.path,
    version: installation.version ?? defaultInstallation.version,
    startParams: installation.startParams ?? defaultInstallation.startParams,
    backupsLimit: installation.backupsLimit ?? defaultInstallation.backupsLimit,
    backupsAuto: installation.backupsAuto ?? defaultInstallation.backupsAuto,
    compressionLevel: installation.compressionLevel ?? defaultInstallation.compressionLevel,
    backups: installation.backups ?? defaultInstallation.backups,
    lastTimePlayed: installation.lastTimePlayed ?? defaultInstallation.lastTimePlayed,
    totalTimePlayed: installation.totalTimePlayed ?? defaultInstallation.totalTimePlayed,
    mesaGlThread: installation.mesaGlThread ?? defaultInstallation.mesaGlThread
  }))

  const gameVersions: GameVersionType[] = config.gameVersions.map((gameVersion) => ({
    version: gameVersion.version ?? defaultGameVersion.version,
    path: gameVersion.path ?? defaultGameVersion.path
  }))

  const fixedConfig: ConfigType = {
    version: !config.version || config.version < defaultConfig.version ? defaultConfig.version : config.version,
    lastUsedInstallation: config.lastUsedInstallation ?? defaultConfig.lastUsedInstallation,
    defaultInstallationsFolder: config.defaultInstallationsFolder ?? defaultConfig.defaultInstallationsFolder,
    defaultVersionsFolder: config.defaultVersionsFolder ?? defaultConfig.defaultVersionsFolder,
    backupsFolder: config.backupsFolder ?? defaultConfig.backupsFolder,
    account: config.account ?? defaultConfig.account,
    installations,
    gameVersions,
    favMods: config.favMods ?? defaultConfig.favMods
  }

  return fixedConfig
}
