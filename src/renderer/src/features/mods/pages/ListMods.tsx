import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { PiDownloadDuotone, PiStarDuotone, PiChatCenteredTextDuotone, PiEraserDuotone, PiUserCircleDuotone } from "react-icons/pi"
import { FiExternalLink } from "react-icons/fi"
import clsx from "clsx"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useQueryMods } from "@renderer/features/mods/hooks/useQueryMods"
import { useGetInstalledMods } from "@renderer/features/mods/hooks/useGetInstalledMods"

import { FormButton, FormInputText } from "@renderer/components/ui/FormComponents"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import { GridGroup, GridItem, GridWrapper } from "@renderer/components/ui/Grid"
import InstallModPopup from "@renderer/features/mods/components/InstallModPopup"
import { StickyMenuWrapper, StickyMenuGroupWrapper, StickyMenuGroup, StickyMenuBreadcrumbs, GoBackButton, ReloadButton, GoToTopButton } from "@renderer/components/ui/StickyMenu"
import { ThinSeparator } from "@renderer/components/ui/ListSeparators"
import AuthorFilter from "@renderer/features/mods/components/AuthorFilter"
import VersionsFilter from "@renderer/features/mods/components/VersionsFilter"
import TagsFilter from "@renderer/features/mods/components/TagsFilter"
import SideFilter from "@renderer/features/mods/components/SideFilter"
import OrderFilter from "@renderer/features/mods/components/OrderFilter"
import InstalledFilter from "@renderer/features/mods/components/InstalledFilter"

