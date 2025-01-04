declare global {
  type BasicConfigType = {
    version: number
    lastUsedInstallation: string | null
    defaultInstallationsFolder: string
    defaultVersionsFolder: string
  }

  type GameVersionType = {
    version: string
    path: string
    installed: boolean
  }

  type ModType = {
    modid: number
    releaseid: number
    filename: string
  }

  type InstallationType = {
    id: string
    name: string
    path: string
    version: string
    startParams: string
    mods: ModType[]
  }

  type ConfigType = BasicConfigType & {
    installations: InstallationType[]
    gameVersions: GameVersionType[]
  }

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
