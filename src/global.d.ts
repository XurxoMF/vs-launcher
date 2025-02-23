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
    favMods: number[]
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
    _mod?: DownloadableMod
  } & Record<string, unknown>

  type ErrorInstalledModType = { zipname: string; path: string } & Record<string, unknown>

  type DownloadableModOnList = {
    modid: number
    assetid: number
    downloads: number
    follows: number
    trendingpoints: number
    comments: number
    name: string
    summary: string | null
    modidstrs: string[]
    author: string
    urlalias: string | null
    side: string
    type: string
    logo: string
    tags: string[]
    lastreleased: string
  } & Record<string, unknown>

  type DownloadableMod = {
    modid: number
    assetid: number
    name: string
    text: string
    author: string
    urlalias: string | null
    logofilename: string | null
    logofile: string | null
    homepageurl: string | null
    sourcecodeurl: string | null
    trailervideourl: string | null
    issuetrackerurl: string | null
    wikiurl: string | null
    downloads: number
    follows: number
    trendingpoints: number
    comments: number
    side: string
    tuype: string
    createdat: string
    lasmodified: string
    tags: string[]
    releases: DownloadableModRelease[]
    screenshots: DownloadableModScreenshot[]
  } & Record<string, unknown>

  type DownloadableModScreenshot = {
    fileid: number
    mainfile: string
    filename: string
    thumbnailfile: string
    createdat: string
  } & Record<string, unknown>

  type DownloadableModRelease = {
    releaseid: number
    mainfile: string
    filename: string
    fileid: number
    downloads: number
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
  } & Record<string, unknown>

  type DownloadableModAuthor = {
    userid: string
    name: string
  } & Record<string, unknown>

  type DownloadableModGameVersion = {
    tagid: string
    name: string
    color: string
  } & Record<string, unknown>

  declare module "*.png" {
    const value: string
    export default value
  }
}

export {}
