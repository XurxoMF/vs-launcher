/*
! IMPORTANT NOTES

I've made this page in just a few hours. It's not optimiced at all and it'll need a rewrite when I have time.

If you're reading this, don't get examples from this page please xD

Just check out the nested ternary operators on the install/update buttons... for the sake of god,
what am I doing just to release this update!? This makes no sense xD
*/

import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import {
  PiDownloadFill,
  PiStarFill,
  PiChatCenteredDotsFill,
  PiEraserFill,
  PiArrowsDownUpFill,
  PiCaretDownBold,
  PiCalendarBlankFill,
  PiUploadFill,
  PiCheckBold,
  PiArrowDownBold,
  PiFireFill,
  PiUserBold,
  PiArrowClockwiseFill
} from "react-icons/pi"
import { FiLoader } from "react-icons/fi"
import { AnimatePresence, motion } from "motion/react"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Button
} from "@headlessui/react"
import clsx from "clsx"

import { useConfigContext } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useInstallMod } from "../hooks/useInstallMod"

import { FormInputText } from "@renderer/components/ui/FormComponents"
import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import { GridGroup, GridItem, GridWrapper } from "@renderer/components/ui/Grid"

function ListMods(): JSX.Element {
  const { t } = useTranslation()
  const { config } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  const installMod = useInstallMod()

  const [modsList, setModsList] = useState<DownloadableModOnList[]>([])
  const [authorsList, setAuthorsList] = useState<DownloadableModAuthor[]>([])
  const [authorsQuery, setAuthorsQuery] = useState<string>("")
  const [gameVersionsList, setGameVersionsList] = useState<DownloadableModGameVersion[]>([])

  const [visibleMods, setVisibleMods] = useState<number>(20)

  const [textFilter, setTextFilter] = useState<string>("")
  const [authorFilter, setAuthorFilter] = useState<{ userid: string; name: string }>({ userid: "", name: "" })
  const [versionsFilter, setVersionsFilter] = useState<{ tagid: string; name: string; color: string }[]>([])

  const [orderBy, setOrderBy] = useState<string>("follows")
  const [orderByOrder, setOrderByOrder] = useState<string>("desc")

  const [searching, setSearching] = useState<boolean>(true)

  const [modToInstall, setModToInstall] = useState<string | null>(null)
  const [downloadableModToInstall, setDownloadableModToInstall] = useState<DownloadableMod | null>(null)

  const [installationMods, setInstallationMods] = useState<InstalledModType[]>([])

  const [scrTop, setScrTop] = useState(0)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const ORDER_BY = [
    { key: "trendingpoints", value: t("generic.trending"), icon: <PiFireFill /> },
    { key: "downloads", value: t("generic.downloads"), icon: <PiDownloadFill /> },
    { key: "comments", value: t("generic.comments"), icon: <PiChatCenteredDotsFill /> },
    { key: "lastreleased", value: t("generic.updated"), icon: <PiUploadFill /> },
    { key: "asset.created", value: t("generic.created"), icon: <PiCalendarBlankFill /> },
    { key: "follows", value: t("generic.follows"), icon: <PiStarFill /> }
  ]

  const handleScroll = (): void => {
    if (!scrollRef.current) return
    // scrollTop => Total px scrolled(overflowing on top). If the user scrolled 500px scrollTop === 500
    // clientHeight => Visible y px. If the window has 1000px height and the div is 100vh it'll be clientHeight === 1000
    // scrollHeight => Total height of the container. If it has 3000px height it'll be scrollHeight === 3000px
    // So, if there is only half a screen to reach the bottom, load more mods
    const { scrollTop, clientHeight, scrollHeight } = scrollRef.current
    setScrTop(scrollTop)
    if (scrollTop + clientHeight >= scrollHeight - (clientHeight / 2 + 100)) setVisibleMods((prev) => prev + 10)
  }

  const checkLoadMore = (): void => {
    if (scrollRef.current && scrollRef.current.scrollHeight <= scrollRef.current.clientHeight) setVisibleMods((prev) => prev + 20)
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", handleScroll)
      checkLoadMore()
    }

    return (): void => {
      if (scrollRef.current) scrollRef.current.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    queryAuthors()
    queryGameVersions()
  }, [])

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      queryMods()
      timeoutRef.current = null
    }, 400)

    return (): void => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [textFilter, authorFilter, versionsFilter, orderBy, orderByOrder])

  useEffect(() => {
    if (!modToInstall) return
    queryMod()
  }, [modToInstall])

  const firstTimeGettingModsListMods = useRef(true)
  useEffect(() => {
    if (!firstTimeGettingModsListMods.current) return
    firstTimeGettingModsListMods.current = false
    ;(async (): Promise<void> => {
      const mods = await getMods()
      setInstallationMods(mods)
    })()
  }, [])

  const prevConfigLastUsedInstallation = useRef(config.lastUsedInstallation)
  useEffect(() => {
    if (config.lastUsedInstallation !== prevConfigLastUsedInstallation.current) {
      ;(async (): Promise<void> => {
        const mods = await getMods()
        setInstallationMods(mods)
      })()
    }

    prevConfigLastUsedInstallation.current = config.lastUsedInstallation
  }, [config.lastUsedInstallation])

  async function getMods(): Promise<InstalledModType[]> {
    const path = await window.api.pathsManager.formatPath([config.installations.find((i) => i.id === config.lastUsedInstallation)!.path, "Mods"])
    const mods = await window.api.modsManager.getInstalledMods(path)
    if (mods.errors.length > 0) addNotification(t("features.mods.someModsCouldNotBeParsed"), "warning")
    return mods.mods
  }

  async function queryAuthors(): Promise<void> {
    try {
      const res = await window.api.netManager.queryURL("https://mods.vintagestory.at/api/authors")
      const data = await JSON.parse(res)
      setAuthorsList(data["authors"])
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching authors: ${err}`)
    }
  }

  async function queryGameVersions(): Promise<void> {
    try {
      const res = await window.api.netManager.queryURL("https://mods.vintagestory.at/api/gameversions")
      const data = await JSON.parse(res)
      setGameVersionsList(data["gameversions"])
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching game versions: ${err}`)
    }
  }

  async function queryMods(): Promise<void> {
    try {
      setSearching(true)

      const filters: string[] = []

      if (textFilter.length > 1) filters.push(`text=${textFilter}`)
      if (authorFilter.name.length > 1) filters.push(`author=${authorFilter.userid}`)
      if (versionsFilter.length > 0) versionsFilter.map((version) => filters.push(`gameversions[]=${version.tagid}`))
      filters.push(`orderby=${orderBy}`)
      filters.push(`orderdirection=${orderByOrder}`)

      const res = await window.api.netManager.queryURL(`https://mods.vintagestory.at/api/mods${filters.length > 0 && `?${filters.join("&")}`}`)
      const data = await JSON.parse(res)
      setSearching(false)
      setModsList(data["mods"])
      scrollRef.current?.scrollTo({ top: 0 })
      setVisibleMods(20)
      checkLoadMore()
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching mods: ${err}`)
    }
  }

  async function queryMod(): Promise<void> {
    try {
      const res = await window.api.netManager.queryURL(`https://mods.vintagestory.at/api/mod/${modToInstall}`)
      const data = await JSON.parse(res)
      setDownloadableModToInstall(data["mod"])
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching ${modToInstall} mod versions: ${err}`)
    }
  }

  function clearFilters(): void {
    setTextFilter("")
    setAuthorFilter({ userid: "", name: "" })
    setVersionsFilter([])
  }

  function changeOrder(order: string): void {
    if (orderBy === order) {
      setOrderByOrder((prev) => (prev === "desc" ? "asc" : "desc"))
    } else {
      setOrderBy(order)
      setOrderByOrder("desc")
    }
  }

  const filteredAuthors =
    authorsQuery === ""
      ? authorsList
      : authorsList.filter((author) => {
          return (author["name"] as string)?.toLowerCase().includes(authorsQuery.toLowerCase())
        })

  return (
    <ScrollableContainer ref={scrollRef}>
      <div className="w-full min-h-full flex flex-col justify-center gap-4">
        <div className="sticky top-0 z-10 w-full flex items-center justify-center">
          <div className={clsx("flex items-center justify-center gap-2 rounded border border-zinc-400/5 shadow shadow-zinc-950/50 p-2 duration-200", scrTop > 20 ? "bg-zinc-800" : "bg-zinc-950/15")}>
            <div className="flex gap-4">
              <FormInputText placeholder={t("generic.text")} value={textFilter} onChange={(e) => setTextFilter(e.target.value)} className="w-40" />
            </div>

            <Combobox value={authorFilter} onChange={(value) => setAuthorFilter(value || { userid: "", name: "" })} onClose={() => setAuthorsQuery("")}>
              {({ open }) => (
                <>
                  <div className="w-40 h-8 bg-zinc-850 shadow shadow-zinc-950/50 hover:shadow-none flex items-center justify-between gap-2 rounded overflow-hidden">
                    <ComboboxInput
                      placeholder={t("generic.author")}
                      displayValue={() => authorFilter?.name || ""}
                      onChange={(event) => setAuthorsQuery(event.target.value)}
                      className="w-full px-2 py-1 placeholder:text-zinc-400 bg-transparent "
                    />
                    <ComboboxButton className="w-8">
                      <PiCaretDownBold className={clsx(open && "rotate-180", "text-sm text-zinc-300 shrink-0")} />
                    </ComboboxButton>
                  </div>

                  <AnimatePresence>
                    {open && (
                      <ComboboxOptions
                        static
                        as={motion.div}
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        anchor="bottom start"
                        className="w-40 bg-zinc-850 shadow shadow-zinc-950/50 mt-2 rounded"
                      >
                        <div className="flex flex-col max-h-40">
                          <>
                            <ComboboxOption value={undefined} className="hover:pl-1 duration-100 odd:bg-zinc-850 even:bg-zinc-800">
                              <p className="px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis text-sm">- {t("generic.everyone")}-</p>
                            </ComboboxOption>
                            {filteredAuthors.slice(0, 20).map((author) => (
                              <ComboboxOption key={author["userid"]} value={author} className="hover:pl-1 duration-100 odd:bg-zinc-850 even:bg-zinc-800">
                                <p className="px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis text-sm">{author["name"]}</p>
                              </ComboboxOption>
                            ))}
                          </>
                        </div>
                      </ComboboxOptions>
                    )}
                  </AnimatePresence>
                </>
              )}
            </Combobox>

            <Listbox value={versionsFilter} onChange={setVersionsFilter} multiple>
              {({ open }) => (
                <>
                  <ListboxButton className="w-40 h-8 bg-zinc-850 shadow shadow-zinc-950/50 hover:shadow-none flex items-center justify-between gap-2 rounded overflow-hidden">
                    <span className={clsx("w-full px-2 py-1 text-start overflow-hidden whitespace-nowrap text-ellipsis", versionsFilter.length < 1 && "text-zinc-400")}>
                      {versionsFilter.length < 1 ? t("generic.versions") : versionsFilter.map((version) => version.name).join(", ")}
                    </span>
                    <PiCaretDownBold className={clsx(open && "rotate-180", "w-8 text-sm text-zinc-300 shrink-0")} />
                  </ListboxButton>
                  <AnimatePresence>
                    {open && (
                      <ListboxOptions
                        static
                        as={motion.div}
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        anchor="bottom"
                        className="w-[var(--button-width)] bg-zinc-850 shadow shadow-zinc-950/50 mt-2 rounded"
                      >
                        <div className="flex flex-col max-h-40">
                          {gameVersionsList.map((version) => (
                            <ListboxOption key={version.tagid} value={version} className="hover:pl-1 duration-100 odd:bg-zinc-850 even:bg-zinc-800">
                              <div className="px-2 py-1 flex gap-1 items-center">
                                <p className="whitespace-nowrap overflow-hidden text-ellipsis text-sm">{version.name}</p>
                                {versionsFilter.includes(version) && <PiCheckBold className="text-sm text-zinc-300" />}
                              </div>
                            </ListboxOption>
                          ))}
                        </div>
                      </ListboxOptions>
                    )}
                  </AnimatePresence>
                </>
              )}
            </Listbox>

            <Button
              title={t("generic.clearFilter")}
              onClick={() => clearFilters()}
              className="w-8 h-8 shrink-0 text-lg bg-zinc-850 shadow shadow-zinc-950/50 hover:shadow-none flex items-center justify-center rounded"
            >
              <PiEraserFill />
            </Button>

            <Menu>
              {({ open }) => (
                <>
                  <MenuButton title={t("generic.order")} className="w-8 h-8 bg-zinc-850 shadow shadow-zinc-950/50 hover:shadow-none flex items-center justify-center text-lg rounded">
                    <PiArrowsDownUpFill />
                  </MenuButton>
                  <AnimatePresence>
                    {open && (
                      <MenuItems static anchor="bottom" className={clsx("w-40 flex flex-col rounded mt-2 bg-zinc-800 overflow-hidden text-sm", open ? "opacity-100" : "opacity-0")}>
                        {ORDER_BY.map((ob) => (
                          <MenuItem key={ob.key}>
                            <Button onClick={() => changeOrder(ob.key)} className="px-2 py-1 rounded hover:pl-3 duration-100 odd:bg-zinc-850 even:bg-zinc-800 flex gap-2 items-center justify-between">
                              <span className="flex gap-1 items-center">
                                {ob.icon}
                                {ob.value}
                              </span>
                              {orderBy === ob.key && (orderByOrder === "desc" ? <PiArrowDownBold /> : <PiArrowDownBold className="rotate-180" />)}
                            </Button>
                          </MenuItem>
                        ))}
                      </MenuItems>
                    )}
                  </AnimatePresence>
                </>
              )}
            </Menu>

            {searching && (
              <div className="w-8 h-8 flex items-center justify-center">
                <FiLoader className="animate-spin text-lg text-zinc-300" />
              </div>
            )}
          </div>
        </div>

        <GridWrapper className="w-full">
          {modsList.length < 1 ? (
            <div className="w-full h-[calc(100vh-10.1rem)] flex flex-col items-center justify-center gap-2 rounded bg-zinc-950/50 p-4">
              <p className="text-2xl">{searching ? t("features.mods.searching") : t("features.mods.noMatchingFilters")}</p>
            </div>
          ) : (
            <GridGroup>
              {modsList.slice(0, visibleMods).map((mod) => (
                <GridItem
                  key={mod.modid}
                  onClick={() => {
                    if (!config.installations.some((i) => i.id === config.lastUsedInstallation)) return addNotification(t("features.installations.noInstallationSelected"), "error")
                    setModToInstall(mod.modid)
                  }}
                  className="min-w-72 max-w-96 aspect-[4/3] overflow-hidden"
                >
                  <div className="relative w-full h-2/3 text-sm">
                    <img src={mod.logo ? `${mod.logo}` : "https://mods.vintagestory.at/web/img/mod-default.png"} alt={mod.name} className="w-full h-full object-cover object-center" />

                    {/* <div className="absolute top-0 left-0 flex items-center p-1">
                      <FormButton
                        title={t("features.mods.openOnTheModDB")}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.api.utils.openOnBrowser(`https://mods.vintagestory.at/show/mod/${mod.assetid}`)
                        }}
                        className="px-2 py-1 backdrop-blur"
                      >
                        {t("features.mods.openOnTheModDB")}
                      </FormButton>
                    </div> */}

                    <div className="absolute bottom-0 right-0 flex items-center gap-2 p-1">
                      <p className="px-1 flex gap-1 items-center backdrop-blur rounded border border-zinc-400/5 bg-zinc-950/50 shadow shadow-zinc-950/50">
                        <PiDownloadFill />
                        <span>{mod.downloads}</span>
                      </p>
                      <p className="px-1 flex gap-1 items-center backdrop-blur rounded border border-zinc-400/5 bg-zinc-950/50 shadow shadow-zinc-950/50">
                        <PiStarFill />
                        <span>{mod.follows}</span>
                      </p>
                      <p className="px-1 flex gap-1 items-center backdrop-blur rounded border border-zinc-400/5 bg-zinc-950/50 shadow shadow-zinc-950/50">
                        <PiChatCenteredDotsFill />
                        <span>{mod.comments}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p>{mod.name}</p>
                    <p className="flex gap-1 items-center">
                      <PiUserBold />
                      <span>{mod.author}</span>
                    </p>
                    <p>{mod.summary}</p>
                  </div>
                </GridItem>
              ))}
            </GridGroup>
          )}
        </GridWrapper>
      </div>

      <PopupDialogPanel
        title={t("features.mods.installMod")}
        isOpen={modToInstall !== null}
        close={() => {
          setModToInstall(null)
          setDownloadableModToInstall(null)
        }}
        maxWidth={false}
      >
        <>
          <p>{t("features.mods.installationPopupDesc", { modName: downloadableModToInstall?.name })}</p>
          <TableWrapper className="w-[800px]">
            <TableHead>
              <TableHeadRow>
                <TableCell className="w-2/12">{t("generic.version")}</TableCell>
                <TableCell className="w-3/12">{t("generic.releaseDate")}</TableCell>
                <TableCell className="w-5/12">{t("generic.versions")}</TableCell>
                <TableCell className="w-2/12">{t("generic.actions")}</TableCell>
              </TableHeadRow>
            </TableHead>

            {!downloadableModToInstall ? (
              <div className="flex items-center justify-center py-10">
                <FiLoader className="animate-spin text-3xl text-zinc-300" />
              </div>
            ) : (
              <TableBody className="max-h-[300px]">
                {downloadableModToInstall?.releases.map((release) => (
                  <TableBodyRow key={release.releaseid} disabled={installationMods.find((im) => release.modidstr === im.modid)?.version === release.modversion}>
                    <TableCell className="w-2/12">{release.modversion}</TableCell>
                    <TableCell className="w-3/12">{new Date(release.created).toLocaleDateString("es")}</TableCell>
                    <TableCell className="w-5/12 overflow-hidden whitespace-nowrap text-ellipsis">
                      <input type="text" value={release.tags.join(", ")} readOnly className="w-full bg-transparent outline-none text-center" />
                    </TableCell>
                    <TableCell className="w-2/12 flex gap-2 items-center justify-center">
                      <Button
                        disabled={installationMods.find((im) => release.modidstr === im.modid)?.version === release.modversion}
                        onClick={() => {
                          installMod(
                            config.installations.find((i) => i.id === config.lastUsedInstallation),
                            downloadableModToInstall || undefined,
                            release,
                            undefined
                          )
                          setModToInstall(null)
                          setDownloadableModToInstall(null)
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
                        title={installationMods.some((im) => release.modidstr === im.modid) ? t("features.installations.updateOnInstallation") : t("features.installations.installOnInstallation")}
                      >
                        {installationMods.some((im) => release.modidstr === im.modid) ? <PiArrowClockwiseFill /> : <PiDownloadFill />}
                      </Button>
                    </TableCell>
                  </TableBodyRow>
                ))}
              </TableBody>
            )}
          </TableWrapper>
        </>
      </PopupDialogPanel>
    </ScrollableContainer>
  )
}

export default ListMods