function ListMods(): JSX.Element {
  const { t } = useTranslation()
  const { config, configDispatch } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  const DEFAULT_LOADED_MODS = 45

  const queryMods = useQueryMods()
  const getInstalledMods = useGetInstalledMods()

  const [modsList, setModsList] = useState<DownloadableModOnListType[]>([])
  const [visibleMods, setVisibleMods] = useState<number>(DEFAULT_LOADED_MODS)

  const [installation, setInstallation] = useState<InstallationType | undefined>(undefined)

  const [installationInstalledMods, setInstallationInstalledMods] = useState<InstalledModType[] | null>([])

  const [onlyFav, setOnlyFav] = useState<boolean>(false)
  const [textFilter, setTextFilter] = useState<string>("")
  const [authorFilter, setAuthorFilter] = useState<DownloadableModAuthorType>({ userid: "", name: "" })
  const [versionsFilter, setVersionsFilter] = useState<DownloadableModGameVersionType[]>([])
  const [tagsFilter, setTagsFilter] = useState<DownloadableModTagType[]>([])
  const [sideFilter, setSideFilter] = useState<string>("any")
  const [installedFilter, setInstalledFilter] = useState<string>("all")
  const [orderBy, setOrderBy] = useState<string>("follows")
  const [orderByOrder, setOrderByOrder] = useState<string>("desc")

  const [searching, setSearching] = useState<boolean>(true)

  const [modToInstall, setModToInstall] = useState<DownloadableModOnListType | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const handleScroll = (): void => {
    if (!scrollRef.current) return
    const { scrollTop, clientHeight, scrollHeight } = scrollRef.current
    if (scrollTop + clientHeight >= scrollHeight - (clientHeight / 2 + 100)) setVisibleMods((prev) => prev + 10)
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.addEventListener("scroll", handleScroll)

    return (): void => {
      if (scrollRef.current) scrollRef.current.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      await triggerQueryMods()
      timeoutRef.current = null
    }, 400)

    return (): void => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [installationInstalledMods, textFilter, authorFilter, versionsFilter, tagsFilter, sideFilter, installedFilter, onlyFav, orderBy, orderByOrder])

  useEffect(() => {
    setInstallation(config.installations.find((i) => i.id === config.lastUsedInstallation))
  }, [config.lastUsedInstallation])

  useEffect(() => {
    if (!installation) return setInstallationInstalledMods([])
    triggerGetInstalledMods()
  }, [installation])

  async function triggerQueryMods(): Promise<void> {
    // If the installed mods are not loaded yet, skip, it'll be run again when the mods are loaded
    if (installationInstalledMods === null) {
      window.api.utils.logMessage("info", "[front] [mods] [features/mods/pages/ListMods.tsx] [triggerQueryMods] Installed mods not loaded yet, skipping query")
      return
    }

    window.api.utils.logMessage("info", "[front] [mods] [features/mods/pages/ListMods.tsx] [triggerQueryMods] Installed mods loaded, querying mods")

    setSearching(true)

    let mods = await queryMods({
      textFilter,
      authorFilter,
      versionsFilter,
      tagsFilter,
      orderBy,
      orderByOrder,
      onFinish: () => {
        scrollRef.current?.scrollTo({ top: 0 })
        setVisibleMods(DEFAULT_LOADED_MODS)
      }
    })

    mods = mods.map((mod) => {
      mod._installed = installationInstalledMods.some((iMod) => mod.modidstrs.some((modidstr) => modidstr === iMod.modid))
      return mod
    })

    if (sideFilter !== "any") mods = mods.filter((mod) => mod.side === sideFilter)

    if (installedFilter === "installed") mods = mods.filter((mod) => mod._installed)
    if (installedFilter === "not-installed") mods = mods.filter((mod) => !mod._installed)

    if (onlyFav) mods = mods.filter((mod) => config.favMods.some((fm) => fm === mod.modid))

    setModsList(mods)
    setSearching(false)
  }

  async function triggerGetInstalledMods(): Promise<void> {
    if (!installation) return addNotification(t("features.installations.noInstallationSelected"), "error")

    const mods = await getInstalledMods({
      path: installation.path
    })

    // Set the installed mods count for the selected Installation. We had to get the mods anyway so... 2x1
    const totalMods = mods.errors.length + mods.mods.length
    configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installation.id, updates: { _modsCount: totalMods } } })

    setInstallationInstalledMods(mods.mods)
  }

  function clearFilters(): void {
    setTextFilter("")
    setAuthorFilter({ userid: "", name: "" })
    setVersionsFilter([])
  }

  return (
    <ScrollableContainer ref={scrollRef}>
      <div className="w-full min-h-[101%] flex flex-col justify-center gap-2">
        <StickyMenuWrapper scrollRef={scrollRef}>
          <StickyMenuGroupWrapper>
            <StickyMenuGroup>
              <GoBackButton to="/" />

              <ReloadButton
                onClick={() => {
                  if (!searching) triggerQueryMods()
                }}
                reloading={searching}
              />
            </StickyMenuGroup>

            <StickyMenuBreadcrumbs breadcrumbs={[{ name: t("breadcrumbs.mods"), to: "/mods" }]} />

            <StickyMenuGroup>
              <GoToTopButton scrollRef={scrollRef} />
            </StickyMenuGroup>
          </StickyMenuGroupWrapper>

          <StickyMenuGroupWrapper type="centered">
            <StickyMenuGroup>
              <FormInputText placeholder={t("generic.text")} value={textFilter} onChange={(e) => setTextFilter(e.target.value)} className="w-40 h-8" />

              <AuthorFilter authorFilter={authorFilter} setAuthorFilter={setAuthorFilter} size="w-40 h-8" />

              <VersionsFilter versionsFilter={versionsFilter} setVersionsFilter={setVersionsFilter} size="w-40 h-8" />

              <TagsFilter tagsFilter={tagsFilter} setTagsFilter={setTagsFilter} size="w-40 h-8" />

              <SideFilter sideFilter={sideFilter} setSideFilter={setSideFilter} size="w-40 h-8" />

              <InstalledFilter installedFilter={installedFilter} setInstalledFilter={setInstalledFilter} size="w-40 h-8" />

              <FormButton title={t("features.mods.onlyFavMods")} onClick={() => setOnlyFav((prev) => !prev)} className="w-8 h-8 text-lg" type={onlyFav ? "warn" : "normal"}>
                <PiStarDuotone />
              </FormButton>

              <OrderFilter orderBy={orderBy} setOrderBy={setOrderBy} orderByOrder={orderByOrder} setOrderByOrder={setOrderByOrder} />

              <FormButton title={t("generic.clearFilter")} onClick={() => clearFilters()} className="w-8 h-8 text-lg">
                <PiEraserDuotone />
              </FormButton>
            </StickyMenuGroup>
          </StickyMenuGroupWrapper>
        </StickyMenuWrapper>

        <GridWrapper className="my-auto">
          {modsList.length < 1 || searching ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="p-6 text-center text-2xl rounded-sm bg-zinc-950/50 backdrop-blur-xs shadow-sm shadow-zinc-950/50">
                {searching ? t("features.mods.searching") : t("features.mods.noMatchingFilters")}
              </p>
            </div>
          ) : (
            <GridGroup>
              {modsList.slice(0, visibleMods).map((mod) => (
                <GridItem
                  key={mod.modid}
                  onClick={() => {
                    if (!installation) return addNotification(t("features.installations.noInstallationSelected"), "error")
                    setModToInstall(mod)
                  }}
                  selected={mod._installed}
                  size="w-[18rem] max-w-[26rem]"
                  className="group overflow-hidden"
                >
                  <div className="relative w-full aspect-[3/2]">
                    <img src={mod.logo ? `${mod.logo}` : "https://mods.vintagestory.at/web/img/mod-default.png"} alt={mod.name} className="w-full h-full object-cover object-top" />

                    <div className="absolute w-full top-0 flex items-center justify-between p-1">
                      <FormButton
                        title={t("generic.favorite")}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (config.favMods.some((modid) => modid === mod.modid)) {
                            configDispatch({ type: CONFIG_ACTIONS.REMOVE_FAV_MOD, payload: { modid: mod.modid } })
                          } else {
                            configDispatch({ type: CONFIG_ACTIONS.ADD_FAV_MOD, payload: { modid: mod.modid } })
                          }
                        }}
                        className={clsx("p-1 text-lg", !config.favMods.some((modid) => modid === mod.modid) && "opacity-0 group-hover:opacity-100 duration-200")}
                        type={config.favMods.some((modid) => modid === mod.modid) ? "warn" : "normal"}
                      >
                        <PiStarDuotone />
                      </FormButton>

                      <FormButton
                        title={t("features.mods.openOnTheModDB")}
                        onClick={(e) => {
                          e.stopPropagation()
                          window.api.utils.openOnBrowser(`https://mods.vintagestory.at/show/mod/${mod.assetid}`)
                        }}
                        className="p-1 text-lg opacity-0 group-hover:opacity-100 duration-200"
                      >
                        <FiExternalLink />
                      </FormButton>
                    </div>
                  </div>

                  <div className="w-full aspect-[3/1] flex text-sm">
                    <div className="shrink-0 w-1/3 flex flex-col gap-1 px-2 py-1 overflow-hidden">
                      <p className="flex items-center gap-1" title={mod.author}>
                        <PiUserCircleDuotone className="shrink-0 opacity-50" />
                        <span className="overflow-hidden whitespace-nowrap text-ellipsis">{mod.author}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <PiDownloadDuotone className="shrink-0 opacity-50" />
                        <span>{Number(mod.downloads) > 10000 ? `${Math.floor(Number(mod.downloads) / 1000)}K` : Number(mod.downloads)}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <PiStarDuotone className="shrink-0 opacity-50" />
                        <span>{Number(mod.follows) > 10000 ? `${Math.floor(Number(mod.follows) / 1000)}K` : Number(mod.follows)}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <PiChatCenteredTextDuotone className="shrink-0 opacity-50" />
                        <span>{Number(mod.comments) > 10000 ? `${Math.floor(Number(mod.comments) / 1000)}K` : Number(mod.comments)}</span>
                      </p>
                    </div>

                    <ThinSeparator />

                    <div className="w-full flex flex-col gap-1 px-2 py-1 overflow-hidden">
                      <p className="text-base font-bold overflow-hidden whitespace-nowrap text-ellipsis" title={mod.name}>
                        {mod.name}
                      </p>
                      <p className="text-zinc-400 line-clamp-3" title={mod.summary ?? ""}>
                        {mod.summary}
                      </p>
                    </div>
                  </div>
                </GridItem>
              ))}
            </GridGroup>
          )}
        </GridWrapper>

        <InstallModPopup
          modToInstall={modToInstall?.modid || null}
          setModToInstall={() => setModToInstall(null)}
          installation={
            installation && {
              installation: installation,
              oldMod: installationInstalledMods?.find((iMod) => modToInstall?.modidstrs.some((modidstr) => modidstr === iMod.modid))
            }
          }
          onFinishInstallation={() => {
            triggerGetInstalledMods()
          }}
        />
      </div>
    </ScrollableContainer>
  )
}

export default ListMods
