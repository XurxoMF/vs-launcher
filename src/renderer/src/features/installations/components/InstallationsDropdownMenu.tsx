import { useTranslation, Trans } from "react-i18next"
import { PiCaretUpBold } from "react-icons/pi"
import { AnimatePresence, motion } from "motion/react"
import { Link } from "react-router-dom"
import clsx from "clsx"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"

import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react"

function InstallationsDropdownMenu(): JSX.Element {
  const { t } = useTranslation()

  const { config, configDispatch } = useConfigContext()

  return (
    <div className="w-full bg-zinc-850 rounded text-sm shadow shadow-zinc-950 hover:shadow-none">
      {config.installations.length < 1 ? (
        <div className="w-full flex flex-col items-center justify-between px-4 py-2">
          <p className="font-bold">{t("features.installations.noInstallationsFound")}</p>
          <p className="text-zinc-400 text-xs flex gap-1 items-center flex-wrap justify-center">
            <Trans
              i18nKey="features.installations.noInstallationsFoundDesc"
              components={{
                link: (
                  <Link to="/installations" className="text-vs">
                    {t("components.mainMenu.installationsTitle")}
                  </Link>
                )
              }}
            />
          </p>
        </div>
      ) : (
        <Listbox
          value={config.lastUsedInstallation}
          onChange={(selectedInstallation: string) => {
            configDispatch({
              type: CONFIG_ACTIONS.SET_LAST_USED_INSTALLATION,
              payload: selectedInstallation
            })
          }}
        >
          {({ open }) => (
            <>
              <ListboxButton className="w-full flex gap-2 items-center px-2 py-1">
                {config.lastUsedInstallation === null || !config.installations.some((installation) => installation.id === config.lastUsedInstallation) ? (
                  <div className="w-full flex items-center justify-between gap-2">
                    <p className="font-bold text-start">{t("features.installations.noInstallationSelected")}</p>
                    <div className="shrink-0 text-sm text-zinc-400 flex flex-col items-end justify-center">
                      <p>X.X.X</p>
                      <p>{t("features.mods.modsCount", { count: 0 })}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {config.installations.map(
                      (current) =>
                        current.id === config.lastUsedInstallation && (
                          <div key={current.id} className="w-full flex items-center justify-between gap-2">
                            <p className="font-bold text-start">{current.name}</p>
                            <div className="shrink-0 text-sm text-zinc-400 flex flex-col items-end justify-center">
                              <p>{current.version}</p>
                              <p>{t("features.mods.modsCount", { count: current._modsCount as number })}</p>
                            </div>
                          </div>
                        )
                    )}
                  </>
                )}
                <PiCaretUpBold className={clsx(open && "rotate-180", "text-sm text-zinc-400 shrink-0")} />
              </ListboxButton>
              <AnimatePresence>
                {open && (
                  <ListboxOptions
                    static
                    as={motion.div}
                    initial={{ height: 0 }}
                    animate={{ height: "fit-content" }}
                    exit={{ height: 0 }}
                    anchor="top"
                    className="w-[var(--button-width)] bg-zinc-850 shadow shadow-zinc-950 -translate-y-1 rounded text-sm"
                  >
                    <div className="flex flex-col max-h-80">
                      {config.installations.map((current) => (
                        <ListboxOption key={current.id} value={current.id} className="even:bg-zinc-800 cursor-pointer group">
                          <div key={current.id} className="w-full group-hover:pl-3 duration-100 flex items-center justify-between gap-2 px-2 py-1">
                            <p className="font-bold text-start">{current.name}</p>
                            <div className="shrink-0 text-sm text-zinc-400 flex flex-col items-end justify-center">
                              <p>{current.version}</p>
                              <p>{t("features.mods.modsCount", { count: current._modsCount as number })}</p>
                            </div>
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
      )}
    </div>
  )
}

export default InstallationsDropdownMenu
