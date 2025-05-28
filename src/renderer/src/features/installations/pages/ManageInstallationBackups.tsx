import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { PiArrowCounterClockwiseDuotone, PiFolderOpenDuotone, PiTrashDuotone, PiXCircleDuotone } from "react-icons/pi"
import { v4 as uuidv4 } from "uuid"

import { useGetInstalledMods } from "@renderer/features/mods/hooks/useGetInstalledMods"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

import { ListGroup, ListItem, ListWrapper } from "@renderer/components/ui/List"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import { NormalButton } from "@renderer/components/ui/Buttons"
import { FormButton } from "@renderer/components/ui/FormComponents"
import { ThinSeparator } from "@renderer/components/ui/ListSeparators"
import { StickyMenuWrapper, StickyMenuGroupWrapper, StickyMenuGroup, StickyMenuBreadcrumbs, GoBackButton, GoToTopButton } from "@renderer/components/ui/StickyMenu"

function ManageInstallationBackups(): JSX.Element {
  const { id } = useParams()

  const { t } = useTranslation()
  const { config, configDispatch } = useConfigContext()
  const { addNotification } = useNotificationsContext()
  const { startExtract } = useTaskContext()

  const getInstalledMods = useGetInstalledMods()

  const [backupToRestore, setBackupToRestore] = useState<BackupType | null>(null)
  const [backupToDelete, setBackupToDelete] = useState<BackupType | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const installation = config.installations.find((igv) => igv.id === id)
  const backups = installation?.backups

  async function RestoreBackupHandler(backup: BackupType | null): Promise<void> {
    if (!backup) return addNotification(t("features.backups.noBackupSelected"), "error")

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
        payload: { id: installation.id, backupId: backup.id, updates: { _restoring: true } }
      })

      const deletedPath = await window.api.pathsManager.deletePath(installation.path)
      if (!deletedPath) throw new Error("Error while deleting the installation path")

      await startExtract(
        t("features.backups.extractTaskName", { name: installation.name }),
        t("features.backups.extractingBackupDescription", { name: installation.name }),
        "all",
        backup.path,
        installation.path,
        false,
        async (completed) => {
          if (!completed) throw new Error("There was an error extracting the backup")
        }
      )
    } catch (err) {
      window.api.utils.logMessage("error", `[front] [backups] [features/installations/pages/RestoreInstallationBackup.tsx] [RestoreBackupHandler] Error restoring a backup.`)
      window.api.utils.logMessage("debug", `[front] [backups] [features/installations/pages/RestoreInstallationBackup.tsx] [RestoreBackupHandler] Error restoring a backup: ${err}`)
    } finally {
      setBackupToRestore(null)
      window.api.utils.setPreventAppClose("remove", id, "Finished backup restoration...")

      const mods = await getInstalledMods({ path: installation.path })
      const totalMods = mods.mods.length + mods.errors.length

      configDispatch({
        type: CONFIG_ACTIONS.EDIT_INSTALLATION,
        payload: { id: installation.id, updates: { _restoringBackup: false, _modsCount: totalMods } }
      })
      configDispatch({
        type: CONFIG_ACTIONS.EDIT_INSTALLATION_BACKUP,
        payload: { id: installation.id, backupId: backup.id, updates: { _restoring: false } }
      })
    }
  }

  async function DeleteBackupHandler(backup: BackupType | null): Promise<void> {
    try {
      if (!installation) return addNotification(t("features.installations.noInstallationFound"), "error")

      if (!backup || backup._restoring || backup._deleting) return addNotification(t("features.backups.cantDeleteWhileinUse"), "error")

      const deleted = await window.api.pathsManager.deletePath(backup.path)
      if (!deleted) throw new Error("There was an error deleting backup file.")

      configDispatch({ type: CONFIG_ACTIONS.DELETE_INSTALLATION_BACKUP, payload: { id: installation!.id, backupId: backup.id } })
      addNotification(t("features.backups.backupDeletedSuccesfully"), "success")
    } catch (err) {
      addNotification(t("features.backups.errorDeletingBackup"), "error")
    } finally {
      setBackupToDelete(null)
    }
  }

  return (
    <ScrollableContainer ref={scrollRef}>
      <div className="min-h-full flex flex-col items-center justify-center gap-2">
        <StickyMenuWrapper scrollRef={scrollRef}>
          <StickyMenuGroupWrapper>
            <StickyMenuGroup>
              <GoBackButton to="/installations" />
            </StickyMenuGroup>

            <StickyMenuBreadcrumbs
              breadcrumbs={[
                { name: t("breadcrumbs.installations"), to: "/installations" },
                { name: t("breadcrumbs.manageBackups"), to: installation ? `/installations/backups/${installation.id}` : "/installations" }
              ]}
            />

            <StickyMenuGroup>
              <GoToTopButton scrollRef={scrollRef} />
            </StickyMenuGroup>
          </StickyMenuGroupWrapper>
        </StickyMenuWrapper>

        <ListWrapper className="max-w-[50rem] w-full my-auto">
          {backups && backups.length < 1 && (
            <div className="relative w-full flex flex-col items-center justify-center gap-2 rounded-sm p-4">
              <p className="text-2xl">{t("features.backups.noBackupsFound")}</p>
            </div>
          )}
          <ListGroup>
            {backups &&
              backups.map((backup) => (
                <ListItem key={backup.id}>
                  <div className="w-full h-8 flex gap-2 p-1 justify-between items-center">
                    <div className="w-full flex items-center justify-center text-start font-bold pl-1">
                      <p className="w-full">{new Date(backup.date).toLocaleString("es")}</p>
                    </div>

                    <ThinSeparator />

                    <div className="shrink-0 w-fit flex gap-1 text-lg">
                      <NormalButton className="p-1" title={t("features.backups.restoreBackup")} onClick={() => setBackupToRestore(backup)}>
                        <PiArrowCounterClockwiseDuotone />
                      </NormalButton>
                      <NormalButton onClick={() => setBackupToDelete(backup)} title={t("generic.delete")} className="p-1">
                        <PiTrashDuotone />
                      </NormalButton>
                      <NormalButton
                        onClick={async () => {
                          const folder = await window.api.pathsManager.removeFileFromPath(backup.path)
                          if (!(await window.api.pathsManager.checkPathExists(folder))) return addNotification(t("notifications.body.folderDoesntExists"), "error")
                          window.api.pathsManager.openPathOnFileExplorer(folder)
                        }}
                        title={`${t("generic.openOnFileExplorer")} · ${backup.path}`}
                        className="p-1"
                      >
                        <PiFolderOpenDuotone />
                      </NormalButton>
                    </div>
                  </div>
                </ListItem>
              ))}
          </ListGroup>
        </ListWrapper>

        <PopupDialogPanel title={t("features.backups.restoreBackup")} isOpen={backupToRestore !== null} close={() => setBackupToRestore(null)}>
          <>
            <p>{t("features.backups.areYouSureRestoreBackup")}</p>
            <p className="text-zinc-400">{t("features.backups.restoringNotReversible")}</p>
            <div className="flex gap-4 items-center justify-center text-lg">
              <FormButton title={t("generic.cancel")} className="p-2" onClick={() => setBackupToRestore(null)} type="success">
                <PiXCircleDuotone />
              </FormButton>
              <FormButton
                title={t("generic.restore")}
                className="p-2"
                onClick={() => {
                  RestoreBackupHandler(backupToRestore)
                  setBackupToRestore(null)
                }}
                type="error"
              >
                <PiArrowCounterClockwiseDuotone />
              </FormButton>
            </div>
          </>
        </PopupDialogPanel>

        <PopupDialogPanel title={t("features.backups.deleteBackup")} isOpen={backupToDelete !== null} close={() => setBackupToDelete(null)}>
          <>
            <p>{t("features.backups.areYouSureDelete")}</p>
            <p className="text-zinc-400">{t("features.backups.deletingNotReversible")}</p>
            <div className="flex gap-4 items-center justify-center text-lg">
              <NormalButton title={t("generic.cancel")} className="p-2" onClick={() => setBackupToDelete(null)} type="success">
                <PiXCircleDuotone />
              </NormalButton>
              <NormalButton
                title={t("generic.delete")}
                className="p-2"
                onClick={() => {
                  DeleteBackupHandler(backupToDelete)
                  setBackupToDelete(null)
                }}
                type="error"
              >
                <PiTrashDuotone />
              </NormalButton>
            </div>
          </>
        </PopupDialogPanel>
      </div>
    </ScrollableContainer>
  )
}

export default ManageInstallationBackups
