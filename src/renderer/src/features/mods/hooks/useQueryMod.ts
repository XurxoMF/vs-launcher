export function useQueryMod(): ({ modid, onFinish }: { modid: number | string; onFinish?: () => void }) => Promise<DownloadableModType | undefined> {
  /**
   * Makes a query and returns the mod with the passed Mod ID.
   *
   * @param {object} props
   * @param {string} [props.modid] Mod ID string to query it.
   * @param {() => void} [props.onFinish] Optional function that will be called just before returning the mod.
   * @returns {Promise<void>}
   */
  async function queryMod({ modid, onFinish }: { modid: number | string; onFinish?: () => void }): Promise<DownloadableModType | undefined> {
    try {
      const res = await window.api.netManager.queryURL(`https://mods.vintagestory.at/api/mod/${modid}`)
      const data = await JSON.parse(res)

      if (onFinish) onFinish()

      if (!data["statuscode"] || data["statuscode"] != 200) return

      return data["mod"]
    } catch (err) {
      window.api.utils.logMessage("error", `[front] [mods] [features/mods/hooks/useQueryMod.ts] [useQueryMod > queryMod] Error fetching ${modid} mod versions.`)
      window.api.utils.logMessage("debug", `[front] [mods] [features/mods/hooks/useQueryMod.ts] [useQueryMod > queryMod] Error fetching ${modid} mod versions: ${err}`)
      return
    }
  }

  return queryMod
}
