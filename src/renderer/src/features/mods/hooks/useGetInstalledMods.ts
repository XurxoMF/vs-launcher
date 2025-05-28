export function useGetInstalledMods(): ({ path, onFinish }: { path: string; onFinish?: () => void }) => Promise<{ mods: InstalledModType[]; errors: ErrorInstalledModType[] }> {
  /**
   * Makes a query and returns all the mods from the selected path.
   *
   * @param {object} props
   * @param {string} [props.path] Where to look for the mods. Not the Mods folder! It'll append Mods at the end.
   * @param {() => void} [props.onFinish] Optional function that will be called just before returning the mod.
   * @returns {Promise<void>}
   */
  async function getInstalledMods({ path, onFinish }: { path: string; onFinish?: () => void }): Promise<{ mods: InstalledModType[]; errors: ErrorInstalledModType[] }> {
    try {
      const fullPath = await window.api.pathsManager.formatPath([path, "Mods"])
      const mods = await window.api.modsManager.getInstalledMods(fullPath)

      if (onFinish) onFinish()

      return mods
    } catch (err) {
      window.api.utils.logMessage("error", `[front] [mods] [features/mods/hooks/useGetInstalledMods.ts] [useGetInstalledMods > getInstalledMods] Error getting mods installed on ${path}.`)
      window.api.utils.logMessage("debug", `[front] [mods] [features/mods/hooks/useGetInstalledMods.ts] [useGetInstalledMods > getInstalledMods] Error getting mods installed on ${path}: ${err}`)
      return { mods: [], errors: [] }
    }
  }

  return getInstalledMods
}
