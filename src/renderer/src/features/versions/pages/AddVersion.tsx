import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Input } from "@headlessui/react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FiLoader } from "react-icons/fi"
import { PiDownloadDuotone, PiXCircleDuotone } from "react-icons/pi"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { CONFIG_ACTIONS, useConfigContext } from "@renderer/features/config/contexts/ConfigContext"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

import {
  FormBody,
  FormHead,
  FormLabel,
  FromGroup,
  FromWrapper,
  FormFieldGroup,
  FormButton,
  FormInputText,
  FormLinkButton,
  FormGroupWrapper,
  ButtonsWrapper
} from "@renderer/components/ui/FormComponents"
import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"

function AddVersion(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const { startDownload, startExtract } = useTaskContext()
  const navigate = useNavigate()

  const [gameVersions, setGameVersions] = useState<DownloadableGameVersionTypeType[]>([])
  const [version, setVersion] = useState<DownloadableGameVersionTypeType | undefined>()
  const [folder, setFolder] = useState<string>("")
  const [folderByUser, setFolderByUser] = useState<boolean>(false)
  const [versionFilters, setVersionFilters] = useState({ stable: true, rc: false, pre: false })

  useEffect(() => {
    ;(async (): Promise<void> => {
      try {
        const { data }: { data: DownloadableGameVersionTypeType[] } = await axios("https://vslapi.xurxomf.xyz/versions")
        setGameVersions(data)
      } catch (err) {
        window.api.utils.logMessage("error", `[front] [mods] [features/versions/pages/AddVersion.tsx] [AddVersion] Error fetching game versions.`)
        window.api.utils.logMessage("debug", `[front] [mods] [features/versions/pages/AddVersion.tsx] [AddVersion] Error fetching game versions: ${err}`)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async (): Promise<void> => {
      if (version && !folderByUser) setFolder(await window.api.pathsManager.formatPath([config.defaultVersionsFolder, version.version]))
    })()
  }, [version])

  useEffect(() => {
    setVersion(gameVersions.find((gv) => versionFilters[gv.type] && !config.gameVersions.some((igv) => igv.version === gv.version)))
  }, [gameVersions, versionFilters])

  const handleInstallVersion = async (): Promise<void> => {
    if (!version) return addNotification(t("features.versions.noVersionSelected"), "error")

    if (config.gameVersions.some((igv) => igv.version === version.version)) return addNotification(t("features.versions.versionAlreadyInstalled", { version: version.version }), "error")

    if (folder === config.backupsFolder || config.gameVersions.some((gv) => gv.path === folder) || config.installations.some((i) => i.path === folder))
      return addNotification(t("features.versions.folderAlreadyInUse"), "error")

    const os = await window.api.utils.getOs()
    const url = os === "win32" ? version.windows : version.linux

    const newGameVersion: GameVersionType = {
      version: version.version,
      path: folder,
      _installing: true
    }

    configDispatch({ type: CONFIG_ACTIONS.ADD_GAME_VERSION, payload: newGameVersion })
    navigate("/versions")

    startDownload(
      t("features.versions.gameVersionTaskName", { version: newGameVersion.version }),
      t("features.versions.gameVersionDownloadDesc", { version: newGameVersion.version }),
      "all",
      url,
      folder,
      version.version,
      (status, path) => {
        if (!status) return configDispatch({ type: CONFIG_ACTIONS.DELETE_GAME_VERSION, payload: { version: newGameVersion.version } })

        startExtract(
          t("features.versions.gameVersionTaskName", { version: newGameVersion.version }),
          t("features.versions.gameVersionExtractDesc", { version: newGameVersion.version }),
          "all",
          path,
          folder,
          true,
          (status) => {
            if (!status) return configDispatch({ type: CONFIG_ACTIONS.DELETE_GAME_VERSION, payload: { version: newGameVersion.version } })
            configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: newGameVersion.version, updates: { _installing: undefined } } })
          }
        )
      }
    )
  }

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-6">
        <h1 className="text-3xl text-center font-bold">{t("features.versions.installTitle")}</h1>

        <FromWrapper className="max-w-[800px] w-full">
          <FormGroupWrapper>
            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.versions.labelGameVersion")} />

                <div className="flex flex-col gap-1 text-sm text-right">
                  <div className="flex items-center">
                    <label htmlFor="stable-version" className="w-full cursor-pointer pr-2">
                      {t("features.versions.labelStables")}
                    </label>
                    <Input
                      type="checkbox"
                      id="stable-version"
                      checked={versionFilters.stable}
                      onChange={(e) => setVersionFilters({ ...versionFilters, stable: e.target.checked })}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center">
                    <label htmlFor="rc-version" className="w-full cursor-pointer pr-2">
                      {t("features.versions.labelRCs")}
                    </label>
                    <Input type="checkbox" id="rc-version" checked={versionFilters.rc} onChange={(e) => setVersionFilters({ ...versionFilters, rc: e.target.checked })} className="cursor-pointer" />
                  </div>
                  <div className="flex items-center">
                    <label htmlFor="pre-version" className="w-full cursor-pointer pr-2">
                      {t("features.versions.labelPreReleases")}
                    </label>
                    <Input type="checkbox" id="pre-version" checked={versionFilters.pre} onChange={(e) => setVersionFilters({ ...versionFilters, pre: e.target.checked })} className="cursor-pointer" />
                  </div>
                </div>
              </FormHead>

              <FormBody>
                <TableWrapper className="text-center">
                  <TableHead>
                    <TableHeadRow>
                      <TableCell className="w-2/6 ">{t("generic.version")}</TableCell>
                      <TableCell className="w-2/6">{t("generic.releaseDate")}</TableCell>
                      <TableCell className="w-2/6">{t("generic.type")}</TableCell>
                    </TableHeadRow>
                  </TableHead>

                  {gameVersions.length === 0 ? (
                    <div className="flex items-center justify-center py-10">
                      <FiLoader className="animate-spin text-3xl text-zinc-400" />
                    </div>
                  ) : (
                    <TableBody className="max-h-[250px]">
                      {gameVersions.map(
                        (gv) =>
                          versionFilters[gv.type] && (
                            <TableBodyRow
                              key={gv.version}
                              selected={version?.version === gv.version}
                              disabled={config.gameVersions.some((igv) => igv.version === gv.version)}
                              onClick={() => !config.gameVersions.find((igv) => igv.version === gv.version) && setVersion(gv)}
                            >
                              <TableCell className="w-2/6">{gv.version}</TableCell>
                              <TableCell className="w-2/6">{new Date(gv.releaseDate).toLocaleDateString("es")}</TableCell>
                              <TableCell className="w-2/6">{gv.type}</TableCell>
                            </TableBodyRow>
                          )
                      )}
                    </TableBody>
                  )}
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
                        if (!(await window.api.pathsManager.checkPathEmpty(path))) addNotification(t("notifications.body.folderNotEmpty"), "warning")

                        setFolder(path)
                        setFolderByUser(true)
                      }
                    }}
                    title={t("generic.browse")}
                    className="px-2 py-1"
                  >
                    {t("generic.browse")}
                  </FormButton>
                  <FormInputText placeholder={t("features.versions.versionFolder")} value={folder} onChange={(e) => setFolder(e.target.value)} className="w-full" />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>
        </FromWrapper>

        <ButtonsWrapper className="text-lg">
          <FormLinkButton to="/versions" title={t("generic.goBack")} className="p-2">
            <PiXCircleDuotone />
          </FormLinkButton>
          <FormButton onClick={handleInstallVersion} title={t("generic.install")} className="p-2">
            <PiDownloadDuotone />
          </FormButton>
        </ButtonsWrapper>
      </div>
    </ScrollableContainer>
  )
}

export default AddVersion
