import { Button } from "@headlessui/react"
import { useTranslation } from "react-i18next"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"

function ConfigPage(): JSX.Element {
  const { t } = useTranslation()

  const { config, configDispatch } = useConfigContext()

  return (
    <div className="w-full h-full flex flex-col justify-center gap-8 p-4 pt-8">
      <h1 className="text-3xl text-center font-bold">{t("features.config.title")}</h1>

      <div className="mx-auto w-[800px] flex flex-col gap-4 items-start justify-center">
        <div className="w-full flex flex-col gap-4">
          <h2 className="w-full text-xl border-b border-zinc-700">{t("features.config.folders")}</h2>

          <div className="w-full flex flex-col gap-2">
            <div className="w-full flex gap-2 items-center">
              <p>{t("features.config.defaultInstallationsFolder")}</p>
              <Button
                onClick={async () => {
                  const path = await window.api.utils.selectFolderDialog()
                  if (path && path.length > 0) {
                    configDispatch({ type: CONFIG_ACTIONS.SET_DEFAULT_INSTALLATIONS_FOLDER, payload: path })
                  }
                }}
                title={t("generic.browse")}
                className="w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
              >
                <p className="px-2 py-1">{t("generic.browse")}</p>
              </Button>
              <div className="w-full h-8 px-2 py-1 rounded-md bg-zinc-850">{config.defaultInstallationsFolder}</div>
            </div>

            <div className="w-full flex gap-2 items-center">
              <p>{t("features.config.defaultVersionsFolder")}</p>
              <Button
                onClick={async () => {
                  const path = await window.api.utils.selectFolderDialog()
                  if (path && path.length > 0) {
                    configDispatch({ type: CONFIG_ACTIONS.SET_DEFAULT_VERSIONS_FOLDER, payload: path })
                  }
                }}
                title={t("generic.browse")}
                className="w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded"
              >
                <p className="px-2 py-1">{t("generic.browse")}</p>
              </Button>
              <div className="w-full h-8 px-2 py-1 rounded-md bg-zinc-850">{config.defaultVersionsFolder}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigPage
