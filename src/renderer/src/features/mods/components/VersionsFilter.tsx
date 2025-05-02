import { Dispatch, SetStateAction, useEffect, useState } from "react"
import clsx from "clsx"
import { AnimatePresence, motion } from "motion/react"
import { useTranslation } from "react-i18next"
import { PiCaretDownDuotone, PiCheckFatDuotone } from "react-icons/pi"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"

import { DROPDOWN_MENU_ITEM_VARIANTS, DROPDOWN_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"

function VersionsFilter({
  versionsFilter,
  setVersionsFilter
}: {
  versionsFilter: DownloadableModGameVersionType[]
  setVersionsFilter: Dispatch<SetStateAction<DownloadableModGameVersionType[]>>
}): JSX.Element {
  const { t } = useTranslation()

  const [gameVersionsList, setGameVersionsList] = useState<DownloadableModGameVersionType[]>([])

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
          <ListboxButton
            className="w-28 h-8 px-2 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none cursor-pointer"
            title={versionsFilter.map((v) => v.name).join(" · ")}
          >
            <p className={clsx("flex gap-1 items-center overflow-hidden whitespace-nowrap text-ellipsis overflow-x-scroll scrollbar-none", versionsFilter.length < 1 && "text-zinc-600")}>
              {versionsFilter.length < 1
                ? t("generic.versions")
                : versionsFilter.map((v) => (
                    <span className="text-sm px-1 rounded-sm bg-zinc-850/50" key={v.tagid}>
                      {v.name}
                    </span>
                  ))}
            </p>
            <PiCaretDownDuotone className={clsx("text-zinc-300 shrink-0 duration-200", open && "-rotate-180")} />
          </ListboxButton>

          <AnimatePresence>
            {open && (
              <ListboxOptions static anchor="bottom" className="w-[var(--button-width)] z-600 mt-1 select-none rounded-sm overflow-hidden">
                <motion.ul
                  variants={DROPDOWN_MENU_WRAPPER_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full max-h-40 flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm overflow-y-scroll"
                >
                  {gameVersionsList.map((v) => (
                    <ListboxOption
                      key={v.tagid}
                      value={v}
                      as={motion.li}
                      variants={DROPDOWN_MENU_ITEM_VARIANTS}
                      className="w-full h-8 px-2 py-1 shrink-0 flex items-center overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer whitespace-nowrap text-ellipsis text-sm"
                    >
                      <p className="flex items-center gap-1">
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{v.name}</span>
                        {versionsFilter.includes(v) && <PiCheckFatDuotone className="text-zinc-400" />}
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

export default VersionsFilter
