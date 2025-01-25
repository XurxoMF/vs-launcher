// import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
// import { AnimatePresence, motion } from "motion/react"
// import { v4 as uuidv4 } from "uuid"

// import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"
// import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

// import { ListGroup, ListWrapper, Listitem } from "@renderer/components/ui/List"

function RestoreInstallationBackup(): JSX.Element {
  const { t } = useTranslation()

  const { id } = useParams()
  // const { addNotification } = useNotificationsContext()
  // const { config, configDispatch } = useConfigContext()

  // async function RestoreInstallationBackupHandler(installation: InstallationType): Promise<void> {
  //   if (installation._backuping) return addNotification(t("notifications.titles.error"), t("features.backups.backupInProgress"), "error")
  //   if (installation._playing) return addNotification(t("notifications.titles.error"), t("features.backups.backupWhilePlaying"), "error")

  //   if ((await window.api.pathsManager.checkPathExists(installation.path)) && config.backupsFolder && installation.backupsLimit > 0) {
  //     const id = uuidv4()
  //     window.api.utils.setPreventAppClose("add", id, "Making and installation backup.")

  //     configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installation.id, updates: { _backuping: true } } })

  //     try {
  //       let backupsLength = installation.backups.length

  //       while (backupsLength > 0 && backupsLength >= installation.backupsLimit) {
  //         const backupToDelete = installation.backups[backupsLength - 1]
  //         const res = await window.api.pathsManager.deletePath(backupToDelete.path)
  //         if (!res) return addNotification(t("notifications.titles.error"), t("features.backups.errorDeletingOldBackup"), "error")
  //         configDispatch({
  //           type: CONFIG_ACTIONS.DELETE_INSTALLATION_BACKUP,
  //           payload: { id: installation.id, backupId: backupToDelete.id }
  //         })
  //         backupsLength--
  //         window.api.utils.logMessage("info", `[ListInstallations] [backup] Deleted old backup: ${backupToDelete.path}`)
  //       }

  //       const fileName = `${installation.name.replace(/[^a-zA-Z0-9]/g, "-")}_${new Date().toLocaleString("es").replace(/[^a-zA-Z0-9]/g, "-")}.zip`
  //       const backupPath = await window.api.pathsManager.formatPath([config.backupsFolder, "Installations", installation.name.replace(/[^a-zA-Z0-9]/g, "-")])
  //       const outBackupPath = await window.api.pathsManager.formatPath([backupPath, fileName])

  //       await startCompress(`${installation.name} backup`, `Backing up installation ${installation.name}`, installation.path, backupPath, fileName, (status) => {
  //         if (!status) throw new Error("Error compressing installation!")

  //         configDispatch({
  //           type: CONFIG_ACTIONS.ADD_INSTALLATION_BACKUP,
  //           payload: { id: installation.id, backup: { date: Date.now(), id: uuidv4(), path: outBackupPath } }
  //         })
  //       })
  //     } catch (err) {
  //       window.api.utils.logMessage("error", `[ListInstallations] [backup] Error making a backup: ${err}`)
  //     } finally {
  //       window.api.utils.setPreventAppClose("remove", id, "Finished installation backup.")
  //       configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installation.id, updates: { _backuping: false } } })
  //     }
  //   }
  // }

  return (
    <>
      <h1 className="text-3xl text-center font-bold select-none">{t("features.installations.restoreBackup")}</h1>

      <p>{id}</p>
    </>
  )
}

export default RestoreInstallationBackup
