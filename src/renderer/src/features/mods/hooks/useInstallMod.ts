import { useTranslation } from "react-i18next"

import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

export function useInstallMod(): ({
  path,
  mod,
  release,
  outName,
  oldMod,
  onFinish
}: {
  path: string
  mod: DownloadableModType
  release: DownloadableModReleaseType
  outName: string
  oldMod?: InstalledModType
  onFinish?: () => void
}) => Promise<void> {
  const { t } = useTranslation()
  const { startDownload } = useTaskContext()

  /**
   * Installs a mod. If there is an old mod it'll delete that one first.
   *
   * @param {Object} props
   * @param {string} [props.path] Where to download the mod. /Mods will be added at the end.
   * @param {DownloadableModType} [props.mod] Mod to download.
   * @param {DownloadableModReleaseType} [props.release] Release to download.
   * @param {string} [props.outName] Name of the Server or Installations where it'll be downloaded. Shown on the notification.
   * @param {InstalledModType} [props.oldMod] Old mod to delete first.
   * @param {() => void} [props.onFinish] Function to be calles before returning.
   * @returns {Promise<void>}
   */
  async function installMod({
    path,
    mod,
    release,
    outName,
    oldMod,
    onFinish
  }: {
    path: string
    mod: DownloadableModType
    release: DownloadableModReleaseType
    outName: string
    oldMod?: InstalledModType
    onFinish?: () => void
  }): Promise<void> {
    const installPath = await window.api.pathsManager.formatPath([path, "Mods"])

    if (oldMod) await window.api.pathsManager.deletePath(oldMod.path)

    startDownload(
      t("features.mods.modTaskName", { name: mod.name, version: `v${release.modversion}`, out: outName }),
      t("features.mods.modDownloadDesc", { name: mod.name, version: `v${release.modversion}`, out: outName }),
      "end",
      release.mainfile,
      installPath,
      `${release.modidstr}-${release.modversion}`,
      async (status, _path, error) => {
        if (!status) {
          window.api.utils.logMessage("error", `[front] [mods] [features/mods/hooks/useInstallMod.ts] [useInstallMod > installMod] Error downloading mod.`)
          window.api.utils.logMessage("debug", `[front] [mods] [features/mods/hooks/useInstallMod.ts] [useInstallMod > installMod] Error downloading mod: ${error}`)
          return
        }
        if (onFinish) onFinish()
      }
    )
  }

  return installMod
}
