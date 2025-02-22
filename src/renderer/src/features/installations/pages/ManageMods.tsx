import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import { PiArrowClockwiseFill, PiTrashFill } from "react-icons/pi"
import { FiLoader } from "react-icons/fi"

import { useConfigContext } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useCountMods } from "@renderer/features/mods/hooks/useCountMods"

import { ListGroup, ListItem, ListWrapper } from "@renderer/components/ui/List"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import InstallModPopup from "@renderer/features/mods/components/InstallModPopup"
import { NormalButton } from "@renderer/components/ui/Buttons"

function ListMods(): JSX.Element {
  const { t } = useTranslation()
  const { config } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  const countMods = useCountMods()

  const { id } = useParams()

  const [installedMods, setInstalledMods] = useState<InstalledModType[]>([])
  const [insatlledModsWithErrors, setInstalledModsWithErrors] = useState<ErrorInstalledModType[]>([])

  const [modToDelete, setModToDelete] = useState<InstalledModType | ErrorInstalledModType | null>(null)
  const [modToUpdate, setModToUpdate] = useState<number | string | null>(null)

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
                <p className="text-zinc-400 text-center">{t("features.mods.modsWithErrorsDescription")}</p>
                <p className="text-zinc-400 text-center">
                  <Trans
                    i18nKey="features.mods.modsWithErrorsDescriptionReport"
                    components={{
                      issues: (
                        <NormalButton
                          title={t("generic.issues")}
                          onClick={(e) => {
                            e.stopPropagation()
                            window.api.utils.openOnBrowser("https://github.com/XurxoMF/vs-launcher/issues")
                          }}
                          className="text-vsl"
                        >
                          {t("generic.issues")}
                        </NormalButton>
                      ),
                      discord: (
                        <NormalButton
                          title="Discord"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.api.utils.openOnBrowser("https://discord.gg/RtWpYBRRUz")
                          }}
                          className="text-vsl"
                        >
                          Discord
                        </NormalButton>
                      )
                    }}
                  />
                </p>
              </div>
              {insatlledModsWithErrors.map((iModE) => (
                <ListItem key={iModE.zipname}>
                  <div className="flex gap-4 p-2 justify-between items-center whitespace-nowrap bg-red-700/15 duration-200">
                    <div className="shrink-0">
                      <div className="w-16 h-16 bg-zinc-950/50 rounded-sm shadow-sm shadow-zinc-950" />
                    </div>

                    <div className="w-full flex flex-col gap-1 justify-center overflow-hidden">
                      <div className="flex gap-2 items-center">
                        <p>{iModE.zipname}</p>
                      </div>
                    </div>

                    <div className="flex gap-1 justify-end text-lg">
                      <NormalButton
                        className="p-1 flex items-center justify-center"
                        title={t("generic.delete")}
                        onClick={async () => {
                          setModToDelete(iModE)
                        }}
                      >
                        <PiTrashFill />
                      </NormalButton>
                    </div>
                  </div>
                </ListItem>
              ))}
            </ListGroup>
          </ListWrapper>
        )}

        <ListWrapper className="max-w-[800px] w-full">
          {installedMods.length < 1 ? (
            <ListGroup>
              {gettingMods ? (
                <div className="w-full flex flex-col items-center justify-center gap-2 rounded-sm bg-zinc-950/50 p-8">
                  <div className="w-full h-full flex items-center justify-center">
                    <FiLoader className="animate-spin text-4xl text-zinc-400" />
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center gap-2 rounded-sm bg-zinc-950/50 p-4">
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
            </ListGroup>
          ) : (
            <ListGroup>
              {installedMods.map((iMod) => (
                <ListItem key={iMod.modid}>
                  <div className="flex gap-4 p-2 justify-between items-center whitespace-nowrap">
                    <div className="shrink-0">
                      {iMod._image ? (
                        <img src={`cachemodimg:${iMod._image}`} alt={iMod.name} className="w-16 h-16 object-cover rounded-sm" />
                      ) : (
                        <div className="w-16 h-16 bg-zinc-900 rounded-sm shadow-sm shadow-zinc-950" />
                      )}
                    </div>

                    <div className="w-full flex flex-col gap-1 justify-center overflow-hidden">
                      <div className="flex gap-2 items-center">
                        <p>{iMod.name}</p>
                        <p>v{iMod.version}</p>
                      </div>

                      {iMod.description && (
                        <div className="overflow-hidden">
                          <p className="text-sm text-zinc-400 overflow-hidden whitespace-nowrap text-ellipsis">{iMod.description}</p>
                        </div>
                      )}

                      <div className="flex gap-2 items-center text-sm text-zinc-400">
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
                      <NormalButton
                        className="p-1 flex items-center justify-center"
                        title={t("generic.update")}
                        onClick={async () => {
                          if (!iMod._mod || iMod._mod.releases.length < 1) return addNotification(t("features.mods.noVersionsFound"), "error")
                          setModToUpdate(iMod.modid)
                        }}
                      >
                        <PiArrowClockwiseFill />
                      </NormalButton>

                      <NormalButton
                        className="p-1 flex items-center justify-center"
                        title={t("generic.delete")}
                        onClick={async () => {
                          setModToDelete(iMod)
                        }}
                      >
                        <PiTrashFill />
                      </NormalButton>
                    </div>
                  </div>
                </ListItem>
              ))}
            </ListGroup>
          )}
        </ListWrapper>

        {config.installations.some((i) => i.id === id) && modToUpdate !== null && (
          <InstallModPopup installation={config.installations.find((i) => i.id === id) as InstallationType} modToInstall={modToUpdate} setModToInstall={setModToUpdate} />
        )}

        <PopupDialogPanel title={t("features.mods.deleteMod")} isOpen={modToDelete !== null} close={() => setModToDelete(null)}>
          <>
            <p>{t("features.mods.areYouSureDelete")}</p>
            <p className="text-zinc-400">{t("features.mods.deletingNotReversible")}</p>
            <div className="flex gap-4 items-center justify-center">
              <NormalButton
                title={t("generic.cancel")}
                className="px-2 py-1 bg-zinc-800 shadow-sm shadow-zinc-950 hover:shadow-none flex items-center justify-center rounded-sm"
                onClick={() => setModToDelete(null)}
              >
                {t("generic.cancel")}
              </NormalButton>
              <NormalButton
                title={t("generic.delete")}
                className="px-2 py-1 bg-red-800 shadow-sm shadow-zinc-950 hover:shadow-none flex items-center justify-center rounded-sm"
                onClick={DeleteModHandler}
              >
                {t("generic.delete")}
              </NormalButton>
            </div>
          </>
        </PopupDialogPanel>
      </div>
    </ScrollableContainer>
  )
}

export default ListMods
