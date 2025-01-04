import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@headlessui/react"
import { Link, useNavigate } from "react-router-dom"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { CONFIG_ACTIONS, useConfigContext } from "@renderer/contexts/ConfigContext"

function LookForAVersion(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const navigate = useNavigate()

  const [folder, setFolder] = useState<string>("")
  const [versionFound, setVersionFound] = useState<string>("")

  const handleAddVersion = async (): Promise<void> => {
    try {
      if (!folder || !versionFound) return addNotification(t("notifications.titles.warning"), t("features.versions.missingFolderOrVersion"), "warning")

      if (config.gameVersions.some((gv) => gv.version === versionFound))
        return addNotification(t("notifications.titles.error"), t("features.versions.versionAlreadyInstalled", { version: versionFound }), "error")

      const newGameVersion: GameVersionType = {
        version: versionFound,
        path: folder,
        installed: true
      }

      configDispatch({ type: CONFIG_ACTIONS.ADD_GAME_VERSION, payload: newGameVersion })
      addNotification(t("notifications.titles.success"), t("features.versions.versionSuccessfullyAdded", { version: versionFound }), "success")
      navigate("/versions")
    } catch (err) {
      console.log(err)
    } finally {
      setFolder("")
      setVersionFound("")
    }
  }

  return (
    <>
      <h1 className="text-3xl text-center font-bold">{t("features.versions.lookForAVersion")}</h1>

      <div className="mx-auto w-[800px] flex flex-col gap-4 items-start justify-center">
        <div className="w-full flex gap-4">
          <div className="w-48 flex flex-col gap-4 text-right">
            <p className="text-lg">{t("features.versions.versionFound")}</p>
          </div>

          <div className="w-full flex gap-2">
            <p className="w-full h-8 bg-zinc-850 px-2 py-1 rounded-md shadow shadow-zinc-900 hover:shadow-none">{versionFound}</p>
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
                  const res = await window.api.pathsManager.lookForAGameVersion(path)

                  if (!res.exists) {
                    setFolder("")
                    setVersionFound("")
                    return addNotification(t("notifications.titles.error"), t("features.versions.noVersionFoundOnThatFolder"), "error")
                  }

                  setFolder(path)
                  setVersionFound(res.installedGameVersion as string)
                }
              }}
              title={t("generic.browse")}
              className="w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
            >
              <p className="px-2 py-1">{t("generic.browse")}</p>
            </Button>
            <p className="w-full h-8 bg-zinc-850 px-2 py-1 rounded-md shadow shadow-zinc-900 hover:shadow-none">{folder}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center items-center">
        <Button onClick={handleAddVersion} title={t("generic.add")} className="w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded">
          <p className="px-2 py-1">{t("generic.add")}</p>
        </Button>
        <Link to="/versions" title={t("generic.cancel")} className="w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded">
          <p className="px-2 py-1">{t("generic.cancel")}</p>
        </Link>
      </div>
    </>
  )
}

export default LookForAVersion
