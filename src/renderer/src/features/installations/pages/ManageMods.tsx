import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import { PiArrowClockwiseDuotone, PiTrashDuotone, PiXCircleDuotone } from "react-icons/pi"
import { FiExternalLink, FiLoader } from "react-icons/fi"
import clsx from "clsx"

import { CONFIG_ACTIONS, useConfigContext } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useInstallMod } from "@renderer/features/mods/hooks/useInstallMod"

import { useGetCompleteInstalledMods } from "@renderer/features/mods/hooks/useGetCompleteInstalledMods"

import { ListGroup, ListItem, ListWrapper } from "@renderer/components/ui/List"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import InstallModPopup from "@renderer/features/mods/components/InstallModPopup"
import { LinkButton, NormalButton } from "@renderer/components/ui/Buttons"
import { FormButton } from "@renderer/components/ui/FormComponents"
import { ThinSeparator } from "@renderer/components/ui/ListSeparators"
import { StickyMenuWrapper, StickyMenuGroupWrapper, StickyMenuGroup, StickyMenuBreadcrumbs, GoBackButton, GoToTopButton, ReloadButton } from "@renderer/components/ui/StickyMenu"

function ListMods(): JSX.Element {
  const { t } = useTranslation()
  const { config, configDispatch } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  const getCompleteInstalledMods = useGetCompleteInstalledMods()
  const installMod = useInstallMod()

  const { id } = useParams()

  const installation = config.installations.find((i) => i.id === id)

  const [installedMods, setInstalledMods] = useState<InstalledModType[]>([])
  const [insatlledModsWithErrors, setInstalledModsWithErrors] = useState<ErrorInstalledModType[]>([])

  const [modToDelete, setModToDelete] = useState<InstalledModType | ErrorInstalledModType | null>(null)
  const [modToUpdate, setModToUpdate] = useState<InstalledModType | null>(null)

  const [gettingMods, setGettingMods] = useState<boolean>(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!installation?._updatingMods) triggerGetCompleteInstalledMods()
  }, [installation?._updatingMods])

  async function triggerGetCompleteInstalledMods(): Promise<void> {
    setGettingMods(true)

    if (!installation) return addNotification(t("features.installations.noInstallationSelected"), "error")

    const mods = await getCompleteInstalledMods({
      path: installation.path,
      version: installation.version
    })

    const totalMods = mods.errors.length + mods.mods.length
    configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installation.id, updates: { _modsCount: totalMods } } })

    setInstalledMods(mods.mods)
    setInstalledModsWithErrors(mods.errors)
    setGettingMods(false)
  }

  async function DeleteModHandler(): Promise<void> {
    if (!modToDelete) return addNotification(t("features.mods.noModSelected"), "error")

    if (!installation) return addNotification(t("features.installations.noInstallationFound"), "error")

    if (installation._backuping || installation._restoringBackup) return addNotification(t("features.mods.cantDeleteWhileinUse"), "error")

    try {
      const deleted = await window.api.pathsManager.deletePath(modToDelete.path)
      if (!deleted) throw "There was an error deleting the mod!"

      triggerGetCompleteInstalledMods()

      addNotification(t("features.mods.modSuccessfullyDeleted"), "success")
    } catch (err) {
      addNotification(t("features.mods.errorDeletingMod"), "error")
    }
  }

  async function UpdateModsHandler(): Promise<void> {
    if (!installation) return addNotification(t("features.installations.noInstallationFound"), "error")

    if (installation._backuping || installation._restoringBackup) return addNotification(t("features.mods.cantUpdateWhileinUse"), "error")

    try {
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installation.id, updates: { _updatingMods: true } } })

      const modsToUpdate = installedMods.filter((iMod) => iMod._updatableTo)

      const updated = modsToUpdate.map((modToUpdate) => {
        return new Promise<void>((resolve) => {
          if (!modToUpdate._mod) {
            window.api.utils.logMessage("error", "[front] [ManageInstallationMods] [features/installations/pages/ManageMods.tsx] [UpdateModsHandler] The mod could not be queried from the ModDB API!")
            addNotification(t("features.mods.errorUpdatingMod", { mod: modToUpdate.name }), "error")
            return resolve()
          }

          const release = modToUpdate._mod.releases.find((release) => release.modversion === modToUpdate._updatableTo)

          if (!release) {
            window.api.utils.logMessage(
              "error",
              "[front] [ManageInstallationMods] [features/installations/pages/ManageMods.tsx] [UpdateModsHandler] The mod release could not be found on the queried Mod!"
            )
            addNotification(t("features.mods.errorUpdatingMod", { mod: modToUpdate.name }), "error")
            return resolve()
          }

          installMod({
            path: installation.path,
            mod: modToUpdate._mod,
            release,
            outName: installation.name,
            oldMod: modToUpdate,
            onFinish: () => resolve()
          })
        })
      })

      await Promise.all(updated)
    } catch (err) {
      addNotification(t("features.mods.errorUpdatingMods"), "error")
    } finally {
      addNotification(t("features.mods.modsUpdatedSuccessfully"), "success")
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installation.id, updates: { _updatingMods: false } } })
    }
  }

  return (
    <ScrollableContainer ref={scrollRef}>
      <div className="min-h-full flex flex-col items-center justify-center gap-2">
        <StickyMenuWrapper scrollRef={scrollRef}>
          <StickyMenuGroupWrapper>
            <StickyMenuGroup>
              <GoBackButton to="/installations" />
              <ReloadButton reloading={gettingMods} onClick={() => triggerGetCompleteInstalledMods()} />
            </StickyMenuGroup>

            <StickyMenuBreadcrumbs
              breadcrumbs={[
                { name: t("breadcrumbs.installations"), to: "/installations" },
                { name: t("breadcrumbs.manageMods"), to: installation ? `/installations/mods/${installation.id}` : "/installations" }
              ]}
            />

            <StickyMenuGroup>
              <GoToTopButton scrollRef={scrollRef} />
            </StickyMenuGroup>
          </StickyMenuGroupWrapper>

          {installation && (
            <StickyMenuGroupWrapper type="centered">
              <StickyMenuGroup>
                <FormButton title={t("features.mods.updateAll")} className="p-1 w-fit h-8" onClick={UpdateModsHandler}>
                  <PiArrowClockwiseDuotone className="text-xl" />
                  <p>{t("features.mods.updateAllButton")}</p>
                </FormButton>
              </StickyMenuGroup>
            </StickyMenuGroupWrapper>
          )}
        </StickyMenuWrapper>

        <div className="max-w-[50rem] w-full flex flex-col items-center justify-center gap-2 m-auto">
          {!installation ? (
            <ListWrapper className="w-full">
              <ListGroup>
                <div className="w-full flex flex-col items-center justify-center gap-2 rounded-sm p-4">
                  <p className="text-2xl">{t("features.installations.noInstallationFound")}</p>
                  <p className="w-full flex gap-1 items-center justify-center">{t("features.installations.noInstallationFoundDesc")}</p>
                </div>
              </ListGroup>
            </ListWrapper>
          ) : (
            <>
              {installation._updatingMods ? (
                <ListWrapper className="w-full">
                  <ListGroup>
                    <div className="w-full flex flex-col items-center justify-center gap-2 rounded-sm p-4">
                      <p className="text-2xl">{t("features.mods.updatingInstalledMods")}</p>
                      <FiLoader className="animate-spin text-4xl text-zinc-400" />
                    </div>
                  </ListGroup>
                </ListWrapper>
              ) : (
                <>
                  {installedMods.length < 1 && insatlledModsWithErrors.length < 1 && (
                    <ListWrapper className="w-full">
                      <ListGroup>
                        {gettingMods ? (
                          <div className="w-full flex flex-col items-center justify-center gap-2 rounded-sm p-4">
                            <FiLoader className="animate-spin text-4xl text-zinc-400" />
                          </div>
                        ) : (
                          <div className="w-full flex flex-col items-center justify-center gap-2 rounded-sm p-4">
                            <p className="text-2xl">{t("features.mods.noModsFound")}</p>
                            <p className="w-full flex gap-1 items-center justify-center">
                              <Trans
                                i18nKey="features.mods.noModsInstalled"
                                components={{
                                  link: (
                                    <LinkButton title={t("components.mainMenu.modsTitle")} to="/mods" className="text-vsl">
                                      {t("components.mainMenu.modsTitle")}
                                    </LinkButton>
                                  )
                                }}
                              />
                            </p>
                          </div>
                        )}
                      </ListGroup>
                    </ListWrapper>
                  )}

                  {insatlledModsWithErrors.length > 0 && (
                    <ListWrapper className="w-full">
                      <ListGroup>
                        <div className="flex flex-col gap-1">
                          <h2 className="text-2xl text-center font-bold">{t("features.mods.listWithErrorsTitle")}</h2>
                          <p className="text-zinc-400 text-center">{t("features.mods.modsWithErrorsDescription")}</p>
                          <p className="text-zinc-400 text-center text-xs italic flex gap-1 items-center justify-center">
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
                          <ListItem key={iModE.zipname + iModE.zipname}>
                            <div className="flex gap-4 p-2 justify-between items-center whitespace-nowrap bg-red-700/15">
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
                                  className="p-1"
                                  title={t("generic.delete")}
                                  onClick={async () => {
                                    setModToDelete(iModE)
                                  }}
                                >
                                  <PiTrashDuotone />
                                </NormalButton>
                              </div>
                            </div>
                          </ListItem>
                        ))}
                      </ListGroup>
                    </ListWrapper>
                  )}

                  {installedMods.filter((iMod) => iMod._updatableTo).length > 0 && (
                    <ListWrapper className="w-full">
                      <ListGroup>
                        <div className="flex flex-col gap-1">
                          <h2 className="text-2xl text-center font-bold">{t("features.mods.listWithUpdatesTitle")}</h2>
                          <p className="text-zinc-400 text-center">{t("features.mods.modsWithUpdatesDescription")}</p>
                          <p className="text-zinc-400 text-center text-xs italic flex gap-1 items-center justify-center">
                            <Trans
                              i18nKey="features.mods.modsWithUpdatesDescriptionReport"
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
                        {installedMods
                          .filter((iMod) => iMod._updatableTo)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((iMod) => (
                            <InstalledModItem
                              key={iMod.modid + iMod.path}
                              iMod={iMod}
                              onDeleteClick={() => setModToDelete(iMod)}
                              onUpdateClick={() => {
                                setModToUpdate(iMod)
                              }}
                            />
                          ))}
                      </ListGroup>
                    </ListWrapper>
                  )}

                  {installedMods.filter((iMod) => !iMod._updatableTo && iMod._lastVersion).length > 0 && (
                    <ListWrapper className="w-full">
                      <ListGroup>
                        <div className="flex flex-col gap-1">
                          <h2 className="text-2xl text-center font-bold">{t("features.mods.listWithIncompatibleUpdatesTitle")}</h2>
                          <p className="text-zinc-400 text-center">{t("features.mods.modsWithIncompatibleUpdatesDescription")}</p>
                          <p className="text-zinc-400 text-center text-xs italic flex gap-1 items-center justify-center">
                            <Trans
                              i18nKey="features.mods.modsWithUpdatesDescriptionReport"
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
                        {installedMods
                          .filter((iMod) => !iMod._updatableTo && iMod._lastVersion)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((iMod) => (
                            <InstalledModItem
                              key={iMod.modid + iMod.path}
                              iMod={iMod}
                              onDeleteClick={() => setModToDelete(iMod)}
                              onUpdateClick={() => {
                                setModToUpdate(iMod)
                              }}
                            />
                          ))}
                      </ListGroup>
                    </ListWrapper>
                  )}

                  {installedMods.filter((iMod) => !iMod._updatableTo && !iMod._lastVersion).length > 0 && (
                    <ListWrapper className="w-full">
                      <ListGroup>
                        {installedMods
                          .filter((iMod) => !iMod._updatableTo && !iMod._lastVersion)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((iMod) => (
                            <InstalledModItem key={iMod.modid + iMod.path} iMod={iMod} onDeleteClick={() => setModToDelete(iMod)} onUpdateClick={() => setModToUpdate(iMod)} />
                          ))}
                      </ListGroup>
                    </ListWrapper>
                  )}

                  <InstallModPopup
                    modToInstall={modToUpdate?.modid || null}
                    setModToInstall={() => setModToUpdate(null)}
                    installation={{
                      installation: installation,
                      oldMod: installedMods.find((iMod) => iMod.modid === modToUpdate?.modid)
                    }}
                    onFinishInstallation={() => {
                      triggerGetCompleteInstalledMods()
                    }}
                  />

                  <PopupDialogPanel title={t("features.mods.deleteMod")} isOpen={modToDelete !== null} close={() => setModToDelete(null)}>
                    <>
                      <p>{t("features.mods.areYouSureDelete")}</p>
                      <p className="text-zinc-400">{t("features.mods.deletingNotReversible")}</p>
                      <div className="flex gap-4 items-center justify-center text-lg">
                        <FormButton title={t("generic.cancel")} className="p-2" onClick={() => setModToDelete(null)} type="success">
                          <PiXCircleDuotone />
                        </FormButton>
                        <FormButton title={t("generic.delete")} className="p-2" onClick={DeleteModHandler} type="error">
                          <PiTrashDuotone />
                        </FormButton>
                      </div>
                    </>
                  </PopupDialogPanel>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </ScrollableContainer>
  )
}

