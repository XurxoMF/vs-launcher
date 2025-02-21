import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { Button } from "@headlessui/react"
import { PiArrowCounterClockwiseFill, PiFolderFill, PiTrashFill } from "react-icons/pi"
import { v4 as uuidv4 } from "uuid"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

import { ListGroup, ListItem, ListWrapper } from "@renderer/components/ui/List"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"

function RestoreInstallationBackup(): JSX.Element {
  const { id } = useParams()

  const { t } = useTranslation()
  const { config, configDispatch } = useConfigContext()
  const { addNotification } = useNotificationsContext()
  const { startExtract } = useTaskContext()

  const [backupToRestore, setBackupToRestore] = useState<BackupType | null>(null)
  const [backupToDelete, setBackupToDelete] = useState<BackupType | null>(null)

  const installation = config.installations.find((igv) => igv.id === id)
  const backups = installation?.backups

  async function RestoreBackupHandler(): Promise<void> {
    if (!backupToRestore) return addNotification(t("features.backups.noBackupSelected"), "error")

    if (!installation) return addNotification(t("features.installations.noInstallationFound"), "error")
    if (installation._backuping) return addNotification(t("features.backups.backupInProgress"), "error")
    if (installation._playing) return addNotification(t("features.installations.editWhilePlaying"), "error")
    if (installation._restoringBackup) return addNotification(t("features.backups.restoreInProgress"), "error")

    const id = uuidv4()

    try {
      window.api.utils.setPreventAppClose("add", id, "Starting backup restoration...")
      configDispatch({
        type: CONFIG_ACTIONS.EDIT_INSTALLATION,
        payload: { id: installation.id, updates: { _restoringBackup: true } }
      })
      configDispatch({
        type: CONFIG_ACTIONS.EDIT_INSTALLATION_BACKUP,
        payload: { id: installation.id, backupId: backupToRestore.id, updates: { _restoring: true } }
      })

      const deletedPath = await window.api.pathsManager.deletePath(installation.path)
      if (!deletedPath) throw new Error("Error while deleting the installation path")

      startExtract(
        t("features.backups.extractTaskName", { name: installation.name }),
        t("features.backups.extractingBackupDescription", { name: installation.name }),
        backupToRestore.path,
        installation.path,
        false,
        (completed) => {
          if (!completed) throw new Error("There was an error extracting the backup")
        }
      )
    } catch (err) {
      window.api.utils.logMessage("error", `[RestoreInstallationBackup] [backup] There was an error while restoring a backup: ${err}`)
    } finally {
      setBackupToRestore(null)
      window.api.utils.setPreventAppClose("remove", id, "Finished backup restoration...")
      configDispatch({
        type: CONFIG_ACTIONS.EDIT_INSTALLATION,
        payload: { id: installation.id, updates: { _restoringBackup: false } }
      })
      configDispatch({
        type: CONFIG_ACTIONS.EDIT_INSTALLATION_BACKUP,
        payload: { id: installation.id, backupId: backupToRestore.id, updates: { _restoring: false } }
      })
    }
  }

  async function DeleteBackupHandler(): Promise<void> {
    try {
      if (!installation) return addNotification(t("features.installations.noInstallationFound"), "error")

      if (!backupToDelete || backupToDelete._restoring || backupToDelete._deleting) return addNotification(t("features.backups.cantDeleteWhileinUse"), "error")

      const deleted = await window.api.pathsManager.deletePath(backupToDelete.path)
      if (!deleted) throw new Error("There was an error deleting backup file.")

      configDispatch({ type: CONFIG_ACTIONS.DELETE_INSTALLATION_BACKUP, payload: { id: installation!.id, backupId: backupToDelete.id } })
      addNotification(t("features.backups.backupDeletedSuccesfully"), "success")
    } catch (err) {
      addNotification(t("features.backups.errorDeletingBackup"), "error")
    } finally {
      setBackupToDelete(null)
    }
  }

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-6">
        <h1 className="text-3xl text-center font-bold">{t("features.installations.restoreBackup")}</h1>

        <ListWrapper className="max-w-[800px] w-full">
          {backups && backups.length < 1 && (
            <div className="w-full flex flex-col items-center justify-center gap-2 rounded-sm bg-zinc-950/50 p-4">
              <p className="text-2xl">{t("features.backups.noBackupsFound")}</p>
            </div>
          )}
          <ListGroup>
            {backups &&
              backups.map((backup) => (
                <ListItem key={backup.id}>
                  <div className="flex gap-4 px-2 py-1 justify-between items-center whitespace-nowrap">
                    <div className="flex gap-2 items-center font-bold">
                      <p>{new Date(backup.date).toLocaleString("es")}</p>
                    </div>

                    <div className="w-full text-sm text-zinc-300  text-center overflow-hidden">
                      <p className="hidden group-hover:block overflow-hidden text-ellipsis">{backup.path}</p>
                    </div>

                    <div className="flex gap-1 justify-end text-lg">
                      <Button className="p-1 flex items-center justify-center" title={t("features.backups.restoreBackup")} onClick={() => setBackupToRestore(backup)}>
                        <PiArrowCounterClockwiseFill />
                      </Button>
                      <Button onClick={() => setBackupToDelete(backup)} title={t("generic.delete")} className="p-1 flex items-center justify-center">
                        <PiTrashFill />
                      </Button>
                      <Button
                        onClick={async () => {
                          const folder = await window.api.pathsManager.removeFileFromPath(backup.path)
                          if (!(await window.api.pathsManager.checkPathExists(folder))) return addNotification(t("notifications.body.folderDoesntExists"), "error")
                          window.api.pathsManager.openPathOnFileExplorer(folder)
                        }}
                        title={t("generic.openOnFileExplorer")}
                        className="p-1 flex items-center justify-center"
                      >
                        <PiFolderFill />
                      </Button>
                    </div>
                  </div>
                </ListItem>
              ))}
          </ListGroup>
        </ListWrapper>

        <PopupDialogPanel title={t("features.backups.restoreBackup")} isOpen={backupToRestore !== null} close={() => setBackupToRestore(null)}>
          <>
            <p>{t("features.backups.areYouSureRestoreBackup")}</p>
            <p className="text-zinc-300">{t("features.backups.restoringNotReversible")}</p>
            <div className="flex gap-4 items-center justify-center">
              <Button
                title={t("generic.cancel")}
                className="px-2 py-1 bg-zinc-800 shadow-sm shadow-zinc-950/50 hover:shadow-none flex items-center justify-center rounded-sm"
                onClick={() => setBackupToRestore(null)}
              >
                {t("generic.cancel")}
              </Button>
              <Button
                title={t("generic.restore")}
                className="px-2 py-1 bg-red-800 shadow-sm shadow-zinc-950/50 hover:shadow-none flex items-center justify-center rounded-sm"
                onClick={RestoreBackupHandler}
              >
                {t("generic.restore")}
              </Button>
            </div>
          </>
        </PopupDialogPanel>

        <PopupDialogPanel title={t("features.backups.deleteBackup")} isOpen={backupToDelete !== null} close={() => setBackupToDelete(null)}>
          <>
            <p>{t("features.backups.areYouSureDelete")}</p>
            <p className="text-zinc-300">{t("features.backups.deletingNotReversible")}</p>
            <div className="flex gap-4 items-center justify-center">
              <Button
                title={t("generic.cancel")}
                className="px-2 py-1 bg-zinc-800 shadow-sm shadow-zinc-950/50 hover:shadow-none flex items-center justify-center rounded-sm"
                onClick={() => setBackupToDelete(null)}
              >
                {t("generic.cancel")}
              </Button>
              <Button
                title={t("generic.delete")}
                className="px-2 py-1 bg-red-800 shadow-sm shadow-zinc-950/50 hover:shadow-none flex items-center justify-center rounded-sm"
                onClick={DeleteBackupHandler}
              >
                {t("generic.delete")}
              </Button>
            </div>
          </>
        </PopupDialogPanel>
      </div>
    </ScrollableContainer>
  )
}

export default RestoreInstallationBackup
