declare global {
  type BasicConfigType = {
    version: number
    lastUsedInstallation: string | null
    defaultInstallationsFolder: string
    defaultVersionsFolder: string
    backupsFolder: string
    favMods: number[]
    _notifiedModUpdatesInstallations?: string[]
  }

  type AccountType = {
    email: string
    playerName: string
    playerUid: string
    playerEntitlements: string
    sessionKey: string
    sessionSignature: string
    mptoken: string | null
    hostGameServer: boolean
  }

  type GameVersionType = {
    version: string
    path: string
    _installing?: boolean
    _deleting?: boolean
    _playing?: boolean
  }

  type BackupType = {
    id: string
    date: number
    path: string
    _deleting?: boolean
    _restoring?: boolean
  }

  type InstallationType = {
    id: string
    name: string
    icon: string
    path: string
    version: string
    startParams: string
    backupsLimit: number
    backupsAuto: boolean
    compressionLevel: number
    backups: BackupType[]
    lastTimePlayed: number
    totalTimePlayed: number
    mesaGlThread: boolean
    _modsCount?: number
    _playing?: boolean
    _backuping?: boolean
    _restoringBackup?: boolean
  }

  type ConfigType = BasicConfigType & {
    account: AccountType | null
    installations: InstallationType[]
    gameVersions: GameVersionType[]
    customIcons: IconType[]
  }

  type InstalledModType = {
    name: string
    modid: string
    version: string
    path: string
    description?: string
    side?: string
    authors?: string[]
    contributors?: string[]
    type?: string
    _image?: string
    _mod?: DownloadableModType
    _updatableTo?: string
    _lastVersion?: string
  }

  type ErrorInstalledModType = { zipname: string; path: string }

  type DownloadableModOnListType = {
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
  }

  type DownloadableModType = {
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
    releases: DownloadableModReleaseType[]
    screenshots: DownloadableModScreenshotType[]
  }

  type DownloadableModScreenshotType = {
    fileid: number
    mainfile: string
    filename: string
    thumbnailfile: string
    createdat: string
  }

  type DownloadableModReleaseType = {
    releaseid: number
    mainfile: string
    filename: string
    fileid: number
    downloads: number
    tags: string[]
    modidstr: string
    modversion: string
    created: string
  }

  type DownloadableGameVersionTypeType = {
    version: string
    type: "stable" | "rc" | "pre"
    releaseDate: string
    windows: string
    linux: string
  }

  type DownloadableModAuthorType = {
    userid: string
    name: string
  }

  type DownloadableModGameVersionType = {
    tagid: string
    name: string
    color: string
  }

  type DownloadableModTagType = {
    tagid: number
    name: string
    color: string
  }

  type IconType = {
    id: string
    name: string
    icon: string
    custom?: boolean
  }

  declare module "*.png" {
    const value: string
    export default value
  }
}

export {}