function InstalledModItem({ iMod, onDeleteClick, onUpdateClick }: { iMod: InstalledModType; onDeleteClick: () => void; onUpdateClick: () => void }): JSX.Element {
  const { t } = useTranslation()

  return (
    <ListItem key={iMod.modid + iMod.path}>
      <div className={clsx("h-20 flex gap-4 p-2 justify-between items-center whitespace-nowrap", iMod._updatableTo ? "bg-lime-600/25" : iMod._lastVersion && "bg-yellow-400/25")}>
        <div className="shrink-0">
          {iMod._image ? (
            <img src={`cachemodimg:${iMod._image}`} alt={iMod.name} className="w-16 h-16 object-cover rounded-sm" />
          ) : (
            <div className="w-16 h-16 bg-zinc-900 rounded-sm shadow-sm shadow-zinc-950" />
          )}
        </div>

        <ThinSeparator />

        <div className="w-full flex flex-col gap-1 justify-center overflow-hidden">
          <div className="flex gap-2 items-center">
            <p className="font-bold">{iMod.name}</p>
            <span>·</span>
            <p>v{iMod.version}</p>
          </div>

          {iMod.description && (
            <div className="overflow-hidden">
              <p className="text-sm text-zinc-400 overflow-hidden whitespace-nowrap text-ellipsis">{iMod.description}</p>
            </div>
          )}

          <div className="flex gap-2 items-center text-sm text-zinc-400">
            {iMod.authors && iMod.authors?.length > 0 && (
              <p className="shrink-0 overflow-hidden whitespace-nowrap text-ellipsis">
                {t("generic.authors")}: {iMod.authors?.join(", ")}
              </p>
            )}

            {iMod.authors && iMod.contributors && iMod.authors?.length > 0 && iMod.contributors?.length > 0 && <span>·</span>}

            {iMod.contributors && iMod.contributors?.length > 0 && (
              <p className="overflow-hidden whitespace-nowrap text-ellipsis">
                {t("generic.contributors")}: {iMod.contributors?.join(", ")}
              </p>
            )}
          </div>
        </div>

        <ThinSeparator />

        <div className="flex gap-1 justify-end text-lg">
          <NormalButton
            className="p-1"
            title={t("generic.update")}
            onClick={async () => {
              onUpdateClick()
            }}
          >
            <PiArrowClockwiseDuotone />
          </NormalButton>

          <NormalButton
            className="p-1"
            title={t("features.mods.openOnTheModDB")}
            onClick={(e) => {
              e.stopPropagation()
              window.api.utils.openOnBrowser(`https://mods.vintagestory.at/show/mod/${iMod._mod?.assetid}`)
            }}
          >
            <FiExternalLink />
          </NormalButton>

          <NormalButton
            className="p-1"
            title={t("generic.delete")}
            onClick={async () => {
              onDeleteClick()
            }}
          >
            <PiTrashDuotone />
          </NormalButton>
        </div>
      </div>
    </ListItem>
  )
}

export default ListMods
