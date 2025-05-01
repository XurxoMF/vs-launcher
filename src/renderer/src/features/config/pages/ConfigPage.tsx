import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { PiCaretDownDuotone, PiMagnifyingGlassDuotone } from "react-icons/pi"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import { AnimatePresence, motion } from "motion/react"
import clsx from "clsx"

import { DROPDOWN_MENU_ITEM_VARIANTS, DROPDOWN_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { FormBody, FormFieldGroup, FormHead, FormLabel, FromGroup, FromWrapper, FormGroupWrapper, FormButton, FormInputText } from "@renderer/components/ui/FormComponents"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import LanguagesMenu from "@renderer/components/ui/LanguagesMenu"

function ConfigPage(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()

  const { config, configDispatch } = useConfigContext()

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-4">
        <FromWrapper className="max-w-[50rem] w-full">
          <FormGroupWrapper>
            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.config.language")} />
              </FormHead>

              <FormBody>
                <LanguagesMenu />
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.config.uiScale")} />
              </FormHead>

              <FormBody>
                <UIScale />
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>

          <FormGroupWrapper>
            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.config.defaultInstallationsFolder")} />
              </FormHead>

              <FormBody>
                <FormFieldGroup alignment="x">
                  <FormButton
                    onClick={async () => {
                      const path = await window.api.utils.selectFolderDialog()
                      if (path && path.length > 0 && path[0].length > 0) {
                        if (!(await window.api.pathsManager.checkPathEmpty(path[0]))) addNotification(t("notifications.body.folderNotEmpty"), "warning")
                        configDispatch({ type: CONFIG_ACTIONS.SET_DEFAULT_INSTALLATIONS_FOLDER, payload: path[0] })
                      }
                    }}
                    title={t("generic.browse")}
                    className="px-2 py-1"
                  >
                    <PiMagnifyingGlassDuotone />
                  </FormButton>
                  <FormInputText value={config.defaultInstallationsFolder} readOnly className="w-full" />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.config.defaultVersionsFolder")} />
              </FormHead>

              <FormBody>
                <FormFieldGroup alignment="x">
                  <FormButton
                    onClick={async () => {
                      const path = await window.api.utils.selectFolderDialog()
                      if (path && path.length > 0 && path[0].length > 0) {
                        if (!(await window.api.pathsManager.checkPathEmpty(path[0]))) addNotification(t("notifications.body.folderNotEmpty"), "warning")
                        configDispatch({ type: CONFIG_ACTIONS.SET_DEFAULT_VERSIONS_FOLDER, payload: path[0] })
                      }
                    }}
                    title={t("generic.browse")}
                    className="px-2 py-1"
                  >
                    <PiMagnifyingGlassDuotone />
                  </FormButton>
                  <FormInputText value={config.defaultVersionsFolder} readOnly className="w-full" />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.config.backupsFolder")} />
              </FormHead>

              <FormBody>
                <FormFieldGroup alignment="x">
                  <FormButton
                    onClick={async () => {
                      const path = await window.api.utils.selectFolderDialog()
                      if (path && path.length > 0 && path[0].length > 0) {
                        if (!(await window.api.pathsManager.checkPathEmpty(path[0]))) addNotification(t("notifications.body.folderNotEmpty"), "warning")
                        configDispatch({ type: CONFIG_ACTIONS.SET_DEFAULT_BACKUPS_FOLDER, payload: path[0] })
                      }
                    }}
                    title={t("generic.browse")}
                    className="px-2 py-1"
                  >
                    <PiMagnifyingGlassDuotone />
                  </FormButton>
                  <FormInputText value={config.backupsFolder} readOnly className="w-full" />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>
        </FromWrapper>
      </div>
    </ScrollableContainer>
  )
}

function UIScale(): JSX.Element {
  const { t } = useTranslation()

  const SCALE_OPTIONS = [
    { key: 50, value: "50%" },
    { key: 75, value: "75%" },
    { key: 100, value: "100%" },
    { key: 125, value: "125%" },
    { key: 150, value: "150%" }
  ]

  const [selectedScale, setSelectedScale] = useState<number>(Number(window.localStorage.getItem("uiScale")) || 100)

  useEffect(() => {
    document.documentElement.setAttribute("data-zoom", selectedScale.toString())
    window.localStorage.setItem("uiScale", selectedScale.toString())
  }, [selectedScale])

  return (
    <Listbox value={selectedScale} onChange={setSelectedScale}>
      {({ open }) => (
        <>
          {SCALE_OPTIONS.filter((scale) => scale.key === selectedScale).map((scale) => (
            <ListboxButton
              key={scale.key}
              className="w-full h-8 px-2 py-1 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none cursor-pointer"
            >
              <p className="flex gap-2 items-center overflow-hidden whitespace-nowrap">
                <span className="text-sm">{scale.value}</span>
                {scale.key === 100 && <span className="text-ellipsis overflow-hidden text-zinc-500 text-xs">{t("generic.default")}</span>}
              </p>
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
                  {SCALE_OPTIONS.map((scale) => (
                    <ListboxOption
                      key={scale.key}
                      value={scale.key}
                      as={motion.li}
                      variants={DROPDOWN_MENU_ITEM_VARIANTS}
                      className="w-full h-8 px-2 py-1 shrink-0 flex items-center overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer"
                    >
                      <p className="flex gap-2 items-center overflow-hidden whitespace-nowrap">
                        <span className="text-sm">{scale.value}</span>
                        {scale.key === 100 && <span className="text-ellipsis overflow-hidden text-zinc-500 text-xs">{t("generic.default")}</span>}
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

export default ConfigPage
