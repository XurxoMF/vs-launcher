import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation, Trans } from "react-i18next"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"

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
  FormButton,
  FormLinkButton
} from "@renderer/components/ui/FormComponents"
import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"

function EditInslallation(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const navigate = useNavigate()

  const { id } = useParams()

  const installation = config.installations.find((igv) => igv.id === id)

  const [name, setName] = useState<string>(installation?.name ?? "")
  const [version, setVersion] = useState<GameVersionType>(config.gameVersions.find((gv) => gv.version === installation?.version) ?? config.gameVersions[0])
  const [startParams, setStartParams] = useState<string>(installation?.startParams ?? "")

  const handleAddInstallation = async (): Promise<void> => {
    if (!installation) return addNotification(t("notifications.titles.warning"), t("features.installations.noInstallationFound"), "warning")

    if (!id || !name || !version) return addNotification(t("notifications.titles.warning"), t("notifications.body.missingFields"), "warning")

    if (name.length < 5 || name.length > 50) return addNotification(t("notifications.titles.warning"), t("features.installations.installationNameMinMaxCharacters"), "warning")

    if (startParams.includes("--dataPath")) return addNotification(t("notifications.titles.error"), t("features.installations.cantUseDataPath"), "error")

    try {
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id, updates: { name, version: version.version, startParams } } })
      addNotification(t("notifications.titles.success"), t("features.installations.installationSuccessfullyEdited"), "success")
      navigate("/installations")
    } catch (error) {
      addNotification(t("notifications.titles.error"), t("features.installations.errorEditingInstallation"), "error")
    }
  }

  return (
    <>
      <h1 className="text-3xl text-center font-bold">{t("features.installations.editTitle")}</h1>

      <FromWrapper className="max-w-[800px] w-full">
        {!installation ? (
          <div className="w-full flex flex-col items-center justify-center gap-2 rounded bg-zinc-850 p-4">
            <p className="text-2xl">{t("features.installations.noInstallationFound")}</p>
            <p className="w-full flex gap-1 items-center justify-center">{t("features.installations.noInstallationFoundDesc")}</p>
          </div>
        ) : (
          <>
            <FromGroup>
              <FormHead>
                <FormLabel content={t("generic.name")} />
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
                <TableWrapper className="max-h-[250px] overflow-y-scroll">
                  <TableHead>
                    <TableHeadRow>
                      <TableCell className="w-full text-center">{t("generic.version")}</TableCell>
                    </TableHeadRow>
                  </TableHead>

                  <TableBody className="overflow-hidden">
                    {config.gameVersions.length < 1 && (
                      <div className="w-full p-1 flex items-center justify-center">
                        <p>{t("features.versions.noVersionsFound")}</p>
                      </div>
                    )}
                    {config.gameVersions.map((gv) => (
                      <TableBodyRow key={gv.version} onClick={() => setVersion(gv)} selected={version?.version === gv.version}>
                        <TableCell className="w-full">{gv.version}</TableCell>
                      </TableBodyRow>
                    ))}
                  </TableBody>
                </TableWrapper>
              </FormBody>
            </FromGroup>

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
                            <button onClick={() => window.api.utils.openOnBrowser("https://wiki.vintagestory.at/Client_startup_parameters")} className="text-vs">
                              {t("features.installations.startParamsLink")}
                            </button>
                          )
                        }}
                      />
                    }
                  />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>
          </>
        )}
      </FromWrapper>

      <ButtonsWrapper>
        <FormButton onClick={handleAddInstallation} title={t("generic.save")} />
        <FormLinkButton to="/installations" title={t("generic.cancel")} />
      </ButtonsWrapper>
    </>
  )
}

export default EditInslallation
