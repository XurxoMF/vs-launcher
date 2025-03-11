import { useTranslation } from "react-i18next"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { FormBody, FormFieldGroup, FormHead, FormLabel, FromGroup, FromWrapper, FormGroupWrapper, FormButton, FormInputText } from "@renderer/components/ui/FormComponents"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import { PiMagnifyingGlassDuotone } from "react-icons/pi"

function ConfigPage(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()

  const { config, configDispatch } = useConfigContext()

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-4">
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

export default ConfigPage
