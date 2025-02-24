import { useTranslation, Trans } from "react-i18next"
import { PiCaretUpBold } from "react-icons/pi"
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react"
import { AnimatePresence, motion } from "motion/react"
import clsx from "clsx"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"

import { DROPUP_MENU_ITEM_VARIANTS, DROPUP_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"
import { LinkButton } from "@renderer/components/ui/Buttons"

function InstallationsDropdownMenu(): JSX.Element {
  const { t } = useTranslation()

  const { config, configDispatch } = useConfigContext()

  return (
    <div className="w-full">
      {config.installations.length < 1 ? (
        <div className="w-full flex flex-col items-center justify-between rounded-sm backdrop-blur-xs bg-zinc-950/50 border border-zinc-400/5 group overflow-hidden shadow-sm shadow-zinc-950/50 px-4 py-2 text-center">
          <p className="font-bold">{t("features.installations.noInstallationsFound")}</p>
          <p className="text-zinc-400 text-xs flex gap-1 items-center flex-wrap justify-center">
            <Trans
              i18nKey="features.installations.noInstallationsFoundDesc"
              components={{
                link: (
                  <LinkButton title={t("components.mainMenu.installationsTitle")} to="/installations" className="text-vsl">
                    {t("components.mainMenu.installationsTitle")}
                  </LinkButton>
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
              <ListboxButton className="w-full h-14 px-2 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none text-sm text-start cursor-pointer">
                {config.installations
                  .filter((i) => i.id === config.lastUsedInstallation)
                  .map((current) => (
                    <div key={current.id} className="w-full flex flex-col justify-around overflow-hidden">
                      <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">{current.name}</p>

                      <div className="shrink-0 text-zinc-400 flex gap-2 items-start">
                        <p>{current.version}</p>
                        <p>{t("features.mods.modsCount", { count: current._modsCount })}</p>
                      </div>
                    </div>
                  ))}
                <PiCaretUpBold className={clsx("text-zinc-300 duration-200 shrink-0", open && "-rotate-180")} />
              </ListboxButton>

              <AnimatePresence>
                {open && (
                  <ListboxOptions static anchor="top" className="w-[var(--button-width)] z-600 -translate-y-1 select-none rounded-sm overflow-hidden">
                    <motion.ul
                      variants={DROPUP_MENU_WRAPPER_VARIANTS}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="max-h-40 flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm overflow-y-scroll text-sm"
                    >
                      {config.installations.toReversed().map((current) => (
                        <ListboxOption
                          key={current.id}
                          value={current.id}
                          as={motion.li}
                          variants={DROPUP_MENU_ITEM_VARIANTS}
                          className="w-full h-14 px-2 py-1 shrink-0 flex items-center overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer text-start"
                        >
                          <div className="w-full flex flex-col justify-around gap-1">
                            <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">{current.name}</p>

                            <div className="shrink-0 text-zinc-400 flex gap-2 items-start">
                              <p>{current.version}</p>
                              <p>{t("features.mods.modsCount", { count: current._modsCount })}</p>
                            </div>
                          </div>
                        </ListboxOption>
                      ))}
                    </motion.ul>
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
