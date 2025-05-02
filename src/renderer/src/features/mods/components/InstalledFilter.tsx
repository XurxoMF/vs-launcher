import clsx from "clsx"
import { AnimatePresence, motion } from "motion/react"
import { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"
import { PiCaretDownDuotone } from "react-icons/pi"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"

import { DROPDOWN_MENU_ITEM_VARIANTS, DROPDOWN_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"

function InstalledFilter({ installedFilter, setInstalledFilter }: { installedFilter: string; setInstalledFilter: Dispatch<SetStateAction<string>> }): JSX.Element {
  const { t } = useTranslation()

  const INSTALLED_FILTERS = [
    { key: "all", value: t("generic.all") },
    { key: "installed", value: t("generic.installed") },
    { key: "not-installed", value: t("generic.notInstalled") }
  ]

  return (
    <Listbox value={installedFilter} onChange={setInstalledFilter}>
      {({ open }) => (
        <>
          {INSTALLED_FILTERS.filter((i) => i.key === installedFilter).map((lang) => (
            <ListboxButton
              key={lang.key}
              className="w-28 h-8 px-2 py-1 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none cursor-pointer"
            >
              <p className="flex gap-2 items-center overflow-hidden whitespace-nowrap text-sm">{lang.value}</p>
              <PiCaretDownDuotone className={clsx("text-zinc-300 shrink-0 duration-200", open && "-rotate-180")} />
            </ListboxButton>
          ))}

          <AnimatePresence>
            {open && (
              <ListboxOptions static anchor="bottom" className="w-[var(--button-width)] z-600 mt-1 select-none rounded-sm overflow-hidden">
                <motion.ul
                  variants={DROPDOWN_MENU_WRAPPER_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm"
                >
                  {INSTALLED_FILTERS.map((i) => (
                    <ListboxOption
                      key={i.key}
                      value={i.key}
                      as={motion.li}
                      variants={DROPDOWN_MENU_ITEM_VARIANTS}
                      className="w-full h-8 px-2 py-1 shrink-0 flex items-center overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer"
                    >
                      <p className="flex gap-2 items-center overflow-hidden whitespace-nowrap text-sm" title={i.value}>
                        {i.value}
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

export default InstalledFilter
