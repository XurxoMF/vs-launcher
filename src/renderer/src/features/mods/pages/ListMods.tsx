import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react"
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
  PiArrowFatUpFill,
  PiMagnifyingGlassFill
} from "react-icons/pi"
import { FiExternalLink, FiLoader } from "react-icons/fi"
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
  MenuItems
} from "@headlessui/react"
import clsx from "clsx"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useQueryMods } from "../hooks/useQueryMods"

import { FormButton, FormInputText } from "@renderer/components/ui/FormComponents"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import { GridGroup, GridItem, GridWrapper } from "@renderer/components/ui/Grid"
import InstallModPopup from "../components/InstallModPopup"
import { NormalButton } from "@renderer/components/ui/Buttons"
import { StickyMenuWrapper, StickyMenuGroup } from "@renderer/components/ui/StickyMenu"

import { DROPDOWN_MENU_ITEM_VARIANTS, DROPDOWN_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"

function ListMods(): JSX.Element {
  const { t } = useTranslation()
  const { config, configDispatch } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  const queryMods = useQueryMods()

  const [modsList, setModsList] = useState<DownloadableModOnList[]>([])
  const [visibleMods, setVisibleMods] = useState<number>(20)

  const [onlyFav, setOnlyFav] = useState<boolean>(false)
  const [textFilter, setTextFilter] = useState<string>("")
  const [authorFilter, setAuthorFilter] = useState<DownloadableModAuthor>({ userid: "", name: "" })
  const [versionsFilter, setVersionsFilter] = useState<DownloadableModGameVersion[]>([])
  const [orderBy, setOrderBy] = useState<string>("follows")
  const [orderByOrder, setOrderByOrder] = useState<string>("desc")

  const [searching, setSearching] = useState<boolean>(true)

  const [modToInstall, setModToInstall] = useState<number | string | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const handleScroll = (): void => {
    if (!scrollRef.current) return
    const { scrollTop, clientHeight, scrollHeight } = scrollRef.current
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

  // Query mods when filters change.
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      await triggerQueryMods()
      timeoutRef.current = null
    }, 400)

    return (): void => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [onlyFav, textFilter, authorFilter, versionsFilter, orderBy, orderByOrder])

  async function triggerQueryMods(): Promise<void> {
    setSearching(true)

    const mods = await queryMods({
      textFilter,
      authorFilter,
      versionsFilter,
      orderBy,
      orderByOrder,
      onFinish: () => {
        setSearching(false)
        scrollRef.current?.scrollTo({ top: 0 })
        setVisibleMods(20)
        checkLoadMore()
      }
    })

    if (onlyFav) {
      const onlyFavMods = mods.filter((mod) => config.favMods.some((fm) => fm === mod.modid))
      setModsList(onlyFavMods)
    } else {
      setModsList(mods)
    }
  }

  function clearFilters(): void {
    setTextFilter("")
    setAuthorFilter({ userid: "", name: "" })
    setVersionsFilter([])
  }

  return (
    <ScrollableContainer ref={scrollRef}>
      <div className="w-full min-h-full flex flex-col justify-center gap-6">
        <StickyMenuWrapper scrollRef={scrollRef}>
          <StickyMenuGroup>
            <FormInputText placeholder={t("generic.text")} value={textFilter} onChange={(e) => setTextFilter(e.target.value)} className="w-40" />

            <AuthorFilter authorFilter={authorFilter} setAuthorFilter={setAuthorFilter} />

            <VersionsFilter versionsFilter={versionsFilter} setVersionsFilter={setVersionsFilter} />

            <FormButton title={t("features.mods.onlyFavMods")} onClick={() => setOnlyFav((prev) => !prev)} className="w-8 h-8 text-lg" type={onlyFav ? "warn" : "normal"}>
              <PiStarFill />
            </FormButton>

            <OrderFilter orderBy={orderBy} setOrderBy={setOrderBy} orderByOrder={orderByOrder} setOrderByOrder={setOrderByOrder} />

            <FormButton
              title={searching ? t("generic.searching") : t("generic.waitingForChanges")}
              onClick={() => {
                if (!searching) triggerQueryMods()
              }}
              className="w-8 h-8 text-lg"
            >
              {searching ? <FiLoader className="animate-spin" /> : <PiMagnifyingGlassFill />}
            </FormButton>

            <FormButton title={t("generic.clearFilter")} onClick={() => clearFilters()} className="w-8 h-8 text-lg">
              <PiEraserFill />
            </FormButton>

            <FormButton
              title={t("genetic.goToTop")}
              onClick={(e) => {
                e.stopPropagation()
                scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="w-8 h-8 text-lg"
            >
              <PiArrowFatUpFill />
            </FormButton>
          </StickyMenuGroup>
        </StickyMenuWrapper>

        <GridWrapper>
          {modsList.length < 1 ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="p-6 text-center text-2xl rounded-sm bg-zinc-950/50 backdrop-blur-xs shadow-sm shadow-zinc-950/50">
                {searching ? t("features.mods.searching") : t("features.mods.noMatchingFilters")}
              </p>
            </div>
          ) : (
            <GridGroup key={modsList.length + modsList[0].assetid + modsList[modsList.length - 1].assetid}>
              {modsList.slice(0, visibleMods).map((mod) => (
                <GridItem
                  key={mod.modid}
                  onClick={() => {
                    if (!config.installations.some((i) => i.id === config.lastUsedInstallation)) return addNotification(t("features.installations.noInstallationSelected"), "error")
                    setModToInstall(mod.modid)
                  }}
                  className="group overflow-hidden"
                >
                  <div className="relative w-full aspect-video">
                    <img src={mod.logo ? `${mod.logo}` : "https://mods.vintagestory.at/web/img/mod-default.png"} alt={mod.name} className="w-full h-full object-cover object-center" />

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
                        <PiStarFill />
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

                  <div className="w-full flex text-sm">
                    <div className="shrink-0 w-26 flex flex-col gap-1 px-2 py-1 border-r-2 border-zinc-400/12 overflow-hidden">
                      <p className="flex items-center gap-1">
                        <PiUserBold className="shrink-0 opacity-50" />
                        <span className="overflow-hidden whitespace-nowrap text-ellipsis">{mod.author}asasd asd as</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <PiDownloadFill className="shrink-0 opacity-50" />
                        <span>{Number(mod.downloads) > 1000 ? `${Math.floor(Number(mod.downloads) / 1000)}K` : Number(mod.downloads)}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <PiStarFill className="shrink-0 opacity-50" />
                        <span>{Number(mod.follows)}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <PiChatCenteredDotsFill className="shrink-0 opacity-50" />
                        <span>{Number(mod.comments)}</span>
                      </p>
                    </div>

                    <div className="w-full flex flex-col gap-1 px-2 py-1 overflow-hidden">
                      <p className="text-base font-bold overflow-hidden whitespace-nowrap text-ellipsis">{mod.name}</p>
                      <p className="text-zinc-400 line-clamp-3">{mod.summary}</p>
                    </div>
                  </div>
                </GridItem>
              ))}
            </GridGroup>
          )}
        </GridWrapper>

        {config.installations.some((i) => i.id === config.lastUsedInstallation) && (
          <InstallModPopup installation={config.installations.find((i) => i.id === config.lastUsedInstallation) as InstallationType} modToInstall={modToInstall} setModToInstall={setModToInstall} />
        )}
      </div>
    </ScrollableContainer>
  )
}

