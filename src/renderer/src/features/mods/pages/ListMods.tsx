import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
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
  PiFireFill
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
  MenuItems
} from "@headlessui/react"
import clsx from "clsx"

import { FormInputText } from "@renderer/components/ui/FormComponents"

function ListMods(): JSX.Element {
  const { t } = useTranslation()

  const [modsList, setModsList] = useState([])
  const [authorsList, setAuthorsList] = useState([])
  const [authorsQuery, setAuthorsQuery] = useState("")
  const [gameVersionsList, setGameVersionsList] = useState<{ tagid: string; name: string; color: string }[]>([])

  const [visibleMods, setVisibleMods] = useState(20)

  const [textFilter, setTextFilter] = useState<string>("")
  const [authorFilter, setAuthorFilter] = useState<{ userid: string; name: string }>({ userid: "", name: "" })
  const [versionsFilter, setVersionsFilter] = useState<{ tagid: string; name: string; color: string }[]>([])

  const [orderBy, setOrderBy] = useState("follows")
  const [orderByOrder, setOrderByOrder] = useState("desc")

  const [searching, setSearching] = useState(true)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    queryAuthors()
    queryGameVersions()
  }, [])

  useEffect(() => {
    const container = document.getElementById("modlist-scroll")

    const handleScroll = (): void => {
      if (!container) return
      const { scrollTop, clientHeight, scrollHeight } = container
      if (scrollTop + clientHeight >= scrollHeight - 10) setVisibleMods((prev) => prev + 20)
    }

    const checkLoadMore = (): void => {
      if (container && container.scrollHeight <= container.clientHeight) setVisibleMods((prev) => prev + 20)
    }

    if (container) {
      container.addEventListener("scroll", handleScroll)
      checkLoadMore()
    }

    return (): void => {
      if (container) container.removeEventListener("scroll", handleScroll)
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

  async function queryAuthors(): Promise<void> {
    try {
      const res = await axios("/moddbapi/authors")
      setAuthorsList(res.data["authors"])
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching authors: ${err}`)
    }
  }

  async function queryGameVersions(): Promise<void> {
    try {
      const res = await axios("/moddbapi/gameversions")
      setGameVersionsList(res.data["gameversions"])
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching game versions: ${err}`)
    }
  }

  async function queryMods(): Promise<void> {
    try {
      setSearching(true)

      let filters = `?`
      if (textFilter.length > 1) filters += `&text=${textFilter}`
      if (authorFilter.name.length > 1) filters += `&author=${authorFilter.userid}`
      if (versionsFilter.length > 0) filters += versionsFilter.map((version) => `&gameversions[]=${version.tagid}`).join("")
      filters += `&orderby=${orderBy}&orderdirection=${orderByOrder}`

      const res = await axios(`/moddbapi/mods${filters}`)
      setSearching(false)
      setModsList(res.data["mods"])
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [ListMods] Error fetching mod: ${err}`)
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
    <>
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
                        <MenuItem>
                          <button
                            onClick={() => changeOrder("trendingpoints")}
                            className="px-2 py-1 rounded hover:pl-3 duration-100 odd:bg-zinc-850 even:bg-zinc-800 flex gap-2 items-center justify-between"
                          >
                            <span className="flex gap-1 items-center">
                              <PiFireFill />
                              {t("generic.trending")}
                            </span>
                            {orderBy === "trendingpoints" && (orderByOrder === "desc" ? <PiArrowDownBold /> : <PiArrowDownBold className="rotate-180" />)}
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => changeOrder("downloads")}
                            className="px-2 py-1 rounded hover:pl-3 duration-100 odd:bg-zinc-850 even:bg-zinc-800 flex gap-2 items-center justify-between"
                          >
                            <span className="flex gap-1 items-center">
                              <PiDownloadFill />
                              {t("generic.downloads")}
                            </span>
                            {orderBy === "downloads" && (orderByOrder === "desc" ? <PiArrowDownBold /> : <PiArrowDownBold className="rotate-180" />)}
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => changeOrder("comments")}
                            className="px-2 py-1 rounded hover:pl-3 duration-100 odd:bg-zinc-850 even:bg-zinc-800 flex gap-2 items-center justify-between"
                          >
                            <span className="flex gap-1 items-center">
                              <PiChatCenteredDotsFill />
                              {t("generic.comments")}
                            </span>
                            {orderBy === "comments" && (orderByOrder === "desc" ? <PiArrowDownBold /> : <PiArrowDownBold className="rotate-180" />)}
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => changeOrder("lastreleased")}
                            className="px-2 py-1 rounded hover:pl-3 duration-100 odd:bg-zinc-850 even:bg-zinc-800 flex gap-2 items-center justify-between"
                          >
                            <span className="flex gap-1 items-center">
                              <PiUploadFill />
                              {t("generic.updated")}
                            </span>
                            {orderBy === "lastreleased" && (orderByOrder === "desc" ? <PiArrowDownBold /> : <PiArrowDownBold className="rotate-180" />)}
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => changeOrder("asset.created")}
                            className="px-2 py-1 rounded hover:pl-3 duration-100 odd:bg-zinc-850 even:bg-zinc-800 flex gap-2 items-center justify-between"
                          >
                            <span className="flex gap-1 items-center">
                              <PiCalendarBlankFill />
                              {t("generic.created")}
                            </span>
                            {orderBy === "asset.created" && (orderByOrder === "desc" ? <PiArrowDownBold /> : <PiArrowDownBold className="rotate-180" />)}
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button onClick={() => changeOrder("follows")} className="px-2 py-1 rounded hover:pl-3 duration-100 odd:bg-zinc-850 even:bg-zinc-800 flex gap-2 items-center justify-between">
                            <span className="flex gap-1 items-center">
                              <PiStarFill />
                              {t("generic.follows")}
                            </span>
                            {orderBy === "follows" && (orderByOrder === "desc" ? <PiArrowDownBold /> : <PiArrowDownBold className="rotate-180" />)}
                          </button>
                        </MenuItem>
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
                  <Link
                    to={`/mods/${mod["modid"]}`}
                    className="w-full h-full flex flex-col rounded bg-zinc-800 shadow shadow-zinc-900 group-hover:shadow-lg group-hover:shadow-zinc-900 absolute group-hover:h-64 group-hover:-translate-y-4 z-0 group-hover:z-20 duration-100 overflow-hidden"
                  >
                    <img
                      src={mod["logo"] ? `/moddbfiles/${mod["logo"]}` : "/moddbfiles/web/img/mod-default.png"}
                      alt={mod["name"]}
                      className="h-32 aspect-video object-cover object-center bg-zinc-850 rounded"
                    />
                    <div className="w-full h-16 group-hover:h-32 duration-100 px-2 py-1">
                      <div className="w-full h-full text-center relative flex flex-col gap-1">
                        <p className="shrink-0 overflow-hidden whitespace-nowrap text-ellipsis">{mod["name"]}</p>

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
                  </Link>
                </div>
              ))}
            </>
          )}
        </>
      </div>
    </>
  )
}

export default ListMods
