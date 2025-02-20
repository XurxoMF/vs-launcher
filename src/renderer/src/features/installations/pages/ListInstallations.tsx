import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Input } from "@headlessui/react"
import { PiFolderFill, PiPlusCircleFill, PiTrashFill, PiPencilFill, PiCaretCircleDoubleDownFill, PiArrowCounterClockwiseFill, PiGearFill, PiXBold, PiEraserFill } from "react-icons/pi"
import { useTranslation } from "react-i18next"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useMakeInstallationBackup } from "@renderer/features/installations/hooks/useMakeInstallationBackup"
import { useCountMods } from "@renderer/features/mods/hooks/useCountMods"

import { ListGroup, ListWrapper, ListItem } from "@renderer/components/ui/List"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import { FormButton } from "@renderer/components/ui/FormComponents"
import { NormalButton } from "@renderer/components/ui/Buttons"

function ListInslallations(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const countMods = useCountMods()

  const makeInstallationBackup = useMakeInstallationBackup()

  const [installationToDelete, setInstallationToDelete] = useState<InstallationType | null>(null)
  const [deleteData, setDeleData] = useState<boolean>(false)

  // This is here to ensure mods are correctly counted before making any changes to installations.
  useEffect(() => {
    countMods()
  }, [])

  async function HandleModDelete(): Promise<void> {
    try {
      if (!installationToDelete) return addNotification(t("features.installations.noInstallationSelected"), "error")

      if (installationToDelete._playing || installationToDelete._backuping || installationToDelete._restoringBackup) return addNotification(t("features.installations.cantDeleteWhileinUse"), "error")

      if (deleteData) {
        const wasDeleted = await window.api.pathsManager.deletePath(installationToDelete.path)
        if (!wasDeleted) throw new Error("Error deleting installation data!")

        installationToDelete.backups.forEach((backup) => {
          const wasBackupDeleted = window.api.pathsManager.deletePath(backup.path)
          if (!wasBackupDeleted) throw new Error("Error deleting installation backup data!")
        })
      }

      configDispatch({ type: CONFIG_ACTIONS.DELETE_INSTALLATION, payload: { id: installationToDelete.id } })
      addNotification(t("features.installations.installationSuccessfullyDeleted"), "success")
    } catch (err) {
      addNotification(t("features.installations.errorDeletingInstallation"), "error")
    } finally {
      setInstallationToDelete(null)
      setDeleData(false)
    }
  }

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col items-center justify-center">
        <ListWrapper className="max-w-[800px] w-full">
          <ListGroup>
            <ListItem className="group">
              <Link to="/installations/add" title={t("features.installations.addNewInstallation")} className="w-full h-12 flex items-center justify-center rounded">
                <PiPlusCircleFill className="text-2xl text-zinc-300/60 group-hover:scale-95 duration-200" />
              </Link>
            </ListItem>
            {config.installations.map((installation) => (
              <ListItem key={installation.id}>
                <div className="w-full h-16 flex gap-4 px-2 py-1 justify-between items-center whitespace-nowrap">
                  <div className="h-full flex flex-col justify-center items-start gap-1 shrink-0">
                    <p className="font-bold">{installation.name}</p>
                    <div className="flex gap-2 items-center text-sm text-zinc-300">
                      <p>{installation.version}</p>
                      <p>{t("features.mods.modsCount", { count: installation._modsCount as number })}</p>
                    </div>
                  </div>

                  <div className="w-full text-sm text-zinc-300 text-center overflow-hidden">
                    <p className="opacity-0 group-hover:opacity-100 duration-200 overflow-hidden text-ellipsis">{installation.path}</p>
                  </div>

                  <div className="h-full flex gap-1 items-center shrink-0 text-lg">
                    <div className="flex flex-col gap-1">
                      <NormalButton
                        className="p-1 flex items-center justify-center"
                        title={t("generic.backup")}
                        onClick={async () => {
                          if (!(await window.api.pathsManager.checkPathExists(installation.path))) return addNotification(t("features.backups.folderDoesntExists"), "error")
                          makeInstallationBackup(installation.id)
                        }}
                      >
                        <PiCaretCircleDoubleDownFill />
                      </NormalButton>
                      <Link to={`/installations/backups/${installation.id}`} className="p-1 flex items-center justify-center" title={t("features.backups.restoreBackup")}>
                        <PiArrowCounterClockwiseFill />
                      </Link>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link to={`/installations/mods/${installation.id}`} title={t("features.mods.manageMods")} className="p-1 flex items-center justify-center">
                        <PiGearFill />
                      </Link>
                      <NormalButton
                        onClick={async () => {
                          if (!(await window.api.pathsManager.checkPathExists(installation.path))) return addNotification(t("notifications.body.folderDoesntExists"), "error")
                          window.api.pathsManager.openPathOnFileExplorer(installation.path)
                        }}
                        title={t("generic.openOnFileExplorer")}
                        className="p-1 flex items-center justify-center"
                      >
                        <PiFolderFill />
                      </NormalButton>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link to={`/installations/edit/${installation.id}`} title={t("generic.edit")} className="p-1 flex items-center justify-center">
                        <PiPencilFill />
                      </Link>
                      <NormalButton
                        className="p-1 flex items-center justify-center"
                        title={t("generic.delete")}
                        onClick={async () => {
                          setInstallationToDelete(installation)
                        }}
                      >
                        <PiTrashFill />
                      </NormalButton>
                    </div>
                  </div>
                </div>
              </ListItem>
            ))}
          </ListGroup>
        </ListWrapper>

        <PopupDialogPanel title={t("features.installations.deleteInstallation")} isOpen={installationToDelete !== null} close={() => setInstallationToDelete(null)}>
          <>
            <p>{t("features.installations.areYouSureDelete")}</p>
            <p className="text-zinc-300">{t("features.installations.deletingNotReversible")}</p>
            <div className="flex gap-2 items-center justify-center">
              <Input id="delete-data" type="checkbox" checked={deleteData} onChange={(e) => setDeleData(e.target.checked)} />
              <label htmlFor="delete-data">{t("features.installations.deleteData")}</label>
            </div>
            <div className="flex gap-4 items-center justify-center">
              <FormButton title={t("generic.cancel")} className="p-2 text-lg" onClick={() => setInstallationToDelete(null)}>
                <PiXBold />
              </FormButton>
              <FormButton title={t("generic.delete")} className="p-2 text-lg text-red-500" onClick={HandleModDelete}>
                <PiEraserFill />
              </FormButton>
            </div>
          </>
        </PopupDialogPanel>
      </div>
    </ScrollableContainer>
  )
}

export default ListInslallations
