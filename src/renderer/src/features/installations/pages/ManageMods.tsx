/*
! IMPORTANT NOTES

I've made this page in just a few hours. It's not optimiced at all and it'll need a rewrite when I have time.

If you're reading this, don't get examples from this page please xD

Just check out the nested ternary operators on the install/update buttons... for the sake of god,
what am I doing just to release this update!? This makes no sense xD
*/

import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import { Button, Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { PiArrowClockwiseFill, PiTrashFill } from "react-icons/pi"
import { FiLoader } from "react-icons/fi"
import { AnimatePresence, motion } from "motion/react"
import clsx from "clsx"

import { useConfigContext } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

import { useCountMods } from "@renderer/features/mods/hooks/useCountMods"

import { ListGroup, Listitem, ListWrapper } from "@renderer/components/ui/List"
import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"

function ListMods(): JSX.Element {
  const { t } = useTranslation()
  const { config } = useConfigContext()
  const { addNotification } = useNotificationsContext()
  const countMods = useCountMods()
  const { startDownload } = useTaskContext()

  const { id } = useParams()

  const [installedMods, setInstalledMods] = useState<InstalledModType[]>([])
  const [insatlledModsWithErrors, setInstalledModsWithErrors] = useState<ErrorInstalledModType[]>([])
  const [modToDelete, setModToDelete] = useState<InstalledModType | ErrorInstalledModType | null>(null)
  const [modToUpdate, setModToUpdate] = useState<InstalledModType | null>(null)

  const [gettingMods, setGettingMods] = useState<boolean>(false)

  const firstTimeGettingInstallationModsInstallationModsManager = useRef(true)
  useEffect(() => {
    if (!firstTimeGettingInstallationModsInstallationModsManager.current) return
    firstTimeGettingInstallationModsInstallationModsManager.current = false
    ;(async (): Promise<void> => {
      await getMods()
    })()
  }, [])

  async function getMods(): Promise<void> {
    setGettingMods(true)
    const path = await window.api.pathsManager.formatPath([config.installations.find((i) => i.id === id)!.path, "Mods"])
    const mods = await window.api.modsManager.getInstalledMods(path)

    await Promise.all(
      mods.mods.map(async (mod) => {
        try {
          const versions = await queryModVersions(mod.modid)
          mod._versions = versions
        } catch (err) {
          window.api.utils.logMessage("error", `[component] [ManageMods(installations)] Error fetching mod versions: ${err}`)
          mod._versions = undefined
        }
      })
    )

    setInstalledMods(mods.mods)
    setInstalledModsWithErrors(mods.errors)
    setGettingMods(false)
  }

  async function queryModVersions(modid: string): Promise<DownloadableModVersion[] | undefined> {
    try {
      const res = await window.api.netManager.queryURL(`https://mods.vintagestory.at/api/mod/${modid}`)
      const data = await JSON.parse(res)
      return data["mod"]["releases"]
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ManageMods] Error fetching ${modid} mod versions: ${err}`)
      return
    }
  }

  return (
    <>
      <h1 className="text-3xl text-center font-bold select-none">{t("features.mods.manageTitle")}</h1>

      {insatlledModsWithErrors.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <h2 className="text-2xl text-center font-bold select-none">{t("features.mods.listWithErrorsTitle")}</h2>

          <p className="text-zinc-500 text-center select-none">{t("features.mods.modsWithErrorsDescription")}</p>
          <p className="text-zinc-500 text-center select-none">
            <Trans
              i18nKey="features.mods.modsWithErrorsDescriptionReport"
              components={{
                issues: (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.api.utils.openOnBrowser("https://github.com/XurxoMF/vs-launcher/issues")
                    }}
                    className="text-vs"
                  >
                    {t("generic.issues")}
                  </button>
                ),
                discord: (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.api.utils.openOnBrowser("https://discord.gg/RtWpYBRRUz")
                    }}
                    className="text-vs"
                  >
                    Discord
                  </button>
                )
              }}
            />
          </p>

          <ListWrapper className="max-w-[800px] w-full">
            <ListGroup>
              {insatlledModsWithErrors.map((iModE) => (
                <Listitem key={iModE.zipname}>
                  <div className="flex gap-4 p-2 justify-between items-center whitespace-nowrap">
                    <div className="shrink-0">
                      <div className="w-16 h-16 bg-zinc-900 rounded shadow shadow-zinc-900" />
                    </div>

                    <div className="w-full flex flex-col gap-1 justify-center overflow-hidden">
                      <div className="flex gap-2 items-center">
                        <p>{iModE.zipname}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end text-lg">
                      <Button
                        className="w-7 h-7 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
                        title={t("generic.delete")}
                        onClick={async () => {
                          setModToDelete(iModE)
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
        </div>
      )}

      <ListWrapper className="max-w-[800px] w-full">
        <ListGroup>
          {installedMods.length < 1 && (
            <>
              {gettingMods ? (
                <div className="w-full flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <FiLoader className="animate-spin text-4xl text-zinc-500" />
                  </div>
                </div>
              ) : (
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
            </>
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
                    className={clsx("w-7 h-7 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded" /*, checkUpdatable(iMod) ? "bg-green-700" : "bg-zinc-850"*/)}
                    title={t("generic.update")}
                    onClick={async () => {
                      if (!iMod._versions || iMod._versions.length < 1) return addNotification(t("notifications.titles.error"), t("features.mods.noVersionsFound"), "error")
                      setModToUpdate(iMod)
                    }}
                  >
                    <PiArrowClockwiseFill />
                  </Button>

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
        {modToUpdate && (
          <Dialog
            static
            as={motion.div}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            open={modToUpdate !== null}
            onClose={() => {
              setModToUpdate(null)
            }}
            className="w-full h-full absolute top-0 left-0 z-[200] flex justify-center items-center backdrop-blur-sm"
          >
            <DialogPanel className="w-[800px] flex flex-col gap-2 text-center bg-zinc-850 rounded p-8">
              <DialogTitle className="text-2xl font-bold">{t("features.mods.updateMod")}</DialogTitle>
              <Description className="w-full flex flex-col gap-2 text-zinc-500">{t("features.mods.installationPopupDesc", { modName: modToUpdate.name })}</Description>
              <TableWrapper className="max-h-[300px] overflow-y-scroll text-center">
                <TableHead>
                  <TableHeadRow>
                    <TableCell className="w-2/12">{t("generic.version")}</TableCell>
                    <TableCell className="w-3/12">{t("generic.releaseDate")}</TableCell>
                    <TableCell className="w-5/12">{t("generic.versions")}</TableCell>
                    <TableCell className="w-2/12">{t("generic.actions")}</TableCell>
                  </TableHeadRow>
                </TableHead>

                <TableBody className="overflow-x-hidden">
                  {modToUpdate._versions?.map((version) => (
                    <TableBodyRow key={version.releaseid} disabled={version.modversion === modToUpdate.version}>
                      <TableCell className="w-2/12">{version.modversion}</TableCell>
                      <TableCell className="w-3/12">{new Date(version.created).toLocaleDateString("es")}</TableCell>
                      <TableCell className="w-5/12 overflow-hidden whitespace-nowrap text-ellipsis">
                        <input type="text" value={version.tags.join(", ")} readOnly className="w-full bg-transparent outline-none text-center" />
                      </TableCell>
                      <TableCell className="w-2/12 flex gap-2 items-center justify-center">
                        <button
                          disabled={version.modversion === modToUpdate.version}
                          onClick={async (e) => {
                            e.preventDefault()
                            e.stopPropagation()

                            const installation = config.installations.find((i) => i.id === id)

                            if (!installation) return addNotification(t("notifications.titles.error"), t("features.installations.noInstallationSelected"), "error")

                            const installPath = await window.api.pathsManager.formatPath([installation.path, "Mods"])

                            await window.api.pathsManager.deletePath(modToUpdate.path)

                            startDownload(
                              t("features.mods.modTaskName", { name: modToUpdate.name, version: `v${version.modversion}`, installation: installation.name }),
                              t("features.mods.modDownloadDesc", { name: modToUpdate.name, version: `v${version.modversion}`, installation: installation.name }),
                              version.mainfile,
                              installPath,
                              `${version.modidstr}-${version.modversion}`,
                              async (status, path, error) => {
                                if (!status) return window.api.utils.logMessage("error", `[component] [ManageMods(installations)] Error downloading mod: ${error}`)
                                window.api.utils.logMessage("info", `[component] [ManageMods(installations)] Downloaded mod ${version.mainfile} on ${path}`)
                                await getMods()
                                countMods()
                              }
                            )

                            setModToUpdate(null)
                          }}
                          className={clsx(
                            "w-7 h-7 rounded flex items-center justify-center",
                            config.installations.some((i) => i.id === config.lastUsedInstallation) &&
                              version.tags.includes(`v${config.installations.find((i) => i.id === config.lastUsedInstallation)!.version}`)
                              ? "bg-green-700"
                              : version.tags.some((mvt) =>
                                    mvt.startsWith(
                                      `v${config.installations
                                        .find((i) => i.id === config.lastUsedInstallation)!
                                        .version.split(".")
                                        .slice(0, 2)
                                        .join(".")}`
                                    )
                                  )
                                ? "bg-yellow-600"
                                : "bg-red-700"
                          )}
                          title={t("generic.update")}
                        >
                          <PiArrowClockwiseFill />
                        </button>
                      </TableCell>
                    </TableBodyRow>
                  ))}
                </TableBody>
              </TableWrapper>
            </DialogPanel>
          </Dialog>
        )}
      </AnimatePresence>

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

                      await getMods()
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
