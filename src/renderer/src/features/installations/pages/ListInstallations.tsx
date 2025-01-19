import { useState } from "react"
import { Link } from "react-router-dom"
import { Button, Description, Dialog, DialogPanel, DialogTitle, Input } from "@headlessui/react"
import { PiFolderFill, PiPlusCircleFill, PiTrashFill, PiPencilFill, PiArrowsCounterClockwiseFill } from "react-icons/pi"
import { useTranslation, Trans } from "react-i18next"
import { AnimatePresence, motion } from "motion/react"
import { v4 as uuidv4 } from "uuid"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

import { ListGroup, ListWrapper, Listitem } from "@renderer/components/ui/List"

function ListInslallations(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const { startCompress } = useTaskContext()

  const [installationToDelete, setInstallationToDelete] = useState<InstallationType | null>(null)
  const [deleteData, setDeleData] = useState<boolean>(false)

  async function BackupHandler(installation: InstallationType): Promise<void> {
    if (installation._backuping) return addNotification(t("notifications.titles.error"), t("features.backups.backupInProgress"), "error")
    if (installation._playing) return addNotification(t("notifications.titles.error"), t("features.backups.backupWhilePlaying"), "error")

    if ((await window.api.pathsManager.checkPathExists(installation.path)) && config.backupsFolder && installation.backupsLimit > 0) {
      const id = uuidv4()
      window.api.utils.setPreventAppClose("add", id, "Making and installation backup.")

      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installation.id, updates: { _backuping: true } } })

      try {
        let backupsLength = installation.backups.length

        while (backupsLength > 0 && backupsLength >= installation.backupsLimit) {
          const backupToDelete = installation.backups[backupsLength - 1]
          const res = await window.api.pathsManager.deletePath(backupToDelete.path)
          if (!res) return addNotification(t("notifications.titles.error"), t("features.backups.errorDeletingOldBackup"), "error")
          configDispatch({
            type: CONFIG_ACTIONS.DELETE_INSTALLATION_BACKUP,
            payload: { id: installation.id, backupId: backupToDelete.id }
          })
          backupsLength--
          window.api.utils.logMessage("info", `[ListInstallations] [backup] Deleted old backup: ${backupToDelete.path}`)
        }

        const fileName = `${installation.name.replace(/[^a-zA-Z0-9]/g, "-")}_${new Date().toLocaleString("es").replace(/[^a-zA-Z0-9]/g, "-")}.zip`
        const backupPath = await window.api.pathsManager.formatPath([config.backupsFolder, "Installations", installation.name.replace(/[^a-zA-Z0-9]/g, "-")])
        const outBackupPath = await window.api.pathsManager.formatPath([backupPath, fileName])

        await startCompress(`${installation.name} backup`, `Backing up installation ${installation.name}`, installation.path, backupPath, fileName, (status) => {
          if (!status) throw new Error("Error compressing installation!")

          configDispatch({
            type: CONFIG_ACTIONS.ADD_INSTALLATION_BACKUP,
            payload: { id: installation.id, backup: { date: Date.now(), id: uuidv4(), path: outBackupPath } }
          })
        })
      } catch (err) {
        window.api.utils.logMessage("error", `[ListInstallations] [backup] Error making a backup: ${err}`)
      } finally {
        window.api.utils.setPreventAppClose("remove", id, "Finished installation backup.")
        configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installation.id, updates: { _backuping: false } } })
      }
    }
  }

  return (
    <>
      <h1 className="text-3xl text-center font-bold select-none">{t("features.installations.listTitle")}</h1>

      <ListWrapper className="max-w-[800px] w-full">
        <ListGroup>
          {config.installations.length < 1 && (
            <div className="w-full flex flex-col items-center justify-center gap-2 rounded bg-zinc-850 p-4">
              <p className="text-2xl">{t("features.installations.noInstallationsFound")}</p>
              <p className="w-full flex gap-1 items-center justify-center">
                <Trans i18nKey="features.installations.noInstallationsFoundDescOnPage" components={{ button: <PiPlusCircleFill className="text-lg" /> }} />
              </p>
            </div>
          )}
          {config.installations.map((installation) => (
            <Listitem key={installation.id}>
              <div className="flex gap-4 justify-between items-center whitespace-nowrap">
                <div className="flex gap-2 items-center">
                  <p>{installation.name}</p>
                  <div className="flex gap-2 items-center text-sm text-zinc-500">
                    <p>{installation.version}</p>
                    <p>{t("features.mods.modsCount", { count: installation.mods.length })}</p>
                  </div>
                </div>

                <div className="w-full text-sm text-zinc-500 overflow-hidden">
                  <p className="hidden group-hover:block overflow-hidden text-ellipsis">{installation.path}</p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    title={t("generic.backup")}
                    onClick={() => BackupHandler(installation)}
                  >
                    <PiArrowsCounterClockwiseFill className="text-lg" />
                  </Button>
                  <Link
                    to={`/installations/edit/${installation.id}`}
                    title={t("generic.edit")}
                    className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                  >
                    <PiPencilFill className="text-lg" />
                  </Link>
                  <Button
                    className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    title={t("generic.delete")}
                    onClick={async () => {
                      setInstallationToDelete(installation)
                    }}
                  >
                    <PiTrashFill className="text-lg" />
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!(await window.api.pathsManager.checkPathExists(installation.path)))
                        return addNotification(t("notifications.titles.error"), t("notifications.body.folderDoesntExists"), "error")
                      window.api.pathsManager.openPathOnFileExplorer(installation.path)
                    }}
                    title={t("generic.openOnFileExplorer")}
                    className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                  >
                    <PiFolderFill className="text-lg" />
                  </Button>
                </div>
              </div>
            </Listitem>
          ))}
        </ListGroup>
      </ListWrapper>

      <div className="flex gap-2 justify-center items-center">
        <Link to="/installations/add" title={t("generic.add")} className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded">
          <PiPlusCircleFill className="text-lg" />
        </Link>
      </div>

      <AnimatePresence>
        {installationToDelete !== null && (
          <Dialog
            static
            open={installationToDelete !== null}
            onClose={() => setInstallationToDelete(null)}
            className="w-full h-full absolute top-0 left-0 z-[200] flex justify-center items-center backdrop-blur-sm"
          >
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}>
              <DialogPanel className="flex flex-col gap-4 text-center bg-zinc-850 rounded p-8 max-w-[600px]">
                <DialogTitle className="text-2xl font-bold">{t("features.installations.deleteInstallation")}</DialogTitle>
                <Description className="flex flex-col gap-2">
                  <p>{t("features.installations.areYouSureDelete")}</p>
                  <p className="text-zinc-500">{t("features.installations.deletingNotReversible")}</p>
                  <div className="flex gap-2 items-center justify-center">
                    <Input id="delete-data" type="checkbox" checked={deleteData} onChange={(e) => setDeleData(e.target.checked)} />
                    <label htmlFor="delete-data">{t("features.installations.deleteData")}</label>
                  </div>
                </Description>
                <div className="flex gap-4 items-center justify-center">
                  <button
                    title={t("generic.cancel")}
                    className="px-2 py-1 bg-zinc-800 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    onClick={() => setInstallationToDelete(null)}
                  >
                    {t("generic.cancel")}
                  </button>
                  <button
                    title={t("generic.delete")}
                    className="px-2 py-1 bg-red-800 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    onClick={async () => {
                      try {
                        if (installationToDelete._playing || installationToDelete._backuping)
                          return addNotification(t("notifications.titles.error"), t("features.installations.cantDeleteWhileinUse"), "error")

                        if (deleteData && !(await window.api.pathsManager.deletePath(installationToDelete.path))) throw new Error("Error deleting installation data!")

                        configDispatch({ type: CONFIG_ACTIONS.DELETE_INSTALLATION, payload: { id: installationToDelete.id } })
                        addNotification(t("notifications.titles.success"), t("features.installations.installationSuccessfullyDeleted"), "success")
                      } catch (err) {
                        addNotification(t("notifications.titles.error"), t("features.installations.errorDeletingInstallation"), "error")
                      } finally {
                        setInstallationToDelete(null)
                        setDeleData(false)
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

export default ListInslallations
