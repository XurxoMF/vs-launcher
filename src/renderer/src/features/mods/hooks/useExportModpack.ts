import { useTranslation } from "react-i18next"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

export function useExportModpack(): ({ installedMods, installation }: { installedMods: InstalledModType[]; installation: InstallationType }) => Promise<void> {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()

  async function exportModpack({ installedMods, installation }: { installedMods: InstalledModType[]; installation: InstallationType }): Promise<void> {
    const manifest: ModpackManifestType = {
      name: installation.name,
      gameVersion: installation.version,
      mods: installedMods.map((mod) => ({
        modid: mod.modid,
        version: mod.version,
        assetid: mod._mod?.assetid ?? null
      }))
    }

    const result = await window.api.modsManager.exportModpack(manifest)

    if (result.success) {
      addNotification(t("features.mods.exportModpackSuccess"), "success")
    } else {
      addNotification(t("features.mods.exportModpackError"), "error")
    }
  }

  return exportModpack
}
