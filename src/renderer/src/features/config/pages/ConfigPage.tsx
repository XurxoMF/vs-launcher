import { useTranslation } from "react-i18next"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"

import { FormBody, FormFieldGroup, FormHead, FormLabel, FromGroup, FromWrapper, FormGroupWrapper, FormButton, FormInputTextNotEditable } from "@renderer/components/ui/FormComponents"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"

function ConfigPage(): JSX.Element {
  const { t } = useTranslation()

  const { config, configDispatch } = useConfigContext()

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-6">
        <h1 className="text-3xl text-center font-bold">{t("features.config.title")}</h1>

        <FromWrapper className="max-w-[800px] w-full">
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
                      if (path && path.length > 0) {
                        configDispatch({ type: CONFIG_ACTIONS.SET_DEFAULT_INSTALLATIONS_FOLDER, payload: path })
                      }
                    }}
                    title={t("generic.browse")}
                    className="px-2 py-1"
                  >
                    {t("generic.browse")}
                  </FormButton>
                  <FormInputTextNotEditable value={config.defaultInstallationsFolder} className="w-full" />
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
                      if (path && path.length > 0) {
                        configDispatch({ type: CONFIG_ACTIONS.SET_DEFAULT_VERSIONS_FOLDER, payload: path })
                      }
                    }}
                    title={t("generic.browse")}
                    className="px-2 py-1"
                  >
                    {t("generic.browse")}
                  </FormButton>
                  <FormInputTextNotEditable value={config.defaultVersionsFolder} className="w-full" />
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
                      console.log(path)

                      if (path && path.length > 0) {
                        configDispatch({ type: CONFIG_ACTIONS.SET_DEFAULT_BACKUPS_FOLDER, payload: path })
                      }
                    }}
                    title={t("generic.browse")}
                    className="px-2 py-1"
                  >
                    {t("generic.browse")}
                  </FormButton>
                  <FormInputTextNotEditable value={config.backupsFolder} className="w-full" />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>
        </FromWrapper>
      </div>
    </ScrollableContainer>
  )
}

export default ConfigPage
