import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PiCaretDownBold } from "react-icons/pi"
import { AnimatePresence, motion } from "motion/react"
import clsx from "clsx"

import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react"

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
          <ListboxButton className="bg-zinc-850 shadow shadow-zinc-950 hover:shadow-none w-full h-7 flex items-center justify-between gap-2 rounded overflow-hidden">
            {languages
              .filter((lang) => lang.code === selectedLanguage)
              .map((lang) => (
                <div key={lang.code} className="flex gap-2 px-2 py-1 items-center overflow-hidden">
                  <p className="whitespace-nowrap font-bold text-sm">{lang.name}</p>
                  <p className="whitespace-nowrap text-ellipsis overflow-hidden text-zinc-500 text-xs">{lang.credits}</p>
                </div>
              ))}
            <PiCaretDownBold className={clsx(open && "rotate-180", "text-sm text-zinc-400 shrink-0 mr-2")} />
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
                className="w-[var(--button-width)] bg-zinc-850 shadow shadow-zinc-950 translate-y-1 rounded"
              >
                <div className="flex flex-col max-h-40">
                  {languages.map((lang) => (
                    <ListboxOption key={lang.code} value={lang.code} className="hover:pl-1 duration-100 odd:bg-zinc-850 even:bg-zinc-800">
                      <div className="flex gap-2 h-7 px-2 py-1 items-center overflow-hidden" title={`${lang.name} - ${lang.credits}`}>
                        <p className="whitespace-nowrap font-bold text-sm">{lang.name}</p>
                        <p className="text-zinc-500 text-xs whitespace-nowrap text-ellipsis overflow-hidden">{lang.credits}</p>
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

export default LanguagesMenu
