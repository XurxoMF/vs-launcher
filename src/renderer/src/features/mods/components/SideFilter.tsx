import clsx from "clsx"
import { AnimatePresence, motion } from "motion/react"
import { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"
import { PiCaretDownDuotone } from "react-icons/pi"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"

import { DROPDOWN_MENU_ITEM_VARIANTS, DROPDOWN_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"

function SideFilter({ sideFilter, setSideFilter, size = "w-full h-8" }: { sideFilter: string; setSideFilter: Dispatch<SetStateAction<string>>; size?: string }): JSX.Element {
  const { t } = useTranslation()

  const SIDE_FILTERS = [
    { key: "any", value: t("generic.any") },
    { key: "both", value: t("generic.both") },
    { key: "server", value: t("generic.server") },
    { key: "client", value: t("generic.client") }
  ]

  return (
    <Listbox value={sideFilter} onChange={setSideFilter}>
      {({ open }) => (
        <>
          {SIDE_FILTERS.filter((side) => side.key === sideFilter).map((lang) => (
            <ListboxButton
              key={lang.key}
              className={clsx(
                "px-2 py-1 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none cursor-pointer",
                size
              )}
            >
              <p className="flex gap-2 items-center overflow-hidden whitespace-nowrap text-sm">{lang.value}</p>
              <PiCaretDownDuotone className={clsx("shrink-0 duration-200", open && "-rotate-180")} />
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
                  {SIDE_FILTERS.map((side) => (
                    <ListboxOption
                      key={side.key}
                      value={side.key}
                      as={motion.li}
                      variants={DROPDOWN_MENU_ITEM_VARIANTS}
                      className="w-full h-8 px-2 py-1 shrink-0 flex items-center overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer"
                    >
                      <p className="flex gap-2 items-center overflow-hidden whitespace-nowrap text-sm" title={side.value}>
                        {side.value}
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

export default SideFilter
