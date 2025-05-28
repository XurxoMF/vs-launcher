import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { PiFloppyDiskBackDuotone, PiMagnifyingGlassDuotone, PiXCircleDuotone } from "react-icons/pi"

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
  FormInputText,
  FormFieldGroup,
  FormGroupWrapper
} from "@renderer/components/ui/FormComponents"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import { StickyMenuWrapper, StickyMenuGroupWrapper, StickyMenuGroup, StickyMenuBreadcrumbs, GoBackButton, GoToTopButton } from "@renderer/components/ui/StickyMenu"

function LookForAVersion(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const navigate = useNavigate()

  const [folder, setFolder] = useState<string>("")
  const [versionFound, setVersionFound] = useState<string>("")

  const scrollRef = useRef<HTMLDivElement | null>(null)

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
      window.api.utils.logMessage("error", `[front] [mods] [features/versions/pages/LookForAVersion.tsx] [LookForAVersion > handleAddVersion] Error looking for a version.`)
      window.api.utils.logMessage("debug", `[front] [mods] [features/versions/pages/LookForAVersion.tsx] [LookForAVersion> handleAddVersion] Error looking for a version: ${err}`)
    } finally {
      setFolder("")
      setVersionFound("")
    }
  }

  return (
    <ScrollableContainer ref={scrollRef}>
      <div className="min-h-full flex flex-col items-center justify-center gap-2">
        <StickyMenuWrapper scrollRef={scrollRef}>
          <StickyMenuGroupWrapper>
            <StickyMenuGroup>
              <GoBackButton to="/" />
            </StickyMenuGroup>

            <StickyMenuBreadcrumbs
              breadcrumbs={[
                { name: t("breadcrumbs.versions"), to: "/versions" },
                { name: t("breadcrumbs.lookForAVersion"), to: "/versions/look-for-a-version" }
              ]}
            />

            <StickyMenuGroup>
              <GoToTopButton scrollRef={scrollRef} />
            </StickyMenuGroup>
          </StickyMenuGroupWrapper>
        </StickyMenuWrapper>

        <FromWrapper className="max-w-[50rem] w-full my-auto">
          <FormGroupWrapper title={t("generic.basics")}>
            <FromGroup>
              <FormHead>
                <FormLabel content={t("generic.folder")} />
              </FormHead>

              <FormBody>
                <FormFieldGroup alignment="x">
                  <FormButton
                    onClick={async () => {
                      const path = await window.api.utils.selectFolderDialog()
                      if (path && path.length > 0 && path[0].length > 0) {
                        const res = await window.api.gameManager.lookForAGameVersion(path[0])

                        if (!res.exists) {
                          setFolder("")
                          setVersionFound("")
                          return addNotification(t("features.versions.noVersionFoundOnThatFolder"), "error")
                        }

                        setFolder(path[0])
                        setVersionFound(res.installedGameVersion as string)
                      }
                    }}
                    title={t("generic.browse")}
                    className="px-2 py-1"
                  >
                    <PiMagnifyingGlassDuotone />
                  </FormButton>
                  <FormInputText value={folder} placeholder={t("generic.folder")} readOnly className="w-full" />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.versions.versionFound")} />
              </FormHead>

              <FormBody>
                <FormInputText value={versionFound} readOnly placeholder={t("features.versions.versionFound")} />
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>

          <ButtonsWrapper className="text-lg">
            <FormLinkButton to="/versions" title={t("generic.cancel")} type="error" className="p-2">
              <PiXCircleDuotone />
            </FormLinkButton>
            <FormButton onClick={handleAddVersion} title={t("generic.add")} type="success" className="p-2">
              <PiFloppyDiskBackDuotone />
            </FormButton>
          </ButtonsWrapper>
        </FromWrapper>
      </div>
    </ScrollableContainer>
  )
}

export default LookForAVersion
