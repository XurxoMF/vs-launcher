export function useQueryMod(): ({ modid, onFinish }: { modid: string; onFinish?: () => void }) => Promise<DownloadableMod | undefined> {
  /**
   * Makes a query and returns the mod with the passed Mod ID.
   *
   * @param {object} props
   * @param {string} [props.modid] Mod ID string to query it.
   * @param {() => void} [props.onFinish] Optional function that will be called just before returning the mod.
   * @returns {Promise<void>}
   */
  async function queryMod({ modid, onFinish }: { modid: string; onFinish?: () => void }): Promise<DownloadableMod | undefined> {
    try {
      const res = await window.api.netManager.queryURL(`https://mods.vintagestory.at/api/mod/${modid}`)
      const data = await JSON.parse(res)

      if (onFinish) onFinish()

      return data["mod"]
    } catch (err) {
      window.api.utils.logMessage("error", `[hook] [useQueryMod] Error fetching ${modid} mod versions: ${err}`)
      return
    }
  }

  return queryMod
}
