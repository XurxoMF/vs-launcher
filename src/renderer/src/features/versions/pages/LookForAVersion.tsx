import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { CONFIG_ACTIONS, useConfigContext } from "@renderer/features/config/contexts/ConfigContext"
import {
  ButtonsWrapper,
  FormButton,
  FormBody,
  FormLabel,
  FormHead,
  FormLinkButton,
  FromGroup,
  FromWrapper,
  FormInputTextNotEditable,
  FormFieldGroup,
  FormGroupWrapper
} from "@renderer/components/ui/FormComponents"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"

function LookForAVersion(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const navigate = useNavigate()

  const [folder, setFolder] = useState<string>("")
  const [versionFound, setVersionFound] = useState<string>("")

  const handleAddVersion = async (): Promise<void> => {
    try {
      if (!folder || !versionFound) return addNotification(t("features.versions.missingFolderOrVersion"), "error")

      if (config.gameVersions.some((gv) => gv.version === versionFound)) return addNotification(t("features.versions.versionAlreadyInstalled", { version: versionFound }), "error")

      const newGameVersion: GameVersionType = {
        version: versionFound,
        path: folder
      }

      configDispatch({ type: CONFIG_ACTIONS.ADD_GAME_VERSION, payload: newGameVersion })
      addNotification(t("features.versions.versionSuccessfullyAdded", { version: versionFound }), "success")
      navigate("/versions")
    } catch (err) {
      window.api.utils.logMessage("error", `[LookForAVersion] There was an error while looking for a version: ${err}`)
    } finally {
      setFolder("")
      setVersionFound("")
    }
  }

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-6">
        <h1 className="text-3xl text-center font-bold">{t("features.versions.lookForAVersion")}</h1>

        <FromWrapper className="max-w-[800px] w-full">
          <FormGroupWrapper>
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
                        const res = await window.api.pathsManager.lookForAGameVersion(path)

                        if (!res.exists) {
                          setFolder("")
                          setVersionFound("")
                          return addNotification(t("features.versions.noVersionFoundOnThatFolder"), "error")
                        }

                        setFolder(path)
                        setVersionFound(res.installedGameVersion as string)
                      }
                    }}
                    title={t("generic.browse")}
                  >
                    {t("generic.browse")}
                  </FormButton>
                  <FormInputTextNotEditable value={folder} placeholder={t("generic.folder")} className="w-full" />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.versions.versionFound")} />
              </FormHead>

              <FormBody>
                <FormInputTextNotEditable value={versionFound} placeholder={t("features.versions.versionFound")} />
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>
        </FromWrapper>

        <ButtonsWrapper>
          <FormButton onClick={handleAddVersion} title={t("generic.add")}>
            {t("generic.add")}
          </FormButton>
          <FormLinkButton to="/versions" title={t("generic.cancel")}>
            {t("generic.cancel")}
          </FormLinkButton>
        </ButtonsWrapper>
      </div>
    </ScrollableContainer>
  )
}

export default LookForAVersion
