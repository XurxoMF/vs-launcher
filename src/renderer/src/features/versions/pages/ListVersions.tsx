import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@headlessui/react"
import { PiFolderFill, PiPlusCircleFill, PiTrashFill, PiMagnifyingGlassFill } from "react-icons/pi"
import { useTranslation } from "react-i18next"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { ListGroup, ListWrapper, ListItem } from "@renderer/components/ui/List"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"

function ListVersions(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()

  const [versionToDelete, setVersionToDelete] = useState<GameVersionType | null>(null)

  async function DeleteVersionHandler(): Promise<void> {
    if (versionToDelete === null) return addNotification(t("features.versions.noVersionSelected"), "error")

    try {
      if (versionToDelete._playing) return addNotification(t("features.versions.deleteWhilePlaying"), "error")

      configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: versionToDelete.version, updates: { _deleting: true } } })
      const deleted = await window.api.pathsManager.deletePath(versionToDelete!.path)
      if (!deleted) throw new Error("Error deleting fame gersion data")
      configDispatch({ type: CONFIG_ACTIONS.DELETE_GAME_VERSION, payload: { version: versionToDelete!.version } })
      addNotification(t("features.versions.versionUninstalledSuccesfully", { version: versionToDelete!.version }), "success")
    } catch (err) {
      configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: versionToDelete.version, updates: { _deleting: false } } })
      addNotification(t("features.versions.versionUninstallationFailed", { version: versionToDelete!.version }), "error")
    } finally {
      setVersionToDelete(null)
    }
  }

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col items-center justify-center">
        <ListWrapper className="max-w-[800px] w-full">
          <ListGroup>
            <div className="flex gap-2">
              <ListItem className="group">
                <Link to="/versions/add" title={t("features.versions.installNewVersion")} className="w-full h-8 flex items-center justify-center rounded-sm">
                  <PiPlusCircleFill className="text-xl text-zinc-400/60 group-hover:scale-95 duration-200" />
                </Link>
              </ListItem>
              <ListItem className="group">
                <Link to="/versions/look-for-a-version" title={t("features.versions.searchForAGameVersion")} className="w-full h-8 flex items-center justify-center rounded-sm">
                  <PiMagnifyingGlassFill className="text-xl text-zinc-400/60 group-hover:scale-95 duration-200" />
                </Link>
              </ListItem>
            </div>
            {config.gameVersions.map((gv) => (
              <ListItem key={gv.version}>
                <div className="w-full h-8 flex gap-4 px-2 py-1 justify-between items-center">
                  <p className="font-bold">{gv.version}</p>
                  <p className="hidden group-hover:block text-sm text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap">{gv.path}</p>
                  <div className="flex gap-1 text-lg">
                    <Button
                      className="p-1 flex items-center justify-center"
                      title={t("generic.delete")}
                      onClick={async () => {
                        setVersionToDelete(gv)
                      }}
                    >
                      <PiTrashFill />
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!(await window.api.pathsManager.checkPathExists(gv.path))) return addNotification(t("notifications.body.folderDoesntExists"), "error")
                        window.api.pathsManager.openPathOnFileExplorer(gv.path)
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

        <PopupDialogPanel title={t("features.versions.uninstallVersion")} isOpen={versionToDelete !== null} close={() => setVersionToDelete(null)}>
          <>
            <p>{t("features.versions.areYouSureUninstall")}</p>
            <p className="text-zinc-400">{t("features.versions.uninstallingNotReversible")}</p>
            <div className="flex gap-4 items-center justify-center">
              <Button
                title={t("generic.cancel")}
                className="px-2 py-1 bg-zinc-800 shadow-sm shadow-zinc-950/50 hover:shadow-none flex items-center justify-center rounded-sm"
                onClick={() => setVersionToDelete(null)}
              >
                {t("generic.cancel")}
              </Button>
              <Button
                title={t("generic.uninstall")}
                className="px-2 py-1 bg-red-800 shadow-sm shadow-zinc-950/50 hover:shadow-none flex items-center justify-center rounded-sm"
                onClick={DeleteVersionHandler}
              >
                {t("generic.uninstall")}
              </Button>
            </div>
          </>
        </PopupDialogPanel>
      </div>
    </ScrollableContainer>
  )
}

export default ListVersions
