import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation, Trans } from "react-i18next"
import { Button, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import { PiCaretDownDuotone, PiFloppyDiskBackDuotone, PiPlusCircleDuotone, PiXCircleDuotone } from "react-icons/pi"
import semver from "semver"
import clsx from "clsx"
import { AnimatePresence, motion } from "motion/react"

import { INSTALLATION_ICONS } from "@renderer/utils/installationIcons"
import { DROPDOWN_MENU_ITEM_VARIANTS, DROPDOWN_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"

import {
  FormBody,
  FormHead,
  FormLabel,
  FromGroup,
  FromWrapper,
  ButtonsWrapper,
  FormFieldGroupWithDescription,
  FormInputText,
  FormFieldDescription,
  FormLinkButton,
  FormGroupWrapper,
  FormInputNumber,
  FormToggle,
  FormButton
} from "@renderer/components/ui/FormComponents"
import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import { LinkButton } from "@renderer/components/ui/Buttons"
import { AddCustomIconPupup } from "@renderer/components/ui/AddCustomIconPupup"

function EditInslallation(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const navigate = useNavigate()

  const { id } = useParams()

  const [installation, setInstallation] = useState<InstallationType | undefined>(config.installations.find((igv) => igv.id === id))

  const [icon, setIcon] = useState<IconType>(INSTALLATION_ICONS[0])
  const [name, setName] = useState<string>("")
  const [version, setVersion] = useState<GameVersionType>([...config.gameVersions].sort((a, b) => semver.compare(b.version, a.version))[0])
  const [startParams, setStartParams] = useState<string>("")
  const [backupsLimit, setBackupsLimit] = useState<number>(0)
  const [backupsAuto, setBackupsAuto] = useState<boolean>(false)
  const [compressionLevel, setCompressionLevel] = useState<number>(6)
  const [mesaGlThread, setMesaGlThread] = useState<boolean>(false)
  const [envVars, setEnvVars] = useState<string>("")

  const [addIcon, setAddIcon] = useState<boolean>(false)

  useEffect(() => {
    setInstallation(config.installations.find((igv) => igv.id === id))
  }, [id])

  useEffect(() => {
    setIcon(INSTALLATION_ICONS.find((ii) => ii.id === installation?.icon) ?? config.customIcons.find((ii) => ii.id === installation?.icon) ?? INSTALLATION_ICONS[0])
    setName(installation?.name ?? "")
    setVersion(config.gameVersions.find((gv) => gv.version === installation?.version) ?? config.gameVersions[0])
    setStartParams(installation?.startParams ?? "")
    setBackupsLimit(installation?.backupsLimit ?? 0)
    setBackupsAuto(installation?.backupsAuto ?? false)
    setCompressionLevel(installation?.compressionLevel ?? 6)
    setMesaGlThread(installation?.mesaGlThread ?? false)
    setEnvVars(installation?.envVars ?? "")
  }, [installation])

  const handleEditInstallation = async (): Promise<void> => {
    if (!installation) return addNotification(t("features.installations.noInstallationFound"), "error")
    if (installation._backuping) return addNotification(t("features.backups.backupInProgress"), "error")
    if (installation._playing) return addNotification(t("features.installations.editWhilePlaying"), "error")
    if (installation._restoringBackup) return addNotification(t("features.backups.restoreInProgress"), "error")

    if (!id || !name || !version || !backupsLimit || backupsAuto === undefined) return addNotification(t("notifications.body.missingFields"), "error")

    if (name.length < 5 || name.length > 50) return addNotification(t("features.installations.installationNameMinMaxCharacters"), "error")

    if (startParams.includes("--dataPath")) return addNotification(t("features.installations.cantUseDataPath"), "error")

    try {
      configDispatch({
        type: CONFIG_ACTIONS.EDIT_INSTALLATION,
        payload: { id, updates: { name, icon: icon.id, version: version.version, startParams, backupsAuto, backupsLimit, compressionLevel, mesaGlThread, envVars } }
      })
      addNotification(t("features.installations.installationSuccessfullyEdited"), "success")
      navigate("/installations")
    } catch (error) {
      addNotification(t("features.installations.errorEditingInstallation"), "error")
    }
  }

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-4">
        <FromWrapper className="max-w-[50rem] w-full">
          {!installation ? (
            <div className="w-full flex flex-col items-center justify-center gap-2 rounded-sm bg-zinc-950/50 p-4">
              <p className="text-2xl">{t("features.installations.noInstallationFound")}</p>
              <p className="w-full flex gap-1 items-center justify-center">{t("features.installations.noInstallationFoundDesc")}</p>
            </div>
          ) : (
            <>
              <FormGroupWrapper title={t("generic.basics")}>
                <FromGroup>
                  <FormHead>
                    <FormLabel content={t("features.installations.name")} />
                  </FormHead>

                  <FormBody>
                    <FormFieldGroupWithDescription>
                      <FormInputText value={name} onChange={(e) => setName(e.target.value)} minLength={5} maxLength={50} placeholder={t("features.installations.defaultName")} />
                      <FormFieldDescription content={t("generic.minMaxLength", { min: 5, max: 50 })} />
                    </FormFieldGroupWithDescription>
                  </FormBody>
                  <Listbox
                    value={icon}
                    onChange={(seletedIcon: IconType) => {
                      setIcon(seletedIcon)
                    }}
                  >
                    {({ open }) => (
                      <>
                        <ListboxButton className="w-1/3 h-13 p-1 pr-2 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none text-sm text-start cursor-pointer">
                          <div className="w-full h-full flex items-center gap-1">
                            <img src={icon.custom ? `icons:${icon.icon}` : icon.icon} alt={t("generic.icon")} className="h-full aspect-square object-cover rounded-sm" />
                            <p>{icon.name}</p>
                          </div>
                          <PiCaretDownDuotone className={clsx("text-zinc-300 duration-200 shrink-0", open && "rotate-180")} />
                        </ListboxButton>

                        <AnimatePresence>
                          {open && (
                            <ListboxOptions static anchor="bottom" className="w-[var(--button-width)] z-600 translate-y-1 select-none rounded-sm overflow-hidden">
                              <motion.ul
                                variants={DROPDOWN_MENU_WRAPPER_VARIANTS}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="max-h-80 flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm overflow-y-scroll text-sm"
                              >
                                <ListboxOption
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setAddIcon(true)
                                  }}
                                  value={icon}
                                  as={motion.li}
                                  variants={DROPDOWN_MENU_ITEM_VARIANTS}
                                  className="w-full h-13 p-1 shrink-0 flex items-center gap-1 overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer text-start"
                                >
                                  <div className="w-full h-full flex items-center gap-2">
                                    <span className="h-full aspect-square flex items-center justify-center">
                                      <PiPlusCircleDuotone className="text-3xl text-zinc-400/25 group-hover:scale-95 duration-200" />
                                    </span>
                                    <p>{t("generic.addIcon")}</p>
                                  </div>
                                </ListboxOption>
                                {config.customIcons.map((current) => (
                                  <ListboxOption
                                    key={current.id}
                                    value={current}
                                    as={motion.li}
                                    variants={DROPDOWN_MENU_ITEM_VARIANTS}
                                    className="w-full h-13 p-1 shrink-0 flex items-center gap-1 overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer text-start"
                                  >
                                    <div className="w-full h-full flex items-center gap-2">
                                      <img src={`icons:${current.icon}`} alt={t("generic.icon")} className="h-full aspect-square object-cover rounded-sm" />
                                      <p>{current.name}</p>
                                    </div>
                                  </ListboxOption>
                                ))}
                                {INSTALLATION_ICONS.map((current) => (
                                  <ListboxOption
                                    key={current.id}
                                    value={current}
                                    as={motion.li}
                                    variants={DROPDOWN_MENU_ITEM_VARIANTS}
                                    className="w-full h-13 p-1 shrink-0 flex items-center gap-1 overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer text-start"
                                  >
                                    <div className="w-full h-full flex items-center gap-2">
                                      <img src={current.icon} alt={t("generic.icon")} className="h-full aspect-square object-cover rounded-sm" />
                                      <p>{current.name}</p>
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
                </FromGroup>

                <FromGroup>
                  <FormHead>
                    <FormLabel content={t("features.versions.labelGameVersion")} />
                  </FormHead>

                  <FormBody>
                    <TableWrapper>
                      <TableHead>
                        <TableHeadRow>
                          <TableCell className="w-full text-center">{t("generic.version")}</TableCell>
                        </TableHeadRow>
                      </TableHead>

                      <TableBody className="max-h-[14rem]">
                        {config.gameVersions.length < 1 && (
                          <div className="w-full p-1 flex flex-col items-center justify-center">
                            <p>{t("features.versions.noVersionsFound")}</p>
                            <p className="text-zinc-400 text-sm flex gap-1 items-center flex-wrap justify-center">
                              <Trans
                                i18nKey="features.versions.noVersionsFoundDesc"
                                components={{
                                  link: (
                                    <LinkButton title={t("components.mainMenu.versionsTitle")} to="/versions" className="text-vsl">
                                      {t("components.mainMenu.versionsTitle")}
                                    </LinkButton>
                                  )
                                }}
                              />
                            </p>
                          </div>
                        )}
                        {config.gameVersions
                          .slice()
                          .sort((a, b) => semver.rcompare(a.version, b.version))
                          .map((gv) => (
                            <TableBodyRow key={gv.version} onClick={() => setVersion(gv)} selected={version?.version === gv.version}>
                              <TableCell className="w-full">{gv.version}</TableCell>
                            </TableBodyRow>
                          ))}
                      </TableBody>
                    </TableWrapper>
                  </FormBody>
                </FromGroup>
              </FormGroupWrapper>

              <FormGroupWrapper title={t("generic.backups")}>
                <FromGroup>
                  <FormHead>
                    <FormLabel content={t("features.backups.backupsAmount")} />
                  </FormHead>

                  <FormBody>
                    <FormFieldGroupWithDescription>
                      <FormInputNumber
                        placeholder={t("features.backups.backupsLimit")}
                        value={backupsLimit}
                        onChange={(e) => setBackupsLimit(Number(e.target.value))}
                        min={0}
                        max={10}
                        className="w-full"
                      />
                      <FormFieldDescription content={t("generic.minMaxAmmount", { min: 0, max: 10 })} />
                    </FormFieldGroupWithDescription>
                  </FormBody>
                </FromGroup>

                <FromGroup className="items-center">
                  <FormHead>
                    <FormLabel content={t("features.backups.automaticBackups")} className="max-h-6" />
                  </FormHead>

                  <FormBody>
                    <FormFieldGroupWithDescription alignment="x">
                      <FormToggle title={t("features.backups.backupsAuto")} value={backupsAuto} onChange={setBackupsAuto} />
                      <FormFieldDescription content={t("features.backups.backupsAuto")} />
                    </FormFieldGroupWithDescription>
                  </FormBody>
                </FromGroup>

                <FromGroup>
                  <FormHead>
                    <FormLabel content={t("generic.compression")} />
                  </FormHead>

                  <FormBody>
                    <FormFieldGroupWithDescription>
                      <FormInputNumber
                        placeholder={t("features.backups.compressionLevel")}
                        value={compressionLevel}
                        onChange={(e) => setCompressionLevel(Number(e.target.value))}
                        min={0}
                        max={9}
                        className="w-full"
                      />
                      <FormFieldDescription content={`${t("generic.minMaxAmmount", { min: 0, max: 9 })} · ${t("features.backups.compressionLevelDesc")}`} />
                    </FormFieldGroupWithDescription>
                  </FormBody>
                </FromGroup>
              </FormGroupWrapper>

              <FormGroupWrapper title={t("generic.advanced")} startOpen={false}>
                <FromGroup>
                  <FormHead>
                    <FormLabel content={t("features.installations.labelStartParams")} />
                  </FormHead>

                  <FormBody>
                    <FormFieldGroupWithDescription>
                      <FormInputText value={startParams} onChange={(e) => setStartParams(e.target.value)} placeholder={t("features.installations.startParams")} />
                      <FormFieldDescription
                        content={
                          <Trans
                            i18nKey="features.installations.startParamsDesc"
                            components={{
                              link: (
                                <Button onClick={() => window.api.utils.openOnBrowser("https://wiki.vintagestory.at/Client_startup_parameters")} className="text-vsl">
                                  {t("features.installations.startParamsLink")}
                                </Button>
                              )
                            }}
                          />
                        }
                      />
                    </FormFieldGroupWithDescription>
                  </FormBody>
                </FromGroup>

                <FromGroup className="items-center">
                  <FormHead>
                    <FormLabel content={t("features.installations.mesaGlThread")} className="max-h-6" />
                  </FormHead>

                  <FormBody>
                    <FormFieldGroupWithDescription alignment="x">
                      <FormToggle title={t("features.installations.mesaGlThreadDesc")} value={mesaGlThread} onChange={setMesaGlThread} />
                      <FormFieldDescription content={t("features.installations.mesaGlThreadDesc")} />
                    </FormFieldGroupWithDescription>
                  </FormBody>
                </FromGroup>

                <FromGroup>
                  <FormHead>
                    <FormLabel content={t("features.installations.envVars")} />
                  </FormHead>

                  <FormBody>
                    <FormFieldGroupWithDescription>
                      <FormInputText
                        value={envVars}
                        onChange={(e) => {
                          setEnvVars(e.target.value)
                        }}
                        placeholder={t("features.installations.envVarsPlaceholder")}
                      />
                      <FormFieldDescription content={t("features.installations.envVarsDesc")} />
                    </FormFieldGroupWithDescription>
                  </FormBody>
                </FromGroup>
              </FormGroupWrapper>

              <ButtonsWrapper className="text-lg">
                <FormLinkButton to="/installations" title={t("generic.goBack")} type="error" className="p-2">
                  <PiXCircleDuotone />
                </FormLinkButton>
                <FormButton onClick={handleEditInstallation} title={t("generic.save")} type="success" className="p-2">
                  <PiFloppyDiskBackDuotone />
                </FormButton>
              </ButtonsWrapper>
            </>
          )}
        </FromWrapper>

        <AddCustomIconPupup open={addIcon} setOpen={setAddIcon} />
      </div>
    </ScrollableContainer>
  )
}

export default EditInslallation
