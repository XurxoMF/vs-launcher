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
  PiUserBold
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

import { useQueryMods } from "../hooks/useQueryMods"

import { FormButton, FormInputText } from "@renderer/components/ui/FormComponents"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import { GridGroup, GridItem, GridWrapper } from "@renderer/components/ui/Grid"
import InstallModPopup from "../components/InstallModPopup"

function ListMods(): JSX.Element {
  const { t } = useTranslation()
  const { config } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  const queryMods = useQueryMods()

  const [modsList, setModsList] = useState<DownloadableModOnList[]>([])
  const [visibleMods, setVisibleMods] = useState<number>(20)

  const [textFilter, setTextFilter] = useState<string>("")
  const [authorFilter, setAuthorFilter] = useState<DownloadableModAuthor>({ userid: "", name: "" })
  const [versionsFilter, setVersionsFilter] = useState<DownloadableModGameVersion[]>([])
  const [orderBy, setOrderBy] = useState<string>("follows")
  const [orderByOrder, setOrderByOrder] = useState<string>("desc")

  const [searching, setSearching] = useState<boolean>(true)
  const [scrTop, setScrTop] = useState(0)

  const [modToInstall, setModToInstall] = useState<string | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const handleScroll = (): void => {
    if (!scrollRef.current) return
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

  // Query mods when filters change.
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(async () => {
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
      setModsList(mods)
      timeoutRef.current = null
    }, 400)

    return (): void => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [textFilter, authorFilter, versionsFilter, orderBy, orderByOrder])

  function clearFilters(): void {
    setTextFilter("")
    setAuthorFilter({ userid: "", name: "" })
    setVersionsFilter([])
  }

  return (
    <ScrollableContainer ref={scrollRef}>
      <div className="w-full min-h-full flex flex-col justify-center gap-6">
        <div className="sticky top-0 z-10 w-full flex items-center justify-center">
          <div
            className={clsx(
              "relative rounded border border-zinc-400/5 shadow shadow-zinc-950/50 p-2 duration-200",
              "before:absolute before:left-0 before:top-0 before:w-full before:h-full before:backdrop-blur-sm",
              scrTop > 20 ? "bg-zinc-800" : "bg-zinc-950/15"
            )}
          >
            <div className="relative flex items-center justify-center gap-2 z-10">
              <FormInputText placeholder={t("generic.text")} value={textFilter} onChange={(e) => setTextFilter(e.target.value)} className="w-40" />

              <AuthorFilter authorFilter={authorFilter} setAuthorFilter={setAuthorFilter} />

              <VersionsFilter versionsFilter={versionsFilter} setVersionsFilter={setVersionsFilter} />

              <FormButton title={t("generic.clearFilter")} onClick={() => clearFilters()} className="w-8 h-8 text-lg">
                <PiEraserFill />
              </FormButton>

              <OrderFilter orderBy={orderBy} setOrderBy={setOrderBy} orderByOrder={orderByOrder} setOrderByOrder={setOrderByOrder} />

              <div className="w-8 h-8 flex items-center justify-center rounded bg-zinc-950/25 text-lg text-zinc-300" title={searching ? t("generic.searching") : t("generic.waitingForChanges")}>
                {searching ? <FiLoader className="animate-spin" /> : <PiCheckBold />}
              </div>
            </div>
          </div>
        </div>

        <GridWrapper className="w-full">
          {modsList.length < 1 ? (
            <div className="w-full h-[calc(100vh-10.1rem)] flex flex-col items-center justify-center gap-2">
              <p className="w-1/2 p-6 text-center text-2xl rounded bg-zinc-950/50 backdrop-blur-sm shadow shadow-zinc-950/50">
                {searching ? t("features.mods.searching") : t("features.mods.noMatchingFilters")}
              </p>
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
                    <p className="font-bold">{mod.name}</p>
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
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching authors: ${err}`)
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
          <div className="w-40 h-8 backdrop-blur-sm border border-zinc-400/5 bg-zinc-950/50 shadow shadow-zinc-950/50 hover:shadow-none rounded flex items-center justify-between gap-2 overflow-hidden">
            <ComboboxInput
              placeholder={t("generic.author")}
              displayValue={() => authorFilter?.name || ""}
              onChange={(event) => setAuthorsQuery(event.target.value)}
              className="w-full px-2 py-1 placeholder:text-zinc-600 bg-transparent outline-none"
            />
            <ComboboxButton className="w-8">
              <PiCaretDownBold className={clsx(open && "rotate-180", "text-sm shrink-0")} />
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
                className="w-40 rounded bg-zinc-850 shadow shadow-zinc-950/50 mt-1 z-[100]"
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
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching game versions: ${err}`)
    }
  }

  return (
    <Listbox value={versionsFilter} onChange={setVersionsFilter} multiple>
      {({ open }) => (
        <>
          <ListboxButton className="w-40 h-8 rounded backdrop-blur-sm border border-zinc-400/5 bg-zinc-950/50 shadow shadow-zinc-950/50 hover:shadow-none flex items-center justify-between gap-2 overflow-hidden">
            <span className={clsx("w-full px-2 py-1 text-start overflow-hidden whitespace-nowrap text-ellipsis", versionsFilter.length < 1 && "text-zinc-600")}>
              {versionsFilter.length < 1 ? t("generic.versions") : versionsFilter.map((version) => version.name).join(", ")}
            </span>
            <PiCaretDownBold className={clsx(open && "rotate-180", "w-8 text-sm shrink-0")} />
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

  function changeOrder(order: string): void {
    if (orderBy === order) {
      setOrderByOrder((prev) => (prev === "desc" ? "asc" : "desc"))
    } else {
      setOrderBy(order)
      setOrderByOrder("desc")
    }
  }

  return (
    <Menu>
      {({ open }) => (
        <>
          <MenuButton
            title={t("generic.order")}
            className="w-8 h-8 backdrop-blur-sm border border-zinc-400/5 bg-zinc-950/50 shadow shadow-zinc-950/50 hover:shadow-none flex items-center justify-center text-lg rounded"
          >
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
  )
}

export default ListMods
