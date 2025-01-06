import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation, Trans } from "react-i18next"
import { v4 as uuidv4 } from "uuid"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"

import {
  FormBody,
  FormHead,
  FormLabel,
  FromGroup,
  FromWrapper,
  ButtonsWrapper,
  FormFieldGroup,
  FormFieldDescription,
  FormButton,
  FormLinkButton,
  FormInputText,
  FormFieldGroupWithDescription
} from "@renderer/components/ui/FormComponents"
import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"

function AddInslallation(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const navigate = useNavigate()

  const [name, setName] = useState<string>(t("features.installations.defaultName"))
  const [folder, setFolder] = useState<string>("")
  const [folderByUser, setFolderByUser] = useState<boolean>(false)
  const [version, setVersion] = useState<GameVersionType>(config.gameVersions[0])
  const [startParams, setStartParams] = useState<string>("")

  useEffect(() => {
    ;(async (): Promise<void> => {
      if (name && !folderByUser) setFolder(await window.api.pathsManager.formatPath([config.defaultInstallationsFolder, name.replace(/[^a-zA-Z0-9]/g, "-")]))
    })()
  }, [name])

  const handleAddInstallation = async (): Promise<void> => {
    if (!name || !folder || !version) return addNotification(t("notifications.titles.warning"), t(""), "warning")

    if (name.length < 5 || name.length > 50) return addNotification(t("notifications.titles.warning"), t("features.installations.installationNameMinMaxCharacters", { min: 5, max: 50 }), "warning")

    if (config.installations.some((igv) => igv.path === folder)) return addNotification(t("notifications.titles.error"), t("features.installations.folderAlreadyInUse"), "error")

    if (startParams.includes("--dataPath")) return addNotification(t("notifications.titles.error"), t("features.installations.cantUseDataPath"), "error")

    try {
      const newInstallation: InstallationType = {
        id: uuidv4(),
        name,
        path: folder,
        version: version.version,
        startParams,
        mods: []
      }

      configDispatch({ type: CONFIG_ACTIONS.ADD_INSTALLATION, payload: newInstallation })
      addNotification(t("notifications.titles.success"), t("features.installations.installationSuccessfullyAdded"), "success")
      navigate("/installations")
    } catch (error) {
      addNotification(t("notifications.titles.error"), t("features.installations.errorAddingInstallation"), "error")
    }
  }

  return (
    <>
      <h1 className="text-3xl text-center font-bold">{t("features.installations.addTitle")}</h1>

      <FromWrapper className="max-w-[800px] w-full">
        <FromGroup>
          <FormHead>
            <FormLabel content={t("generic.name")} />
          </FormHead>

          <FormBody>
            <FormFieldGroupWithDescription>
              <FormInputText
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
                placeholder={t("features.installations.defaultName")}
                minLength={5}
                maxLength={50}
              />
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
            <FormLabel content={t("generic.folder")} />
          </FormHead>

          <FormBody>
            <FormFieldGroup alignment="x">
              <FormButton
                onClick={async () => {
                  const path = await window.api.utils.selectFolderDialog()
                  if (path && path.length > 0) {
                    setFolder(path)
                    setFolderByUser(true)
                  }
                }}
                title={t("generic.browse")}
              />
              <FormInputText placeholder={t("features.installations.installationFolder")} value={folder} onChange={(e) => setFolder(e.target.value)} className="w-full" />
            </FormFieldGroup>
          </FormBody>
        </FromGroup>

        <FromGroup>
          <FormHead>
            <FormLabel content={t("features.installations.labelStartParams")} />
          </FormHead>

          <FormBody>
            <FormFieldGroupWithDescription>
              <FormInputText
                value={startParams}
                onChange={(e) => {
                  setStartParams(e.target.value)
                }}
                placeholder={t("features.installations.startParams")}
              />
              <FormFieldDescription
                content={
                  <Trans
                    i18nKey="features.installations.startParamsDesc"
                    components={{
                      link: (
                        <button onClick={() => window.api.utils.openOnBrowser("https://wiki.vintagestory.at/Client_startup_parameters")} className="text-vs">
                          {t("components.installations.startParamsLink")}
                        </button>
                      )
                    }}
                  />
                }
              />
            </FormFieldGroupWithDescription>
          </FormBody>
        </FromGroup>
      </FromWrapper>

      <ButtonsWrapper>
        <FormButton onClick={handleAddInstallation} title={t("generic.add")} />
        <FormLinkButton to="/installations" title={t("generic.goBack")} />
      </ButtonsWrapper>
    </>
  )
}

export default AddInslallation
