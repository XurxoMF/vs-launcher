declare global {
  type BasicConfigType = {
    version: number
    lastUsedInstallation: string | null
    defaultInstallationsFolder: string
    defaultVersionsFolder: string
    backupsFolder: string
  } & Record<string, unknown>

  type GameVersionType = {
    version: string
    path: string
  } & Record<string, unknown>

  type BackupType = {
    id: string
    date: number
    path: string
  } & Record<string, unknown>

  type InstallationType = {
    id: string
    name: string
    path: string
    version: string
    startParams: string
    backupsLimit: number
    backupsAuto: boolean
    backups: BackupType[]
  } & Record<string, unknown>

  type ConfigType = BasicConfigType & {
    installations: InstallationType[]
    gameVersions: GameVersionType[]
  } & Record<string, unknown>

  type InstalledModType = {
    name: string
    modid: string
    version: string
    path: string
    _image?: string
    description?: string
    side?: string
    authors?: string[]
    contributors?: string[]
    type?: string
  } & Record<string, unknown>

  type DownloadableModVersion = {
    releaseid: string
    mainfile: string
    downloads: string
    tags: string[]
    modidstr: string
    modversion: string
    created: string
  } & Record<string, unknown>

  type DownloadableGameVersionType = {
    version: string
    type: "stable" | "rc" | "pre"
    releaseDate: string
    windows: string
    linux: string
  }

  declare module "*.png" {
    const value: string
    export default value
  }
}

export {}
