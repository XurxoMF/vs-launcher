import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PiCaretDownDuotone } from "react-icons/pi"
import { AnimatePresence, motion } from "motion/react"
import clsx from "clsx"

import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react"

import { DROPDOWN_MENU_ITEM_VARIANTS, DROPDOWN_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"

function LanguagesMenu(): JSX.Element {
  const { i18n, t } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState<string>(window.localStorage.getItem("lang") || "en-US")

  const getLanguages = (): { code: string; name: string; credits: string }[] => {
    const resources = i18n.options.resources
    if (!resources) return []
    return Object.keys(resources).map((code) => ({
      code,
      name: resources[code]?.name.toString() || code,
      credits: resources[code]?.credits.toString() || t("generic.byAnonymous")
    }))
  }

  const languages = getLanguages()

  const handleLanguageChange = (lang: string): void => {
    window.api.utils.logMessage("info", `[front] [localization] [components/ui/LanguagesMenu.tsx] [handleLanguageChange] Changing language to ${lang}.`)
    i18n.changeLanguage(lang)
    localStorage.setItem("lang", lang)
    setSelectedLanguage(lang)
  }

  return (
    <Listbox value={selectedLanguage} onChange={handleLanguageChange}>
      {({ open }) => (
        <>
          {languages
            .filter((lang) => lang.code === selectedLanguage)
            .map((lang) => (
              <ListboxButton
                key={lang.code}
                className="w-full h-8 px-2 py-1 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none cursor-pointer"
              >
                <p className="flex gap-2 items-center overflow-hidden whitespace-nowrap">
                  <span className="text-sm">{lang.name}</span>
                  <span className="text-ellipsis overflow-hidden text-zinc-400 text-xs">{lang.credits}</span>
                </p>
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
                  className="h-40 flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm overflow-y-scroll"
                >
                  {languages.map((lang) => (
                    <ListboxOption
                      key={lang.code}
                      value={lang.code}
                      as={motion.li}
                      variants={DROPDOWN_MENU_ITEM_VARIANTS}
                      className="w-full h-8 px-2 py-1 shrink-0 flex items-center overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer"
                    >
                      <p className="flex gap-2 items-center overflow-hidden whitespace-nowrap">
                        <span className="text-sm">{lang.name}</span>
                        <span className="text-ellipsis overflow-hidden text-zinc-400 text-xs">{lang.credits}</span>
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

export default LanguagesMenu
