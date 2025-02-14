import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import { Button, Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { PiTrashFill } from "react-icons/pi"

import { useConfigContext } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { ListGroup, Listitem, ListWrapper } from "@renderer/components/ui/List"
import { AnimatePresence, motion } from "motion/react"
import { useCountMods } from "@renderer/features/mods/hooks/useCountMods"

function ListMods(): JSX.Element {
  const { t } = useTranslation()
  const { config } = useConfigContext()
  const { addNotification } = useNotificationsContext()
  const countMods = useCountMods()

  const { id } = useParams()

  const [installedMods, setInstalledMods] = useState<InstalledModType[]>([])
  const [modToDelete, setModToDelete] = useState<InstalledModType | null>(null)

  const sirstTimeGettingInstallationModsInstallationModsManager = useRef(true)
  useEffect(() => {
    if (!sirstTimeGettingInstallationModsInstallationModsManager.current) return
    sirstTimeGettingInstallationModsInstallationModsManager.current = false
    ;(async (): Promise<void> => {
      const mods = await getMods()
      setInstalledMods(mods)
    })()
  }, [])

  async function getMods(): Promise<InstalledModType[]> {
    const path = await window.api.pathsManager.formatPath([config.installations.find((i) => i.id === id)!.path, "Mods"])
    const mods = await window.api.modsManager.getInstalledMods(path)
    return mods
  }

  return (
    <>
      <h1 className="text-3xl text-center font-bold select-none">{t("features.mods.listTitle")}</h1>

      <ListWrapper className="max-w-[800px] w-full">
        <ListGroup>
          {installedMods.length < 1 && (
            <div className="w-full flex flex-col items-center justify-center gap-2 rounded bg-zinc-850 p-4">
              <p className="text-2xl">{t("features.mods.noModsFound")}</p>
              <p className="w-full flex gap-1 items-center justify-center">
                <Trans
                  i18nKey="features.mods.noModsInstalled"
                  components={{
                    link: (
                      <Link to="/mods" className="text-vs">
                        {t("components.mainMenu.modsTitle")}
                      </Link>
                    )
                  }}
                />
              </p>
            </div>
          )}
          {installedMods.map((iMod) => (
            <Listitem key={iMod.modid}>
              <div className="flex gap-4 p-2 justify-between items-center whitespace-nowrap">
                <div className="shrink-0">
                  {iMod._image ? (
                    <img src={`cachemodimg:${iMod._image}`} alt={iMod.name} className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-zinc-900 rounded shadow shadow-zinc-900" />
                  )}
                </div>

                <div className="w-full flex flex-col gap-1 justify-center overflow-hidden">
                  <div className="flex gap-2 items-center">
                    <p>{iMod.name}</p>
                    <p>v{iMod.version}</p>
                  </div>
                  <div className="flex gap-2 items-center text-sm text-zinc-500">{iMod.description && <p>{iMod.description}</p>}</div>
                  <div className="flex gap-2 items-center text-sm text-zinc-500">
                    {iMod.authors && iMod.authors?.length > 0 && (
                      <p>
                        {t("generic.authors")}: {iMod.authors?.join(", ")}
                      </p>
                    )}
                    {iMod.contributors && iMod.contributors?.length > 0 && (
                      <p className="overflow-hidden whitespace-nowrap text-ellipsis">
                        {t("generic.contributors")}: {iMod.contributors?.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 justify-end text-lg">
                  <Button
                    className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                    title={t("generic.delete")}
                    onClick={async () => {
                      setModToDelete(iMod)
                    }}
                  >
                    <PiTrashFill />
                  </Button>
                </div>
              </div>
            </Listitem>
          ))}
        </ListGroup>
      </ListWrapper>

      <AnimatePresence>
        {modToDelete !== null && (
          <Dialog
            static
            as={motion.div}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            open={modToDelete !== null}
            onClose={() => setModToDelete(null)}
            className="w-full h-full absolute top-0 left-0 z-[200] flex justify-center items-center backdrop-blur-sm"
          >
            <DialogPanel className="flex flex-col gap-4 text-center bg-zinc-850 rounded p-8 max-w-[600px]">
              <DialogTitle className="text-2xl font-bold">{t("features.mods.deleteMod")}</DialogTitle>
              <Description className="flex flex-col gap-2">
                <span>{t("features.mods.areYouSureDelete")}</span>
                <span className="text-zinc-500">{t("features.mods.deletingNotReversible")}</span>
              </Description>
              <div className="flex gap-4 items-center justify-center">
                <button
                  title={t("generic.cancel")}
                  className="px-2 py-1 bg-zinc-800 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                  onClick={() => setModToDelete(null)}
                >
                  {t("generic.cancel")}
                </button>
                <button
                  title={t("generic.delete")}
                  className="px-2 py-1 bg-red-800 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                  onClick={async () => {
                    try {
                      const installation = config.installations.find((i) => i.id === id)

                      if (!installation) return addNotification(t("notifications.titles.error"), t("features.installations.noInstallationFound"), "error")

                      if (installation._playing || installation._backuping || installation._restoringBackup)
                        return addNotification(t("notifications.titles.error"), t("features.mods.cantDeleteWhileinUse"), "error")

                      const deleted = await window.api.pathsManager.deletePath(modToDelete.path)
                      if (!deleted) throw "There was an error deleting the mod!"

                      setInstalledMods(await getMods())
                      countMods()

                      addNotification(t("notifications.titles.success"), t("features.mods.modSuccessfullyDeleted"), "success")
                    } catch (err) {
                      addNotification(t("notifications.titles.error"), t("features.mods.errorDeletingMod"), "error")
                    } finally {
                      setModToDelete(null)
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

export default ListMods
