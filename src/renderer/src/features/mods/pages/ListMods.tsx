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
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from "@headlessui/react"
import clsx from "clsx"

import { useConfigContext } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

import { useCountMods } from "@renderer/features/mods/hooks/useCountMods"

import { FormInputText } from "@renderer/components/ui/FormComponents"
import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"

function ListMods(): JSX.Element {
  const { t } = useTranslation()
  const { config } = useConfigContext()
  const { addNotification } = useNotificationsContext()
  const { startDownload } = useTaskContext()
  const countMods = useCountMods()

  const [modsList, setModsList] = useState<DownloadableModOnList[]>([])
  const [authorsList, setAuthorsList] = useState<DownloadableModAuthor[]>([])
  const [authorsQuery, setAuthorsQuery] = useState("")
  const [gameVersionsList, setGameVersionsList] = useState<DownloadableModGameVersion[]>([])

  const [visibleMods, setVisibleMods] = useState(20)

  const [textFilter, setTextFilter] = useState<string>("")
  const [authorFilter, setAuthorFilter] = useState<{ userid: string; name: string }>({ userid: "", name: "" })
  const [versionsFilter, setVersionsFilter] = useState<{ tagid: string; name: string; color: string }[]>([])

  const [orderBy, setOrderBy] = useState("follows")
  const [orderByOrder, setOrderByOrder] = useState("desc")

  const [searching, setSearching] = useState(true)

  const [modToInstall, setModToInstall] = useState<{ name: string; modid: string } | null>(null)
  const [modVersions, setModVersions] = useState<DownloadableModVersion[]>([])

  const [installationMods, setInstallationMods] = useState<InstalledModType[]>([])

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

  useEffect(() => {
    queryAuthors()
    queryGameVersions()
  }, [])

  useEffect(() => {
    const handleScroll = (): void => {
      if (!scrollRef.current) return
      const { scrollTop, clientHeight, scrollHeight } = scrollRef.current
      if (scrollTop + clientHeight >= scrollHeight - 10) setVisibleMods((prev) => prev + 20)
    }

    const checkLoadMore = (): void => {
      if (scrollRef.current && scrollRef.current.scrollHeight <= scrollRef.current.clientHeight) setVisibleMods((prev) => prev + 20)
    }

    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", handleScroll)
      checkLoadMore()
    }

    return (): void => {
      if (scrollRef.current) scrollRef.current.removeEventListener("scroll", handleScroll)
    }
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
    queryModVersions()
  }, [modToInstall])

  useEffect(() => {
    ;(async (): Promise<void> => {
      const mods = await getMods()
      setInstallationMods(mods)
    })()
  }, [config.lastUsedInstallation])

  async function getMods(): Promise<InstalledModType[]> {
    const path = await window.api.pathsManager.formatPath([config.installations.find((i) => i.id === config.lastUsedInstallation)!.path, "Mods"])
    const mods = await window.api.modsManager.getInstalledMods(path)
    return mods
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
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching mods: ${err}`)
    }
  }

  async function queryModVersions(): Promise<void> {
    try {
      const res = await window.api.netManager.queryURL(`https://mods.vintagestory.at/api/mod/${modToInstall?.modid}`)
      const data = await JSON.parse(res)
      setModVersions(data["mod"]["releases"])
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching mod versions: ${err}`)
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
    <div ref={scrollRef} className="w-full h-full pt-6 overflow-y-scroll">
      <div className="w-full min-h-full flex flex-col justify-center gap-6 p-4">
        <h1 className="text-3xl text-center font-bold select-none">{t("features.mods.listTitle")}</h1>

        <div className="w-full h-full flex justify-center gap-4 flex-wrap select-none">
          <>
            <div className="w-full px-8 pb-4 flex gap-2 justify-center">
              <div className="flex gap-4">
                <FormInputText placeholder={t("generic.text")} value={textFilter} onChange={(e) => setTextFilter(e.target.value)} className="w-40" />
              </div>

              <Combobox value={authorFilter} onChange={(value) => setAuthorFilter(value || { userid: "", name: "" })} onClose={() => setAuthorsQuery("")}>
                {({ open }) => (
                  <>
                    <div className="w-40 h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-between gap-2 rounded overflow-hidden select-none">
                      <ComboboxInput
                        placeholder={t("generic.author")}
                        displayValue={() => authorFilter?.name || ""}
                        onChange={(event) => setAuthorsQuery(event.target.value)}
                        className="w-full px-2 py-1 placeholder:text-zinc-600 bg-transparent "
                      />
                      <ComboboxButton className="w-8">
                        <PiCaretDownBold className={clsx(open && "rotate-180", "text-sm text-zinc-500 shrink-0")} />
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
                          className="w-40 bg-zinc-850 shadow shadow-zinc-900 mt-2 rounded select-none"
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
                    <ListboxButton className="w-40 h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-between gap-2 rounded overflow-hidden select-none">
                      <span className={clsx("w-full px-2 py-1 text-start overflow-hidden whitespace-nowrap text-ellipsis", versionsFilter.length < 1 && "text-zinc-600")}>
                        {versionsFilter.length < 1 ? t("generic.versions") : versionsFilter.map((version) => version.name).join(", ")}
                      </span>
                      <PiCaretDownBold className={clsx(open && "rotate-180", "w-8 text-sm text-zinc-500 shrink-0")} />
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
                          className="w-[var(--button-width)] bg-zinc-850 shadow shadow-zinc-900 mt-2 rounded select-none"
                        >
                          <div className="flex flex-col max-h-40">
                            {gameVersionsList.map((version) => (
                              <ListboxOption key={version.tagid} value={version} className="hover:pl-1 duration-100 odd:bg-zinc-850 even:bg-zinc-800">
                                <div className="px-2 py-1 flex gap-1 items-center">
                                  <p className="whitespace-nowrap overflow-hidden text-ellipsis text-sm">{version.name}</p>
                                  {versionsFilter.includes(version) && <PiCheckBold className="text-sm text-zinc-500" />}
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

              <button
                title={t("generic.clearFilter")}
                onClick={() => clearFilters()}
                className="w-8 h-8 shrink-0 text-lg bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded select-none"
              >
                <PiEraserFill />
              </button>

              <Menu>
                {({ open }) => (
                  <>
                    <MenuButton title={t("generic.order")} className="w-8 h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center text-lg rounded select-none">
                      <PiArrowsDownUpFill />
                    </MenuButton>
                    <AnimatePresence>
                      {open && (
                        <MenuItems static anchor="bottom" className={clsx("w-40 flex flex-col rounded mt-2 bg-zinc-800 overflow-hidden text-sm", open ? "opacity-100" : "opacity-0")}>
                          {ORDER_BY.map((ob) => (
                            <MenuItem key={ob.key}>
                              <button
                                onClick={() => changeOrder(ob.key)}
                                className="px-2 py-1 rounded hover:pl-3 duration-100 odd:bg-zinc-850 even:bg-zinc-800 flex gap-2 items-center justify-between"
                              >
                                <span className="flex gap-1 items-center">
                                  {ob.icon}
                                  {ob.value}
                                </span>
                                {orderBy === ob.key && (orderByOrder === "desc" ? <PiArrowDownBold /> : <PiArrowDownBold className="rotate-180" />)}
                              </button>
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
                  <FiLoader className="animate-spin text-lg text-zinc-500" />
                </div>
              )}
            </div>

            {modsList.length < 1 ? (
              <div className="flex flex-col justify-center items-center gap-4">
                <p className="text-zinc-500">{searching ? t("features.mods.searching") : t("features.mods.noMatchingFilters")}</p>
              </div>
            ) : (
              <>
                {modsList.slice(0, visibleMods).map((mod) => (
                  <div key={mod["modid"]} className="group w-60 h-48 relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setModToInstall({ modid: mod["modid"], name: mod["name"] })
                      }}
                      className="w-full h-full flex flex-col rounded bg-zinc-800 shadow shadow-zinc-900 group-hover:shadow-lg group-hover:shadow-zinc-900 absolute group-hover:w-64 group-hover:h-72 group-hover:-translate-y-4 group-hover:-translate-x-2 z-0 group-hover:z-20 duration-100 overflow-hidden"
                    >
                      <img
                        src={mod["logo"] ? `${mod["logo"]}` : "https://mods.vintagestory.at/web/img/mod-default.png"}
                        alt={mod["name"]}
                        className="w-full h-32 aspect-video object-cover object-center bg-zinc-850 rounded"
                      />
                      <div className="w-full h-16 group-hover:h-40 duration-100 px-2 py-1">
                        <div className="w-full h-full text-center relative flex flex-col gap-2">
                          <p className="shrink-0 overflow-hidden whitespace-nowrap text-ellipsis">{mod["name"]}</p>

                          <p className="w-full text-sm overflow-hidden whitespace-nowrap text-ellipsis flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 duration-100 delay-0 group-hover:delay-100">
                            <PiUserBold />
                            <span>{mod["author"]}</span>
                          </p>

                          <p className="text-sm text-zinc-500 line-clamp-3 opacity-0 group-hover:opacity-100 duration-100 delay-0 group-hover:delay-100">{mod["summary"]}</p>

                          <div className="w-full text-sm text-zinc-500 flex gap-2 justify-around absolute bottom-0">
                            <p className="flex items-center gap-1">
                              <PiDownloadFill />
                              <span>{mod["downloads"]}</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <PiStarFill />
                              <span>{mod["follows"]}</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <PiChatCenteredDotsFill />
                              <span>{mod["comments"]}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </>
            )}
          </>
        </div>

        <AnimatePresence>
          {modToInstall && (
            <Dialog
              static
              as={motion.div}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              open={modToInstall !== undefined}
              onClose={() => {
                setModToInstall(null)
                setModVersions([])
              }}
              className="w-full h-full absolute top-0 left-0 z-[200] flex justify-center items-center backdrop-blur-sm"
            >
              <DialogPanel className="w-[800px] flex flex-col gap-2 text-center bg-zinc-850 rounded p-8">
                <DialogTitle className="text-2xl font-bold">{t("features.mods.installMod")}</DialogTitle>
                <Description className="w-full flex flex-col gap-2 text-zinc-500">{t("features.mods.installationPopupDesc", { modName: modToInstall.name })}</Description>
                <TableWrapper className="max-h-[300px] overflow-y-scroll text-center">
                  <TableHead>
                    <TableHeadRow>
                      <TableCell className="w-2/12">{t("generic.version")}</TableCell>
                      <TableCell className="w-2/12">{t("generic.releaseDate")}</TableCell>
                      <TableCell className="w-7/12">{t("generic.versions")}</TableCell>
                      <TableCell className="w-1/12">{t("generic.actions")}</TableCell>
                    </TableHeadRow>
                  </TableHead>

                  <TableBody className="overflow-x-hidden">
                    {modVersions.length === 0 && (
                      <TableBodyRow>
                        <TableCell className="w-full h-24 flex items-center justify-center">
                          <FiLoader className="animate-spin text-3xl text-zinc-500" />
                        </TableCell>
                      </TableBodyRow>
                    )}
                    {modVersions.map((mv) => (
                      <TableBodyRow key={mv.releaseid} disabled={installationMods.find((im) => mv.modidstr === im.modid)?.version === mv.modversion}>
                        <TableCell className="w-2/12">{mv.modversion}</TableCell>
                        <TableCell className="w-2/12">{new Date(mv.created).toLocaleDateString("es")}</TableCell>
                        <TableCell className="w-7/12 overflow-hidden whitespace-nowrap text-ellipsis">
                          <input type="text" value={mv.tags.join(", ")} readOnly className="w-full bg-transparent outline-none text-center" />
                        </TableCell>
                        <TableCell className="w-1/12 flex gap-2 items-center justify-center">
                          <button
                            disabled={installationMods.find((im) => mv.modidstr === im.modid)?.version === mv.modversion}
                            onClick={async (e) => {
                              e.preventDefault()
                              e.stopPropagation()

                              const installation = config.installations.find((i) => i.id === config.lastUsedInstallation)

                              if (!installation) return addNotification(t("notifications.titles.error"), t("features.installations.noInstallationSelected"), "error")

                              const installPath = await window.api.pathsManager.formatPath([installation.path, "Mods"])

                              const oldMod = installationMods.find((im) => mv.modidstr === im.modid)
                              if (oldMod) await window.api.pathsManager.deletePath(oldMod.path)

                              startDownload(
                                t("features.mods.modTaskName", { name: modToInstall.name, version: `v${mv.modversion}`, installation: installation.name }),
                                t("features.mods.modDownloadDesc", { name: modToInstall.name, version: `v${mv.modversion}`, installation: installation.name }),
                                `https://mods.vintagestory.at/download/${mv.fileid}/${mv.filename}`,
                                installPath,
                                async (status, path, error) => {
                                  if (!status) return window.api.utils.logMessage("error", `[component] [ListMods] Error downloading mod: ${error}`)
                                  window.api.utils.logMessage("info", `[component] [ListMods] Downloaded mod ${mv.mainfile} on ${path}`)
                                  countMods()
                                  setInstallationMods(await getMods())
                                }
                              )

                              setModToInstall(null)
                              setModVersions([])
                            }}
                            className={clsx(
                              "w-7 h-7 rounded flex items-center justify-center",
                              config.installations.some((i) => i.id === config.lastUsedInstallation) &&
                                mv.tags.includes(`v${config.installations.find((i) => i.id === config.lastUsedInstallation)!.version}`)
                                ? "bg-green-700"
                                : mv.tags.some((mvt) =>
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
                            title={installationMods.some((im) => mv.modidstr === im.modid) ? t("features.installations.updateOnInstallation") : t("features.installations.installOnInstallation")}
                          >
                            {installationMods.some((im) => mv.modidstr === im.modid) ? <PiArrowClockwiseFill /> : <PiDownloadFill />}
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
      </div>
    </div>
  )
}

export default ListMods
