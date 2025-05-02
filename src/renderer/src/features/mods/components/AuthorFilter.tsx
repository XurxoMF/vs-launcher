import clsx from "clsx"
import { AnimatePresence, motion } from "motion/react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { PiCaretDownDuotone } from "react-icons/pi"
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"

import { DROPDOWN_MENU_ITEM_VARIANTS, DROPDOWN_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"

function AuthorFilter({ authorFilter, setAuthorFilter }: { authorFilter: DownloadableModAuthorType; setAuthorFilter: Dispatch<SetStateAction<DownloadableModAuthorType>> }): JSX.Element {
  const { t } = useTranslation()

  const [authorsList, setAuthorsList] = useState<DownloadableModAuthorType[]>([])
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
          <div className="w-36 h-8 flex items-center justify-between rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none">
            <ComboboxInput
              placeholder={t("generic.author")}
              displayValue={() => authorFilter?.name || ""}
              onChange={(event) => setAuthorsQuery(event.target.value)}
              className="w-full h-full placeholder:text-zinc-600 bg-transparent outline-hidden pl-2"
            />
            <ComboboxButton className="h-full shrink-0 px-2 cursor-pointer">
              <PiCaretDownDuotone className={clsx("text-zinc-300 shrink-0 duration-200", open && "-rotate-180")} />
            </ComboboxButton>
          </div>

          <AnimatePresence>
            {open && (
              <ComboboxOptions static anchor="bottom start" className="w-36 z-600 mt-1 select-none rounded-sm overflow-hidden">
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

export default AuthorFilter
