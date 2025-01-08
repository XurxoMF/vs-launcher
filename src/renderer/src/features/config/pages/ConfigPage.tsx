import { useTranslation } from "react-i18next"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"

import { FormBody, FormFieldGroup, FormHead, FormLabel, FromGroup, FromWrapper, FormGroupWrapper, FormButton, FormInputTextNotEditable } from "@renderer/components/ui/FormComponents"

function ConfigPage(): JSX.Element {
  const { t } = useTranslation()

  const { config, configDispatch } = useConfigContext()

  return (
    <div className="w-full h-full flex flex-col justify-center gap-8 p-4 pt-8">
      <h1 className="text-3xl text-center font-bold select-none">{t("features.config.title")}</h1>

      <FromWrapper className="max-w-[800px] w-full">
        <FormGroupWrapper title={t("features.config.folders")}>
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
                />
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
                />
                <FormInputTextNotEditable value={config.defaultVersionsFolder} className="w-full" />
              </FormFieldGroup>
            </FormBody>
          </FromGroup>

          <FromGroup>
            <FormHead>
              <FormLabel content={t("features.config.defaultBackupsFolder")} />
            </FormHead>

            <FormBody>
              <FormFieldGroup alignment="x">
                <FormButton
                  onClick={async () => {
                    const path = await window.api.utils.selectFolderDialog()
                    if (path && path.length > 0) {
                      configDispatch({ type: CONFIG_ACTIONS.SET_DEFAULT_BACKUPS_FOLDER, payload: path })
                    }
                  }}
                  title={t("generic.browse")}
                />
                <FormInputTextNotEditable value={config.defaultBackupsFolder} className="w-full" />
              </FormFieldGroup>
            </FormBody>
          </FromGroup>
        </FormGroupWrapper>
      </FromWrapper>
    </div>
  )
}

export default ConfigPage
