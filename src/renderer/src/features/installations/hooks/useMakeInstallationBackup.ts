import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

export function useMakeInstallationBackup(): (installationId: string) => Promise<boolean> {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const { startCompress } = useTaskContext()

  /**
   * Make a backup of the selected Installation.
   *
   * @param {string} installationId - The ID of the Installation to backup.
   * @returns {Promise<boolen>} - If the backup was made or not.
   */
  async function makeInstallationBackup(installationId: string): Promise<boolean> {
    const installation = config.installations.find((i) => i.id === installationId)

    if (!installation) {
      addNotification(t("features.installations.noInstallationFound"), "error")
      return false
    }

    if (installation._backuping) {
      addNotification(t("features.backups.backupInProgress"), "error")
      return false
    }

    if (installation._playing) {
      addNotification(t("features.backups.backupWhilePlaying"), "error")
      return false
    }

    if (installation._restoringBackup) {
      addNotification(t("features.backups.restoreInProgress"), "error")
      return false
    }

    if ((await window.api.pathsManager.checkPathExists(installation.path)) && config.backupsFolder && installation.backupsLimit > 0) {
      const id = uuidv4()
      window.api.utils.setPreventAppClose("add", id, "Making and installation backup.")

      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installation.id, updates: { _backuping: true } } })

      try {
        let backupsLength = installation.backups.length

        while (backupsLength > 0 && backupsLength >= installation.backupsLimit) {
          const backupToDelete = installation.backups[backupsLength - 1]
          const res = await window.api.pathsManager.deletePath(backupToDelete.path)
          if (!res) throw new Error("There was an error deleting old backups!")
          configDispatch({
            type: CONFIG_ACTIONS.DELETE_INSTALLATION_BACKUP,
            payload: { id: installation.id, backupId: backupToDelete.id }
          })
          backupsLength--
          window.api.utils.logMessage(
            "info",
            `[front] [backups] [features/installations/hooks/useMakeInstallationBackup.ts] [useMakeInstallationBackup > makeInstallationBackup] Deleted old backup ${backupToDelete.path}.`
          )
        }

        const backupDate = Date.now()

        const fileName = `${installation.name.replace(/[^a-zA-Z0-9]/g, "-")}_${backupDate.toLocaleString("es").replace(/[^a-zA-Z0-9]/g, "-")}.zip`
        const backupPath = await window.api.pathsManager.formatPath([config.backupsFolder, "Installations", installation.name.replace(/[^a-zA-Z0-9]/g, "-")])
        const outBackupPath = await window.api.pathsManager.formatPath([backupPath, fileName])

        await startCompress(
          t("features.backups.cmpressTaskName", { name: installation.name }),
          t("features.backups.compressingBackupDescription", { name: installation.name }),
          "all",
          installation.path,
          backupPath,
          fileName,
          (status) => {
            if (!status) throw new Error("Error compressing installation!")

            configDispatch({
              type: CONFIG_ACTIONS.ADD_INSTALLATION_BACKUP,
              payload: { id: installation.id, backup: { date: backupDate, id: uuidv4(), path: outBackupPath } }
            })
          },
          installation.compressionLevel
        )
      } catch (err) {
        window.api.utils.logMessage(
          "error",
          `[front] [backups] [features/installations/hooks/useMakeInstallationBackup.ts] [useMakeInstallationBackup > makeInstallationBackup] Error creating backup.`
        )
        window.api.utils.logMessage(
          "debug",
          `[front] [backups] [features/installations/hooks/useMakeInstallationBackup.ts] [useMakeInstallationBackup > makeInstallationBackup] Error creating backup: ${err}`
        )
        addNotification(t("features.backups.errorMakingBackup"), "error")
        return false
      } finally {
        window.api.utils.setPreventAppClose("remove", id, "Finished installation backup.")
        configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installation.id, updates: { _backuping: false } } })
      }
    }

    return true
  }

  return makeInstallationBackup
}
