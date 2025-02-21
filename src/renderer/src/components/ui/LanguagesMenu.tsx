import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PiCaretDownBold } from "react-icons/pi"
import { AnimatePresence, motion, Variants } from "motion/react"
import clsx from "clsx"

import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react"

const LISTGROUP_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.1,
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0 }
}

const LISTITEM_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
}

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
    window.api.utils.logMessage("info", `[component] [LanguagesMenu] Changing language to ${lang}`)
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
                className="w-full h-8 px-2 py-1 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none"
              >
                <p className="flex gap-2 items-center overflow-hidden whitespace-nowrap">
                  <span className="font-bold text-sm">{lang.name}</span>
                  <span className="text-ellipsis overflow-hidden text-zinc-400 text-xs">{lang.credits}</span>
                </p>
                <PiCaretDownBold className={clsx("text-zinc-300 shrink-0", open && "rotate-180")} />
              </ListboxButton>
            ))}

          <AnimatePresence>
            {open && (
              <ListboxOptions static anchor="bottom" className="w-[var(--button-width)] z-800 mt-2 select-none rounded-sm overflow-hidden">
                <motion.ul
                  variants={LISTGROUP_VARIANTS}
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
                      variants={LISTITEM_VARIANTS}
                      className="w-full h-8 px-2 py-1 shrink-0 flex items-center overflow-hidden odd:bg-zinc-800/30 cursor-pointer "
                    >
                      <p className="flex gap-2 items-center overflow-hidden whitespace-nowrap" title={`${lang.name} - ${lang.credits}`}>
                        <span className="font-bold text-sm">{lang.name}</span>
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
