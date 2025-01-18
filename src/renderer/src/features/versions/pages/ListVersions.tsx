import { useState } from "react"
import { Link } from "react-router-dom"
import { Button, Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { PiFolderFill, PiPlusCircleFill, PiTrashFill, PiMagnifyingGlassFill } from "react-icons/pi"
import { useTranslation, Trans } from "react-i18next"
import { AnimatePresence, motion } from "motion/react"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

function ListVersions(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()

  const [versionToDelete, setVersionToDelete] = useState<GameVersionType | null>(null)

  return (
    <>
      <h1 className="text-3xl text-center font-bold select-none">{t("features.versions.listTitle")}</h1>

      <div className="mx-auto max-w-[800px] w-full">
        <ul className="w-full flex flex-col">
          {config.gameVersions.length < 1 && (
            <div className="w-full flex flex-col items-center justify-center gap-2 rounded bg-zinc-850 p-4">
              <p className="text-2xl">{t("features.versions.noVersionsFound")}</p>
              <p className="w-full flex gap-1 items-center justify-center">
                <Trans i18nKey="features.versions.noVersionsFoundDescOnPage" components={{ button: <PiPlusCircleFill className="text-lg" /> }} />
              </p>
            </div>
          )}
          {config.gameVersions.map((gv) => (
            <li key={gv.version} className={`w-full px-2 py-1 hover:pl-3 hover:pr-1 duration-100 odd:bg-zinc-850 rounded cursor-pointer group overflow-hidden`}>
              <div className="flex gap-2 justify-between items-center">
                <p>{gv.version}</p>
                <p className="hidden group-hover:block text-sm text-zinc-500 overflow-hidden text-ellipsis whitespace-nowrap">{gv.path}</p>
                <div className="flex gap-2">
                  <Button
                    className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    title={t("generic.delete")}
                    onClick={async () => {
                      setVersionToDelete(gv)
                    }}
                  >
                    <PiTrashFill className="text-lg" />
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!(await window.api.pathsManager.checkPathExists(gv.path))) return addNotification(t("notifications.titles.error"), t("notifications.body.folderDoesntExists"), "error")
                      window.api.pathsManager.openPathOnFileExplorer(gv.path)
                    }}
                    title={t("generic.openOnFileExplorer")}
                    className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                  >
                    <PiFolderFill className="text-lg" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 justify-center items-center">
        <Link to="/versions/add" title={t("generic.add")} className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded">
          <PiPlusCircleFill className="text-lg" />
        </Link>
        <Link
          to="/versions/look-for-a-version"
          title={t("features.versions.searchForAGameVersion")}
          className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
        >
          <PiMagnifyingGlassFill className="text-lg" />
        </Link>
      </div>

      <AnimatePresence>
        {versionToDelete !== null && (
          <Dialog
            static
            open={versionToDelete !== null}
            onClose={() => setVersionToDelete(null)}
            className="w-full h-full absolute top-0 left-0 z-[200] flex justify-center items-center backdrop-blur-sm"
          >
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}>
              <DialogPanel className="flex flex-col gap-4 text-center bg-zinc-850 rounded p-8 max-w-[600px]">
                <DialogTitle className="text-2xl font-bold">{t("features.versions.uninstallVersion")}</DialogTitle>
                <Description className="flex flex-col gap-2">
                  <p>{t("features.versions.areYouSureUninstall")}</p>
                  <p className="text-zinc-500">{t("features.versions.uninstallingNotReversible")}</p>
                </Description>
                <div className="flex gap-4 items-center justify-center">
                  <button
                    title={t("generic.cancel")}
                    className="px-2 py-1 bg-zinc-800 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    onClick={() => setVersionToDelete(null)}
                  >
                    {t("generic.cancel")}
                  </button>
                  <button
                    title={t("generic.uninstall")}
                    className="px-2 py-1 bg-red-800 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    onClick={async () => {
                      try {
                        if (versionToDelete._playing) return addNotification(t("notifications.titles.error"), t("features.versions.deleteWhilePlaying"), "error")

                        configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: versionToDelete.version, updates: { _deleting: true } } })
                        const deleted = await window.api.pathsManager.deletePath(versionToDelete!.path)
                        if (!deleted) throw new Error("Error deleting fame gersion data")
                        configDispatch({ type: CONFIG_ACTIONS.DELETE_GAME_VERSION, payload: { version: versionToDelete!.version } })
                        addNotification(t("notifications.titles.success"), t("features.versions.versionUninstalledSuccesfully", { version: versionToDelete!.version }), "success")
                      } catch (err) {
                        configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: versionToDelete.version, updates: { _deleting: false } } })
                        addNotification(t("notifications.titles.error"), t("features.versions.versionUninstallationFailed", { version: versionToDelete!.version }), "error")
                      } finally {
                        setVersionToDelete(null)
                      }
                    }}
                  >
                    {t("generic.uninstall")}
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

export default ListVersions
