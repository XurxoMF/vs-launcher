import { useState } from "react"
import { Link } from "react-router-dom"
import { Button, Description, Dialog, DialogPanel, DialogTitle, Input } from "@headlessui/react"
import { PiFolderFill, PiPlusCircleFill, PiTrashFill, PiPencilFill } from "react-icons/pi"
import { useTranslation, Trans } from "react-i18next"
import { AnimatePresence, motion } from "motion/react"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

function ListInslallations(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()

  const [installationToDelete, setInstallationToDelete] = useState<InstallationType | null>(null)
  const [deleteData, setDeleData] = useState<boolean>(false)

  return (
    <>
      <h1 className="text-3xl text-center font-bold select-none">{t("features.installations.listTitle")}</h1>

      <div className="mx-auto max-w-[800px] w-full">
        <ul className="w-full flex flex-col">
          {config.installations.length < 1 && (
            <div className="w-full flex flex-col items-center justify-center gap-2 rounded bg-zinc-850 p-4">
              <p className="text-2xl">{t("features.installations.noInstallationsFound")}</p>
              <p className="w-full flex gap-1 items-center justify-center">
                <Trans i18nKey="features.installations.noInstallationsFoundDescOnPage" components={{ button: <PiPlusCircleFill className="text-lg" /> }} />
              </p>
            </div>
          )}
          {config.installations.map((installation) => (
            <li key={installation.id} className={`w-full px-2 py-1 hover:pl-3 hover:pr-1 duration-100 odd:bg-zinc-850 rounded cursor-pointer flex gap-2 justify-between items-center`}>
              <div className="flex flex-col gap-1 overflow-hidden">
                <p>{installation.name}</p>
                <div className="w-full flex gap-2 items-center text-sm text-zinc-500 whitespace-nowrap">
                  <p>{installation.version}</p>
                  <p>{t("features.mods.modsCount", { count: installation.mods.length })}</p>
                  <p className="overflow-hidden text-ellipsis">{installation.path}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/installations/edit/${installation.id}`} className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded">
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
            </li>
          ))}
        </ul>
      </div>

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
