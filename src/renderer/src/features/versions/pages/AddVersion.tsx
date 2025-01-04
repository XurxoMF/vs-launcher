import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button, Input } from "@headlessui/react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { CONFIG_ACTIONS, useConfigContext } from "@renderer/contexts/ConfigContext"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

function AddVersion(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const { startDownload, startExtract } = useTaskContext()
  const navigate = useNavigate()

  const [gameVersions, setGameVersions] = useState<DownloadableGameVersionType[]>([])
  const [version, setVersion] = useState<DownloadableGameVersionType | undefined>()
  const [folder, setFolder] = useState<string>("")
  const [folderByUser, setFolderByUser] = useState<boolean>(false)
  const [versionFilters, setVersionFilters] = useState({ stable: true, rc: false, pre: false })

  useEffect(() => {
    ;(async (): Promise<void> => {
      try {
        const { data }: { data: DownloadableGameVersionType[] } = await axios("https://vslapi.xurxomf.xyz/versions")
        setGameVersions(data)
      } catch (error) {
        window.api.utils.logMessage("error", `[component] [AddVersion] Error fetching game versions: ${error}`)
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
    if (!version) return addNotification(t("notifications.titles.warning"), t("features.versions.noVersionSelected"), "warning")

    if (config.gameVersions.some((igv) => igv.version === version.version))
      return addNotification(t("notifications.titles.error"), t("features.versions.versionAlreadyInstalled", { version: version.version }), "error")

    const os = await window.api.utils.getOs()
    const url = os === "win32" ? version.windows : version.linux

    const newGameVersion: GameVersionType = {
      version: version!.version,
      path: folder,
      installed: false
    }

    configDispatch({ type: CONFIG_ACTIONS.ADD_GAME_VERSION, payload: newGameVersion })
    navigate("/versions")

    startDownload(
      t("features.versions.gameVersionTaskName", { version: newGameVersion.version }),
      t("features.versions.gameVersionDownloadDesc", { version: newGameVersion.version }),
      url,
      folder,
      (status, path) => {
        if (!status) return configDispatch({ type: CONFIG_ACTIONS.DELETE_GAME_VERSION, payload: { version: newGameVersion.version } })

        startExtract(
          t("features.versions.gameVersionTaskName", { version: newGameVersion.version }),
          t("features.versions.gameVersionExtractDesc", { version: newGameVersion.version }),
          path,
          folder,
          (status) => {
            if (!status) return configDispatch({ type: CONFIG_ACTIONS.DELETE_GAME_VERSION, payload: { version: newGameVersion.version } })
            configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: newGameVersion.version, updates: { installed: true } } })
          }
        )
      }
    )
  }

  return (
    <>
      <h1 className="text-3xl text-center font-bold">{t("features.versions.installTitle")}</h1>

      <div className="mx-auto w-[800px] flex flex-col gap-4 items-start justify-center">
        <div className="w-full flex gap-4">
          <div className="w-48 flex flex-col gap-4 text-right">
            <p className="text-lg">{t("features.versions.labelGameVersion")}</p>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center select-none">
                <label htmlFor="stable-version" className="w-full cursor-pointer pr-2">
                  {t("features.versions.labelStables")}
                </label>
                <Input
                  type="checkbox"
                  id="stable-version"
                  checked={versionFilters.stable}
                  onChange={(e) => setVersionFilters({ ...versionFilters, stable: e.target.checked })}
                  className="bg-vs cursor-pointer"
                />
              </div>
              <div className="flex items-center select-none">
                <label htmlFor="rc-version" className="w-full cursor-pointer pr-2">
                  {t("features.versions.labelRCs")}
                </label>
                <Input type="checkbox" id="rc-version" checked={versionFilters.rc} onChange={(e) => setVersionFilters({ ...versionFilters, rc: e.target.checked })} className="bg-vs cursor-pointer" />
              </div>
              <div className="flex items-center select-none">
                <label htmlFor="pre-version" className="w-full cursor-pointer pr-2">
                  {t("features.versions.labelPreReleases")}
                </label>
                <Input
                  type="checkbox"
                  id="pre-version"
                  checked={versionFilters.pre}
                  onChange={(e) => setVersionFilters({ ...versionFilters, pre: e.target.checked })}
                  className="bg-vs cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="w-full max-h-[250px] bg-zinc-850 rounded overflow-x-hidden shadow shadow-zinc-900 overflow-y-scroll">
            <div className="w-full sticky top-0 bg-zinc-850 flex">
              <div className="w-full text-center p-1">{t("generic.version")}</div>
              <div className="shrink-0 w-36 text-center p-1">{t("generic.releaseDate")}</div>
              <div className="shrink-0 w-24 text-center p-1">{t("generic.type")}</div>
            </div>
            <div className="w-full">
              {gameVersions.map(
                (gv) =>
                  versionFilters[gv.type] && (
                    <div
                      key={gv.version}
                      onClick={() => !config.gameVersions.find((igv) => igv.version === gv.version) && setVersion(gv)}
                      className={`flex border-l-4 border-transparent
                    ${version?.version === gv.version ? "bg-vs/15 border-vs" : "odd:bg-zinc-800"} 
                    ${config.gameVersions.find((igv) => igv.version === gv.version) ? "text-zinc-500" : "cursor-pointer duration-100 hover:pl-1"}`}
                    >
                      <div className="w-full p-1">
                        <p>{gv.version}</p>
                      </div>
                      <div className="shrink-0 w-36 text-center p-1">
                        <p>{new Date(gv.releaseDate).toLocaleDateString("es")}</p>
                      </div>
                      <div className="shrink-0 w-24 text-center p-1">
                        <p>{gv.type}</p>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex gap-4">
          <div className="w-48 flex flex-col gap-4 text-right">
            <p className="text-lg">{t("generic.folder")}</p>
          </div>

          <div className="w-full flex gap-2">
            <Button
              onClick={async () => {
                const path = await window.api.utils.selectFolderDialog()
                if (path && path.length > 0) {
                  setFolder(path)
                  setFolderByUser(true)
                }
              }}
              title={t("generic.browse")}
              className="w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
            >
              <p className="px-2 py-1">{t("generic.browse")}</p>
            </Button>
            <Input
              type="text"
              placeholder={t("features.versions.versionFolder")}
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full h-8 bg-zinc-850 px-2 py-1 rounded-md shadow shadow-zinc-900 hover:shadow-none"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center items-center">
        <Button onClick={handleInstallVersion} title={t("generic.install")} className="w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded">
          <p className="px-2 py-1">{t("generic.install")}</p>
        </Button>
        <Link to="/versions" title={t("generic.cancel")} className="w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded">
          <p className="px-2 py-1">{t("generic.cancel")}</p>
        </Link>
      </div>
    </>
  )
}

export default AddVersion
