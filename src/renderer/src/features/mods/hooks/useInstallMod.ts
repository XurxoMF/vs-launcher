import { useTranslation } from "react-i18next"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

import { useCountMods } from "@renderer/features/mods/hooks/useCountMods"

export function useInstallMod(): (
  installation: InstallationType | undefined,
  mod: DownloadableMod | undefined,
  version: DownloadableModRelease | undefined,
  oldMod: InstalledModType | undefined,
  onFinish?: () => void
) => Promise<void> {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const countMods = useCountMods()
  const { startDownload } = useTaskContext()

  /**
   * Installs a mod. If there is an old mod it'll delete that one first.
   *
   * @returns {Promise<void>}
   */
  async function installMod(
    installation: InstallationType | undefined,
    mod: DownloadableMod | undefined,
    version: DownloadableModRelease | undefined,
    oldMod: InstalledModType | undefined,
    onFinish?: () => void
  ): Promise<void> {
    if (!installation) return addNotification(t("features.installations.noInstallationSelected"), "error")
    if (!mod) return addNotification(t("features.mods.noModSelected"), "error")
    if (!version) return addNotification(t("features.mods.noVersionSelected"), "error")

    const installPath = await window.api.pathsManager.formatPath([installation.path, "Mods"])

    if (oldMod) await window.api.pathsManager.deletePath(oldMod.path)

    startDownload(
      t("features.mods.modTaskName", { name: mod.name, version: `v${version.modversion}`, installation: installation.name }),
      t("features.mods.modDownloadDesc", { name: mod.name, version: `v${version.modversion}`, installation: installation.name }),
      "end",
      version.mainfile,
      installPath,
      `${version.modidstr}-${version.modversion}`,
      async (status, _path, error) => {
        if (!status) {
          window.api.utils.logMessage("error", `[front] [mods] [features/mods/hooks/useInstallMod.ts] [useInstallMod > installMod] Error downloading mod.`)
          window.api.utils.logMessage("debug", `[front] [mods] [features/mods/hooks/useInstallMod.ts] [useInstallMod > installMod] Error downloading mod: ${error}`)
          return
        }
        if (onFinish) onFinish()
        countMods()
      }
    )
  }

  return installMod
}
