import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation, Trans } from "react-i18next"
import { Button } from "@headlessui/react"
import { PiFloppyDiskBackDuotone, PiXCircleDuotone } from "react-icons/pi"
import semver from "semver"

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

function EditInslallation(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const navigate = useNavigate()

  const { id } = useParams()

  const [installation, setInstallation] = useState<InstallationType | undefined>(config.installations.find((igv) => igv.id === id))

  const [name, setName] = useState<string>("")
  const [version, setVersion] = useState<GameVersionType>([...config.gameVersions].sort((a, b) => semver.compare(b.version, a.version))[0])
  const [startParams, setStartParams] = useState<string>("")
  const [backupsLimit, setBackupsLimit] = useState<number>(0)
  const [backupsAuto, setBackupsAuto] = useState<boolean>(false)
  const [compressionLevel, setCompressionLevel] = useState<number>(6)
  const [mesaGlThread, setMEsaGlThread] = useState<boolean>(false)

  useEffect(() => {
    setInstallation(config.installations.find((igv) => igv.id === id))
  }, [id])

  useEffect(() => {
    setName(installation?.name ?? "")
    setVersion(config.gameVersions.find((gv) => gv.version === installation?.version) ?? config.gameVersions[0])
    setStartParams(installation?.startParams ?? "")
    setBackupsLimit(installation?.backupsLimit ?? 0)
    setBackupsAuto(installation?.backupsAuto ?? false)
    setCompressionLevel(installation?.compressionLevel ?? 6)
    setMEsaGlThread(installation?.mesaGlThread ?? false)
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
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id, updates: { name, version: version.version, startParams, backupsAuto, backupsLimit, compressionLevel, mesaGlThread } } })
      addNotification(t("features.installations.installationSuccessfullyEdited"), "success")
      navigate("/installations")
    } catch (error) {
      addNotification(t("features.installations.errorEditingInstallation"), "error")
    }
  }

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-4">
        <h1 className="text-3xl text-center font-bold">{t("features.installations.editTitle")}</h1>

        <FromWrapper className="max-w-[800px] w-full">
          {!installation ? (
            <div className="w-full flex flex-col items-center justify-center gap-2 rounded-sm bg-zinc-950/50 p-4">
              <p className="text-2xl">{t("features.installations.noInstallationFound")}</p>
              <p className="w-full flex gap-1 items-center justify-center">{t("features.installations.noInstallationFoundDesc")}</p>
            </div>
          ) : (
            <>
              <FormGroupWrapper>
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

                      <TableBody className="max-h-[250px]">
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

              <FormGroupWrapper>
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

                <FromGroup>
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

              <FormGroupWrapper>
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

                <FromGroup>
                  <FormHead>
                    <FormLabel content={t("features.installations.mesaGlThread")} className="max-h-6" />
                  </FormHead>

                  <FormBody>
                    <FormFieldGroupWithDescription alignment="x">
                      <FormToggle title={t("features.installations.mesaGlThreadDesc")} value={mesaGlThread} onChange={setMEsaGlThread} />
                      <FormFieldDescription content={t("features.installations.mesaGlThreadDesc")} />
                    </FormFieldGroupWithDescription>
                  </FormBody>
                </FromGroup>
              </FormGroupWrapper>
            </>
          )}
        </FromWrapper>

        <ButtonsWrapper className="text-lg">
          <FormLinkButton to="/installations" title={t("generic.goBack")} className="p-2">
            <PiXCircleDuotone />
          </FormLinkButton>
          <FormButton onClick={handleEditInstallation} title={t("generic.save")} className="p-2">
            <PiFloppyDiskBackDuotone />
          </FormButton>
        </ButtonsWrapper>
      </div>
    </ScrollableContainer>
  )
}

export default EditInslallation
