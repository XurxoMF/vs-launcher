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
import { Button } from "@headlessui/react"
import { PiArrowClockwiseFill, PiTrashFill } from "react-icons/pi"
import { FiLoader } from "react-icons/fi"
import clsx from "clsx"

import { useConfigContext } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useCountMods } from "@renderer/features/mods/hooks/useCountMods"
import { useInstallMod } from "@renderer/features/mods/hooks/useInstallMod"

import { ListGroup, ListItem, ListWrapper } from "@renderer/components/ui/List"
import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"

function ListMods(): JSX.Element {
  const { t } = useTranslation()
  const { config } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  const countMods = useCountMods()
  const installMod = useInstallMod()

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
          const versions = await queryMod(mod.modid)
          mod._mod = versions
        } catch (err) {
          window.api.utils.logMessage("error", `[component] [ManageMods(installations)] Error fetching mod versions: ${err}`)
          mod._mod = undefined
        }
      })
    )

    setInstalledModsWithErrors(mods.errors)
    setInstalledMods(mods.mods)
    setGettingMods(false)
  }

  async function queryMod(modid: string): Promise<DownloadableMod | undefined> {
    try {
      const res = await window.api.netManager.queryURL(`https://mods.vintagestory.at/api/mod/${modid}`)
      const data = await JSON.parse(res)
      return data["mod"]
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ManageMods] Error fetching ${modid} mod versions: ${err}`)
      return
    }
  }

  async function DeleteModHandler(): Promise<void> {
    try {
      if (!modToDelete) return addNotification(t("features.mods.noModSelected"), "error")

      const installation = config.installations.find((i) => i.id === id)

      if (!installation) return addNotification(t("features.installations.noInstallationFound"), "error")

      if (installation._playing || installation._backuping || installation._restoringBackup) return addNotification(t("features.mods.cantDeleteWhileinUse"), "error")

      const deleted = await window.api.pathsManager.deletePath(modToDelete.path)
      if (!deleted) throw "There was an error deleting the mod!"

      await getMods()
      countMods()

      addNotification(t("features.mods.modSuccessfullyDeleted"), "success")
    } catch (err) {
      addNotification(t("features.mods.errorDeletingMod"), "error")
    } finally {
      setModToDelete(null)
    }
  }

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-6">
        <h1 className="text-3xl text-center font-bold">{t("features.mods.manageTitle")}</h1>

        {insatlledModsWithErrors.length > 0 && (
          <ListWrapper className="max-w-[800px] w-full">
            <ListGroup>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl text-center font-bold">{t("features.mods.listWithErrorsTitle")}</h2>
                <p className="text-zinc-300 text-center">{t("features.mods.modsWithErrorsDescription")}</p>
                <p className="text-zinc-300 text-center">
                  <Trans
                    i18nKey="features.mods.modsWithErrorsDescriptionReport"
                    components={{
                      issues: (
                        <Button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            window.api.utils.openOnBrowser("https://github.com/XurxoMF/vs-launcher/issues")
                          }}
                          className="text-vsl"
                        >
                          {t("generic.issues")}
                        </Button>
                      ),
                      discord: (
                        <Button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            window.api.utils.openOnBrowser("https://discord.gg/RtWpYBRRUz")
                          }}
                          className="text-vsl"
                        >
                          Discord
                        </Button>
                      )
                    }}
                  />
                </p>
              </div>
              {insatlledModsWithErrors.map((iModE) => (
                <ListItem key={iModE.zipname}>
                  <div className="flex gap-4 p-2 justify-between items-center whitespace-nowrap bg-red-700/15 duration-200">
                    <div className="shrink-0">
                      <div className="w-16 h-16 bg-zinc-950/50 rounded shadow shadow-zinc-950" />
                    </div>

                    <div className="w-full flex flex-col gap-1 justify-center overflow-hidden">
                      <div className="flex gap-2 items-center">
                        <p>{iModE.zipname}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end text-lg">
                      <Button
                        className="p-1 flex items-center justify-center"
                        title={t("generic.delete")}
                        onClick={async () => {
                          setModToDelete(iModE)
                        }}
                      >
                        <PiTrashFill />
                      </Button>
                    </div>
                  </div>
                </ListItem>
              ))}
            </ListGroup>
          </ListWrapper>
        )}

        <ListWrapper className="max-w-[800px] w-full">
          {installedMods.length < 1 ? (
            <>
              {gettingMods ? (
                <div className="w-full flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <FiLoader className="animate-spin text-4xl text-zinc-300" />
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center gap-2 rounded bg-zinc-950/50 p-4">
                  <p className="text-2xl">{t("features.mods.noModsFound")}</p>
                  <p className="w-full flex gap-1 items-center justify-center">
                    <Trans
                      i18nKey="features.mods.noModsInstalled"
                      components={{
                        link: (
                          <Link to="/mods" className="text-vsl">
                            {t("components.mainMenu.modsTitle")}
                          </Link>
                        )
                      }}
                    />
                  </p>
                </div>
              )}
            </>
          ) : (
            <ListGroup>
              {installedMods.map((iMod) => (
                <ListItem key={iMod.modid}>
                  <div className="flex gap-4 p-2 justify-between items-center whitespace-nowrap">
                    <div className="shrink-0">
                      {iMod._image ? (
                        <img src={`cachemodimg:${iMod._image}`} alt={iMod.name} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-zinc-900 rounded shadow shadow-zinc-950" />
                      )}
                    </div>

                    <div className="w-full flex flex-col gap-1 justify-center overflow-hidden">
                      <div className="flex gap-2 items-center">
                        <p>{iMod.name}</p>
                        <p>v{iMod.version}</p>
                      </div>

                      {iMod.description && (
                        <div className="overflow-hidden">
                          <p className="text-sm text-zinc-300 overflow-hidden whitespace-nowrap text-ellipsis">{iMod.description}</p>
                        </div>
                      )}

                      <div className="flex gap-2 items-center text-sm text-zinc-300">
                        <p className="overflow-hidden whitespace-nowrap text-ellipsis">
                          {iMod.authors && iMod.authors?.length > 0 && (
                            <span>
                              {t("generic.authors")}: {iMod.authors?.join(", ")}
                            </span>
                          )}
                          {iMod.contributors && iMod.contributors?.length > 0 && (
                            <span>
                              {t("generic.contributors")}: {iMod.contributors?.join(", ")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 justify-end text-lg">
                      <Button
                        className="p-1 flex items-center justify-center"
                        title={t("generic.update")}
                        onClick={async () => {
                          if (!iMod._mod || iMod._mod.releases.length < 1) return addNotification(t("features.mods.noVersionsFound"), "error")
                          setModToUpdate(iMod)
                        }}
                      >
                        <PiArrowClockwiseFill />
                      </Button>

                      <Button
                        className="p-1 flex items-center justify-center"
                        title={t("generic.delete")}
                        onClick={async () => {
                          setModToDelete(iMod)
                        }}
                      >
                        <PiTrashFill />
                      </Button>
                    </div>
                  </div>
                </ListItem>
              ))}
            </ListGroup>
          )}
        </ListWrapper>

        <PopupDialogPanel title={t("features.mods.updateMod")} isOpen={modToUpdate !== null} close={() => setModToUpdate(null)} maxWidth={false}>
          <>
            {modToUpdate && (
              <>
                <p>{t("features.mods.installationPopupDesc", { modName: modToUpdate.name })}</p>
                <TableWrapper className="w-[800px]">
                  <TableHead>
                    <TableHeadRow>
                      <TableCell className="w-2/12">{t("generic.version")}</TableCell>
                      <TableCell className="w-3/12">{t("generic.releaseDate")}</TableCell>
                      <TableCell className="w-5/12">{t("generic.versions")}</TableCell>
                      <TableCell className="w-2/12">{t("generic.actions")}</TableCell>
                    </TableHeadRow>
                  </TableHead>

                  <TableBody className="max-h-[300px]">
                    {modToUpdate._mod &&
                      modToUpdate._mod.releases.map((release) => (
                        <TableBodyRow key={release.releaseid} disabled={release.modversion === modToUpdate.version}>
                          <TableCell className="w-2/12">{release.modversion}</TableCell>
                          <TableCell className="w-3/12">{new Date(release.created).toLocaleDateString("es")}</TableCell>
                          <TableCell className="w-5/12 overflow-hidden whitespace-nowrap text-ellipsis">
                            <input type="text" value={release.tags.join(", ")} readOnly className="w-full bg-transparent outline-none text-center" />
                          </TableCell>
                          <TableCell className="w-2/12 flex gap-2 items-center justify-center">
                            <Button
                              disabled={release.modversion === modToUpdate.version}
                              onClick={() => {
                                installMod(
                                  config.installations.find((i) => i.id === id),
                                  modToUpdate._mod,
                                  release,
                                  modToUpdate,
                                  () => getMods()
                                )
                                setModToUpdate(null)
                              }}
                              className={clsx(
                                "w-7 h-7 rounded flex items-center justify-center",
                                config.installations.some((i) => i.id === config.lastUsedInstallation) &&
                                  release.tags.includes(`v${config.installations.find((i) => i.id === config.lastUsedInstallation)!.version}`)
                                  ? "bg-green-700"
                                  : release.tags.some((mvt) =>
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
                            </Button>
                          </TableCell>
                        </TableBodyRow>
                      ))}
                  </TableBody>
                </TableWrapper>
              </>
            )}
          </>
        </PopupDialogPanel>

        <PopupDialogPanel title={t("features.mods.deleteMod")} isOpen={modToDelete !== null} close={() => setModToDelete(null)}>
          <>
            <p>{t("features.mods.areYouSureDelete")}</p>
            <p className="text-zinc-300">{t("features.mods.deletingNotReversible")}</p>
            <div className="flex gap-4 items-center justify-center">
              <Button
                title={t("generic.cancel")}
                className="px-2 py-1 bg-zinc-800 shadow shadow-zinc-950 hover:shadow-none flex items-center justify-center rounded"
                onClick={() => setModToDelete(null)}
              >
                {t("generic.cancel")}
              </Button>
              <Button title={t("generic.delete")} className="px-2 py-1 bg-red-800 shadow shadow-zinc-950 hover:shadow-none flex items-center justify-center rounded" onClick={DeleteModHandler}>
                {t("generic.delete")}
              </Button>
            </div>
          </>
        </PopupDialogPanel>
      </div>
    </ScrollableContainer>
  )
}

export default ListMods
