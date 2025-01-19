import { app } from "electron"
import fse from "fs-extra"
import { join } from "path"
import { logMessage } from "@src/utils/logManager"

/**
 * VERSIONS LIST
 * 1.0: 0.0.1 -> 0.0.5
 * 1.1: 1.0.0
 * 1.2: 1.1.0
 */
const defaultConfig: ConfigType = {
  version: 1.2,
  lastUsedInstallation: null,
  defaultInstallationsFolder: join(app.getPath("appData"), "VSLInstallations"),
  defaultVersionsFolder: join(app.getPath("appData"), "VSLGameVersions"),
  backupsFolder: join(app.getPath("appData"), "VSLBackups"),
  installations: [],
  gameVersions: []
}

const defaultInstallation: InstallationType = {
  id: "",
  name: "",
  path: "",
  version: "",
  startParams: "",
  backupsLimit: 3,
  backupsAuto: false,
  backups: [],
  mods: []
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
    logMessage("info", `[config] Config saved at ${configPath}`)
    return true
  } catch (err) {
    logMessage("error", `[config] Error saving config at ${configPath}: ${err}`)
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
    logMessage("error", `[config] Error getting config at ${configPath}. Using default config.`)
    await saveConfig(defaultConfig)
    return defaultConfig
  }
}

export async function ensureConfig(): Promise<boolean> {
  configPath = join(app.getPath("userData"), "config.json")
  try {
    if (!(await fse.pathExists(configPath))) {
      logMessage("info", `[config] Config not found at ${configPath}. Creating default config.`)
      return await saveConfig(defaultConfig)
    }
    logMessage("info", `[config] Config found at ${configPath}`)
    return true
  } catch (err) {
    logMessage("error", `[config] Error ensuring config at ${configPath}: ${err}`)
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
    backups: installation.backups ?? defaultInstallation.backups,
    mods: installation.mods ?? defaultInstallation.mods
  }))

  const gameVersions: GameVersionType[] = config.gameVersions.map((gameVersion) => ({
    version: gameVersion.version ?? defaultGameVersion.version,
    path: gameVersion.path ?? defaultGameVersion.path
  }))

  const fixedConfig: ConfigType = {
    ...config,
    version: !config.version || config.version < defaultConfig.version ? defaultConfig.version : config.version,
    lastUsedInstallation: config.lastUsedInstallation ?? defaultConfig.lastUsedInstallation,
    defaultInstallationsFolder: config.defaultInstallationsFolder ?? defaultConfig.defaultInstallationsFolder,
    defaultVersionsFolder: config.defaultVersionsFolder ?? defaultConfig.defaultVersionsFolder,
    backupsFolder: config.backupsFolder ?? defaultConfig.backupsFolder,
    installations,
    gameVersions
  }

  return fixedConfig
}
