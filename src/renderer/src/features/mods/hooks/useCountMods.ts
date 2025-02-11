import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"

export function useCountMods(): () => Promise<void> {
  const { config, configDispatch } = useConfigContext()

  /**
   * Count the mods on each Installation and Server and save the result on the config.
   *
   * @returns {Promise<void>}
   */
  async function countMods(): Promise<void> {
    config.installations.forEach(async (i) => {
      const modsPath = await window.api.pathsManager.formatPath([i.path, "Mods"])
      const modsCount = await window.api.modsManager.countMods(modsPath)
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: i.id, updates: { _modsCount: modsCount.count } } })
    })
  }

  return countMods
}
