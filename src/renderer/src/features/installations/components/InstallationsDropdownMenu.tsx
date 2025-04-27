import { useTranslation, Trans } from "react-i18next"
import { PiCaretUpDuotone } from "react-icons/pi"
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react"
import { AnimatePresence, motion } from "motion/react"
import clsx from "clsx"

import { INSTALLATION_ICONS } from "@renderer/utils/installationIcons"
import { DROPUP_MENU_ITEM_VARIANTS, DROPUP_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"

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
              {config.installations
                .filter((i) => i.id === config.lastUsedInstallation)
                .map((current) => (
                  <ListboxButton
                    key={current.id}
                    className="w-full h-14 p-1 pr-2 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none text-sm text-start cursor-pointer"
                  >
                    <img
                      src={
                        INSTALLATION_ICONS.some((ii) => ii.id === current.icon)
                          ? INSTALLATION_ICONS.find((ii) => ii.id === current.icon)?.icon
                          : config.customIcons.some((ii) => ii.id === current.icon)
                            ? `icons:${config.customIcons.find((ii) => ii.id === current.icon)?.icon}`
                            : INSTALLATION_ICONS[0].icon
                      }
                      alt={t("generic.icon")}
                      className="h-full aspect-square object-cover rounded-sm"
                    />

                    <div key={current.id} className="w-full flex flex-col justify-around overflow-hidden">
                      <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">{current.name}</p>

                      <div className="shrink-0 text-zinc-400 flex gap-2 items-start">
                        <p>{current.version}</p>
                        <p>{t("features.mods.modsCount", { count: current._modsCount })}</p>
                      </div>
                    </div>
                    <PiCaretUpDuotone className={clsx("text-zinc-300 duration-200 shrink-0", open && "-rotate-180")} />
                  </ListboxButton>
                ))}

              <AnimatePresence>
                {open && (
                  <ListboxOptions static anchor="top" className="w-[var(--button-width)] z-600 -translate-y-1 select-none rounded-sm overflow-hidden">
                    <motion.ul
                      variants={DROPUP_MENU_WRAPPER_VARIANTS}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="max-h-80 flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm overflow-y-scroll text-sm"
                    >
                      {config.installations.toReversed().map((current) => (
                        <ListboxOption
                          key={current.id}
                          value={current.id}
                          as={motion.li}
                          variants={DROPUP_MENU_ITEM_VARIANTS}
                          className="w-full h-14 p-1 flex items-center justify-between gap-2 overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer text-start border border-transparent"
                        >
                          <img
                            src={
                              INSTALLATION_ICONS.some((ii) => ii.id === current.icon)
                                ? INSTALLATION_ICONS.find((ii) => ii.id === current.icon)?.icon
                                : config.customIcons.some((ii) => ii.id === current.icon)
                                  ? `icons:${config.customIcons.find((ii) => ii.id === current.icon)?.icon}`
                                  : INSTALLATION_ICONS[0].icon
                            }
                            alt={t("generic.icon")}
                            className="h-full aspect-square object-cover rounded-sm"
                          />

                          <div key={current.id} className="w-full flex flex-col justify-around overflow-hidden">
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
