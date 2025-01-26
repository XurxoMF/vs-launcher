import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { Button, Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { PiArrowCounterClockwiseFill, PiFolderFill, PiTrashFill } from "react-icons/pi"
import { AnimatePresence, motion } from "motion/react"
import { v4 as uuidv4 } from "uuid"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

import { ListGroup, Listitem, ListWrapper } from "@renderer/components/ui/List"

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
    if (!backupToRestore) return addNotification(t("notifications.titles.error"), t("features.backups.noBackupSelected"), "error")

    if (!installation) return addNotification(t("notifications.titles.error"), t("features.installations.noInstallationFound"), "error")
    if (installation._backuping) return addNotification(t("notifications.titles.error"), t("features.backups.backupInProgress"), "error")
    if (installation._playing) return addNotification(t("notifications.titles.error"), t("features.installations.editWhilePlaying"), "error")
    if (installation._restoringBackup) return addNotification(t("notifications.titles.error"), t("features.backups.restoreInProgress"), "error")

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

  return (
    <>
      <h1 className="text-3xl text-center font-bold select-none">{t("features.installations.restoreBackup")}</h1>

      <ListWrapper className="max-w-[800px] w-full">
        <ListGroup>
          {backups && backups.length < 1 && (
            <div className="w-full flex flex-col items-center justify-center gap-2 rounded bg-zinc-850 p-4">
              <p className="text-2xl">{t("features.backups.noBackupsFound")}</p>
            </div>
          )}
          {backups &&
            backups.map((backup) => (
              <Listitem key={backup.id}>
                <div className="flex gap-4 px-2 py-1 justify-between items-center whitespace-nowrap">
                  <div className="flex gap-2 items-center">
                    <p>{new Date(backup.date).toLocaleString("es")}</p>
                  </div>

                  <div className="w-full text-sm text-zinc-500  text-center overflow-hidden">
                    <p className="hidden group-hover:block overflow-hidden text-ellipsis">{backup.path}</p>
                  </div>

                  <div className="flex gap-2 justify-end text-lg">
                    <Button
                      className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                      title={t("features.backups.restoreBackup")}
                      onClick={() => setBackupToRestore(backup)}
                    >
                      <PiArrowCounterClockwiseFill />
                    </Button>
                    <Button
                      onClick={() => setBackupToDelete(backup)}
                      title={t("generic.delete")}
                      className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    >
                      <PiTrashFill />
                    </Button>
                    <Button
                      onClick={async () => {
                        const folder = await window.api.pathsManager.removeFileFromPath(backup.path)
                        if (!(await window.api.pathsManager.checkPathExists(folder))) return addNotification(t("notifications.titles.error"), t("notifications.body.folderDoesntExists"), "error")
                        window.api.pathsManager.openPathOnFileExplorer(folder)
                      }}
                      title={t("generic.openOnFileExplorer")}
                      className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    >
                      <PiFolderFill />
                    </Button>
                  </div>
                </div>
              </Listitem>
            ))}
        </ListGroup>
      </ListWrapper>

      <AnimatePresence>
        {backupToRestore !== null && (
          <Dialog
            static
            open={backupToRestore !== null}
            onClose={() => setBackupToRestore(null)}
            className="w-full h-full absolute top-0 left-0 z-[200] flex justify-center items-center backdrop-blur-sm"
          >
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}>
              <DialogPanel className="flex flex-col gap-4 text-center bg-zinc-850 rounded p-8 max-w-[600px]">
                <DialogTitle className="text-2xl font-bold">{t("features.backups.restoreBackup")}</DialogTitle>
                <Description className="flex flex-col gap-2">
                  <p>{t("features.backups.areYouSureRestoreBackup")}</p>
                  <p className="text-zinc-500">{t("features.backups.restoringNotReversible")}</p>
                </Description>
                <div className="flex gap-4 items-center justify-center">
                  <button
                    title={t("generic.cancel")}
                    className="px-2 py-1 bg-zinc-800 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    onClick={() => setBackupToRestore(null)}
                  >
                    {t("generic.cancel")}
                  </button>
                  <button
                    title={t("generic.restore")}
                    className="px-2 py-1 bg-red-800 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    onClick={RestoreBackupHandler}
                  >
                    {t("generic.restore")}
                  </button>
                </div>
              </DialogPanel>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {backupToDelete !== null && (
          <Dialog
            static
            open={backupToDelete !== null}
            onClose={() => setBackupToDelete(null)}
            className="w-full h-full absolute top-0 left-0 z-[200] flex justify-center items-center backdrop-blur-sm"
          >
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}>
              <DialogPanel className="flex flex-col gap-4 text-center bg-zinc-850 rounded p-8 max-w-[600px]">
                <DialogTitle className="text-2xl font-bold">{t("features.backups.deleteBackup")}</DialogTitle>
                <Description className="flex flex-col gap-2">
                  <p>{t("features.backups.areYouSureDelete")}</p>
                  <p className="text-zinc-500">{t("features.backups.deletingNotReversible")}</p>
                </Description>
                <div className="flex gap-4 items-center justify-center">
                  <button
                    title={t("generic.cancel")}
                    className="px-2 py-1 bg-zinc-800 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    onClick={() => setBackupToDelete(null)}
                  >
                    {t("generic.cancel")}
                  </button>
                  <button
                    title={t("generic.delete")}
                    className="px-2 py-1 bg-red-800 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    onClick={async () => {
                      try {
                        if (!installation) return addNotification(t("notifications.titles.error"), t("features.installations.noInstallationFound"), "error")

                        if (backupToDelete._restoring || backupToDelete._deleting) return addNotification(t("notifications.titles.error"), t("features.backups.cantDeleteWhileinUse"), "error")

                        const deleted = await window.api.pathsManager.deletePath(backupToDelete.path)
                        if (!deleted) throw new Error("There was an error deleting backup file.")

                        configDispatch({ type: CONFIG_ACTIONS.DELETE_INSTALLATION_BACKUP, payload: { id: installation!.id, backupId: backupToDelete.id } })
                        addNotification(t("notifications.titles.success"), t("features.backups.backupDeletedSuccesfully"), "success")
                      } catch (err) {
                        addNotification(t("notifications.titles.error"), t("features.backups.errorDeletingBackup"), "error")
                      } finally {
                        setBackupToDelete(null)
                      }
                    }}
                  >
                    {t("generic.delete")}
                  </button>
                </div>
              </DialogPanel>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}

export default RestoreInstallationBackup
