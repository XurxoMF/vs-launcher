import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button, Description, Dialog, DialogPanel, DialogTitle, Input, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react"
import { PiFolderFill, PiPlusCircleFill, PiTrashFill, PiPencilFill, PiCaretCircleDoubleDownFill, PiArrowCounterClockwiseFill, PiDotsThreeOutlineVerticalFill, PiGearFill } from "react-icons/pi"
import { useTranslation, Trans } from "react-i18next"
import { AnimatePresence, motion } from "motion/react"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useMakeInstallationBackup } from "@renderer/features/installations/hooks/useMakeInstallationBackup"
import { useCountMods } from "@renderer/features/mods/hooks/useCountMods"

import { ListGroup, ListWrapper, Listitem } from "@renderer/components/ui/List"

function ListInslallations(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const countMods = useCountMods()

  const makeInstallationBackup = useMakeInstallationBackup()

  const [installationToDelete, setInstallationToDelete] = useState<InstallationType | null>(null)
  const [deleteData, setDeleData] = useState<boolean>(false)

  // This is here to ensure mods are correctly counted before making any changes to installations.
  // Resume: Prevent using from delting instalaltion with 0 mods bc of a false positive.
  useEffect(() => {
    countMods()
  }, [])

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
              <div className="flex gap-4 px-2 py-1 justify-between items-center whitespace-nowrap">
                <div className="flex gap-2 items-center">
                  <p>{installation.name}</p>
                  <div className="flex gap-2 items-center text-sm text-zinc-500">
                    <p>{installation.version}</p>
                    <p>{t("features.mods.modsCount", { count: installation._modsCount as number })}</p>
                  </div>
                </div>

                <div className="w-full text-sm text-zinc-500  text-center overflow-hidden">
                  <p className="hidden group-hover:block overflow-hidden text-ellipsis">{installation.path}</p>
                </div>

                <div className="flex gap-2 justify-end text-lg">
                  <Button
                    className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    title={t("generic.backup")}
                    onClick={() => makeInstallationBackup(installation.id)}
                  >
                    <PiCaretCircleDoubleDownFill />
                  </Button>
                  <Link
                    to={`/installations/mods/${installation.id}`}
                    title={t("features.mods.manageMods")}
                    className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                  >
                    <PiGearFill />
                  </Link>
                  <Link
                    to={`/installations/edit/${installation.id}`}
                    title={t("generic.edit")}
                    className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                  >
                    <PiPencilFill />
                  </Link>

                  <Menu>
                    <MenuButton className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded">
                      <PiDotsThreeOutlineVerticalFill />
                    </MenuButton>
                    <MenuItems anchor="left" className="flex flex-row-reverse gap-2 p-2">
                      <MenuItem>
                        <Link
                          to={`/installations/backups/${installation.id}`}
                          className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                          title={t("features.backups.restoreBackup")}
                        >
                          <PiArrowCounterClockwiseFill />
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Button
                          className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                          title={t("generic.delete")}
                          onClick={async () => {
                            setInstallationToDelete(installation)
                          }}
                        >
                          <PiTrashFill />
                        </Button>
                      </MenuItem>
                      <MenuItem>
                        <Button
                          onClick={async () => {
                            if (!(await window.api.pathsManager.checkPathExists(installation.path)))
                              return addNotification(t("notifications.titles.error"), t("notifications.body.folderDoesntExists"), "error")
                            window.api.pathsManager.openPathOnFileExplorer(installation.path)
                          }}
                          title={t("generic.openOnFileExplorer")}
                          className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                        >
                          <PiFolderFill />
                        </Button>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
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
            as={motion.div}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            open={installationToDelete !== null}
            onClose={() => setInstallationToDelete(null)}
            className="w-full h-full absolute top-0 left-0 z-[200] flex justify-center items-center backdrop-blur-sm"
          >
            <DialogPanel className="flex flex-col gap-4 text-center bg-zinc-850 rounded p-8 max-w-[600px]">
              <DialogTitle className="text-2xl font-bold">{t("features.installations.deleteInstallation")}</DialogTitle>
              <Description className="flex flex-col gap-2">
                <span>{t("features.installations.areYouSureDelete")}</span>
                <span className="text-zinc-500">{t("features.installations.deletingNotReversible")}</span>
              </Description>
              <div className="flex gap-2 items-center justify-center">
                <Input id="delete-data" type="checkbox" checked={deleteData} onChange={(e) => setDeleData(e.target.checked)} />
                <label htmlFor="delete-data">{t("features.installations.deleteData")}</label>
              </div>
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
                      if (installationToDelete._playing || installationToDelete._backuping || installationToDelete._restoringBackup)
                        return addNotification(t("notifications.titles.error"), t("features.installations.cantDeleteWhileinUse"), "error")

                      if (deleteData) {
                        const wasDeleted = await window.api.pathsManager.deletePath(installationToDelete.path)
                        if (!wasDeleted) throw new Error("Error deleting installation data!")

                        installationToDelete.backups.forEach((backup) => {
                          const wasBackupDeleted = window.api.pathsManager.deletePath(backup.path)
                          if (!wasBackupDeleted) throw new Error("Error deleting installation backup data!")
                        })
                      }

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
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}

export default ListInslallations