function AuthorFilter({ authorFilter, setAuthorFilter }: { authorFilter: DownloadableModAuthor; setAuthorFilter: Dispatch<SetStateAction<DownloadableModAuthor>> }): JSX.Element {
  const { t } = useTranslation()

  const [authorsList, setAuthorsList] = useState<DownloadableModAuthor[]>([])
  const [authorsQuery, setAuthorsQuery] = useState<string>("")

  useEffect(() => {
    queryAuthors()
  }, [])

  async function queryAuthors(): Promise<void> {
    try {
      const res = await window.api.netManager.queryURL("https://mods.vintagestory.at/api/authors")
      const data = await JSON.parse(res)
      setAuthorsList(data["authors"])
    } catch (err) {
      window.api.utils.logMessage("error", `[front] [mods] [features/mods/pages/ListMods.tsx] [AuthorFilter > queryAuthors] Error fetching authors.`)
      window.api.utils.logMessage("debug", `[front] [mods] [features/mods/pages/ListMods.tsx] [AuthorFilter > queryAuthors] Error fetching authors: ${err}`)
    }
  }

  const filteredAuthors =
    authorsQuery === ""
      ? authorsList
      : authorsList.filter((author) => {
          return (author["name"] as string)?.toLowerCase().includes(authorsQuery.toLowerCase())
        })

  return (
    <Combobox value={authorFilter} onChange={(value) => setAuthorFilter(value || { userid: "", name: "" })} onClose={() => setAuthorsQuery("")}>
      {({ open }) => (
        <>
          <div className="w-40 h-8 flex items-center justify-between rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none">
            <ComboboxInput
              placeholder={t("generic.author")}
              displayValue={() => authorFilter?.name || ""}
              onChange={(event) => setAuthorsQuery(event.target.value)}
              className="w-full h-full placeholder:text-zinc-600 bg-transparent outline-hidden pl-2"
            />
            <ComboboxButton className="h-full shrink-0 px-2 cursor-pointer">
              <PiCaretDownBold className={clsx("text-zinc-300 shrink-0 duration-200", open && "-rotate-180")} />
            </ComboboxButton>
          </div>

          <AnimatePresence>
            {open && (
              <ComboboxOptions static anchor="bottom start" className="w-40 z-600 mt-1 select-none rounded-sm overflow-hidden">
                <motion.ul
                  variants={DROPDOWN_MENU_WRAPPER_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full max-h-40 flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm overflow-y-scroll"
                >
                  <>
                    <ComboboxOption
                      as={motion.li}
                      variants={DROPDOWN_MENU_ITEM_VARIANTS}
                      value={undefined}
                      className="w-full h-8 px-2 py-1 shrink-0 flex items-center overflow-hidden odd:bg-zinc-800/30 cursor-pointer whitespace-nowrap text-ellipsis text-sm"
                    >
                      - {t("generic.everyone")} -
                    </ComboboxOption>
                    {filteredAuthors.slice(0, 20).map((author) => (
                      <ComboboxOption
                        as={motion.li}
                        variants={DROPDOWN_MENU_ITEM_VARIANTS}
                        key={author["userid"]}
                        value={author}
                        className="w-full h-8 px-2 py-1 shrink-0 flex items-center overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer whitespace-nowrap text-ellipsis text-sm"
                      >
                        {author["name"]}
                      </ComboboxOption>
                    ))}
                  </>
                </motion.ul>
              </ComboboxOptions>
            )}
          </AnimatePresence>
        </>
      )}
    </Combobox>
  )
}

function VersionsFilter({
  versionsFilter,
  setVersionsFilter
}: {
  versionsFilter: DownloadableModGameVersion[]
  setVersionsFilter: Dispatch<SetStateAction<DownloadableModGameVersion[]>>
}): JSX.Element {
  const { t } = useTranslation()

  const [gameVersionsList, setGameVersionsList] = useState<DownloadableModGameVersion[]>([])

  useEffect(() => {
    queryGameVersions()
  }, [])

  async function queryGameVersions(): Promise<void> {
    try {
      const res = await window.api.netManager.queryURL("https://mods.vintagestory.at/api/gameversions")
      const data = await JSON.parse(res)
      setGameVersionsList(data["gameversions"])
    } catch (err) {
      window.api.utils.logMessage("error", `[front] [mods] [features/mods/pages/ListMods.tsx] [VersionsFilter > queryGameVersions] Error fetching game versions.`)
      window.api.utils.logMessage("debug", `[front] [mods] [features/mods/pages/ListMods.tsx] [VersionsFilter > queryGameVersions] Error fetching game versions: ${err}`)
    }
  }

  return (
    <Listbox value={versionsFilter} onChange={setVersionsFilter} multiple>
      {({ open }) => (
        <>
          <ListboxButton className="w-40 h-8 px-2 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none cursor-pointer">
            <p className={clsx("flex gap-2 items-center overflow-hidden whitespace-nowrap text-ellipsis", versionsFilter.length < 1 && "text-zinc-600")}>
              {versionsFilter.length < 1 ? t("generic.versions") : versionsFilter.map((version) => version.name).join(", ")}
            </p>
            <PiCaretDownBold className={clsx("text-zinc-300 shrink-0 duration-200", open && "-rotate-180")} />
          </ListboxButton>

          <AnimatePresence>
            {open && (
              <ListboxOptions static anchor="bottom" className="w-40 z-600 mt-1 select-none rounded-sm overflow-hidden">
                <motion.ul
                  variants={DROPDOWN_MENU_WRAPPER_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full max-h-40 flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm overflow-y-scroll"
                >
                  {gameVersionsList.map((version) => (
                    <ListboxOption
                      key={version.tagid}
                      value={version}
                      as={motion.li}
                      variants={DROPDOWN_MENU_ITEM_VARIANTS}
                      className="w-full h-8 px-2 py-1 shrink-0 flex items-center overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer whitespace-nowrap text-ellipsis text-sm"
                    >
                      <p className="flex items-center gap-1">
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{version.name}</span>
                        {versionsFilter.includes(version) && <PiCheckBold className="text-zinc-400" />}
                      </p>
                    </ListboxOption>
                  ))}
                </motion.ul>
              </ListboxOptions>
            )}
          </AnimatePresence>
        </>
      )}
    </Listbox>
  )
}

function OrderFilter({
  orderBy,
  setOrderBy,
  orderByOrder,
  setOrderByOrder
}: {
  orderBy: string
  setOrderBy: Dispatch<SetStateAction<string>>
  orderByOrder: string
  setOrderByOrder: Dispatch<SetStateAction<string>>
}): JSX.Element {
  const { t } = useTranslation()

  const ORDER_BY = [
    { key: "trendingpoints", value: t("generic.trending"), icon: <PiFireFill /> },
    { key: "downloads", value: t("generic.downloads"), icon: <PiDownloadFill /> },
    { key: "comments", value: t("generic.comments"), icon: <PiChatCenteredDotsFill /> },
    { key: "lastreleased", value: t("generic.updated"), icon: <PiUploadFill /> },
    { key: "asset.created", value: t("generic.created"), icon: <PiCalendarBlankFill /> },
    { key: "follows", value: t("generic.follows"), icon: <PiStarFill /> }
  ]

  useEffect(() => {
    const lsOrderBy = window.localStorage.getItem("listModsOrderBy")
    if (lsOrderBy !== null && ORDER_BY.some((ob) => ob.key === lsOrderBy)) setOrderBy(lsOrderBy)

    const lsOrderByOrder = window.localStorage.getItem("listModsOrderByOrder")
    if (lsOrderByOrder !== null && (lsOrderByOrder === "desc" || lsOrderByOrder === "asc")) setOrderByOrder(lsOrderByOrder)
  }, [])

  function changeOrder(order: string): void {
    if (orderBy === order) {
      const newOrder = orderByOrder === "desc" ? "asc" : "desc"
      window.localStorage.setItem("listModsOrderByOrder", newOrder)
      setOrderByOrder(newOrder)
    } else {
      window.localStorage.setItem("listModsOrderBy", order)
      setOrderBy(order)
      window.localStorage.setItem("listModsOrderByOrder", "desc")
      setOrderByOrder("desc")
    }
  }

  return (
    <Menu>
      {({ open }) => (
        <>
          <MenuButton
            title={t("generic.order")}
            className="w-8 h-8 flex items-center justify-center gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none cursor-pointer text-lg"
          >
            <PiArrowsDownUpFill />
          </MenuButton>
          <AnimatePresence>
            {open && (
              <MenuItems static anchor="bottom" className="w-40 z-600 mt-1 select-none rounded-sm overflow-hidden">
                <motion.ul
                  variants={DROPDOWN_MENU_WRAPPER_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm"
                >
                  {ORDER_BY.map((ob) => (
                    <MenuItem
                      key={ob.key}
                      as={motion.li}
                      variants={DROPDOWN_MENU_ITEM_VARIANTS}
                      className="shrink-0 w-full h-8 flex items-center overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer whitespace-nowrap text-ellipsis text-sm px-2 py-1"
                    >
                      <NormalButton title={`${ob.value}`} onClick={() => changeOrder(ob.key)} className="w-full">
                        <div className="w-full flex items-center justify-between gap-1">
                          <p className="flex items-center gap-1">
                            <span>{ob.icon}</span>
                            <span>{ob.value}</span>
                          </p>
                          <p className="flex items-center gap-1">{orderBy === ob.key && (orderByOrder === "desc" ? <PiArrowDownBold /> : <PiArrowDownBold className="rotate-180" />)}</p>
                        </div>
                      </NormalButton>
                    </MenuItem>
                  ))}
                </motion.ul>
              </MenuItems>
            )}
          </AnimatePresence>
        </>
      )}
    </Menu>
  )
}

export default ListMods
