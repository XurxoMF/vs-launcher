import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Button, Input } from "@headlessui/react"
import { useTranslation, Trans } from "react-i18next"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"

function EditInslallation(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const navigate = useNavigate()

  const { id } = useParams()

  const installation = config.installations.find((igv) => igv.id === id)

  const [name, setName] = useState<string>(installation?.name ?? "")
  const [version, setVersion] = useState<GameVersionType>(config.gameVersions.find((gv) => gv.version === installation?.version) ?? config.gameVersions[0])
  const [startParams, setStartParams] = useState<string>(installation?.startParams ?? "")

  const handleAddInstallation = async (): Promise<void> => {
    if (!installation) return addNotification(t("notifications.titles.warning"), t("features.installations.noInstallationFound"), "warning")

    if (!id || !name || !version) return addNotification(t("notifications.titles.warning"), t("notifications.body.missingFields"), "warning")

    if (name.length < 5 || name.length > 50) return addNotification(t("notifications.titles.warning"), t("features.installations.installationNameMinMaxCharacters"), "warning")

    if (startParams.includes("--dataPath")) return addNotification(t("notifications.titles.error"), t("features.installations.cantUseDataPath"), "error")

    try {
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id, updates: { name, version: version.version, startParams } } })
      addNotification(t("notifications.titles.success"), t("features.installations.installationSuccessfullyEdited"), "success")
      navigate("/installations")
    } catch (error) {
      addNotification(t("notifications.titles.error"), t("features.installations.errorEditingInstallation"), "error")
    }
  }

  return (
    <>
      <h1 className="text-3xl text-center font-bold">{t("features.installations.editTitle")}</h1>

      <div className="mx-auto w-[800px] flex flex-col gap-4 items-start justify-center">
        {!installation ? (
          <div className="w-full flex flex-col items-center justify-center gap-2 rounded bg-zinc-850 p-4">
            <p className="text-2xl">{t("features.installations.noInstallationFound")}</p>
            <p className="w-full flex gap-1 items-center justify-center">{t("features.installations.noInstallationFoundDesc")}</p>
          </div>
        ) : (
          <>
            <div className="w-full flex gap-4">
              <div className="w-48 flex flex-col gap-4 text-right">
                <p className="text-lg">{t("generic.name")}</p>
              </div>

              <div className="w-full flex flex-col gap-1">
                <Input
                  type="text"
                  className={`w-full h-8 px-2 py-1 rounded-md shadow shadow-zinc-900 hover:shadow-none ${name.length < 5 || name.length > 50 ? "border border-red-800 bg-red-800/10" : "bg-zinc-850"}`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                  }}
                  placeholder={t("features.installations.defaultName")}
                  minLength={5}
                  maxLength={50}
                />
                <p className="text-sm text-zinc-500 pl-1">{t("generic.minMaxLength", { min: 5, max: 50 })}</p>
              </div>
            </div>

            <div className="w-full flex gap-4">
              <div className="w-48 flex flex-col gap-4 text-right">
                <p className="text-lg">{t("features.versions.labelGameVersion")}</p>
              </div>

              <div className="w-full max-h-[250px] bg-zinc-850 rounded overflow-x-hidden shadow shadow-zinc-900 overflow-y-scroll">
                <div className="w-full sticky top-0 bg-zinc-850 flex">
                  <div className="w-full text-center p-1">{t("generic.version")}</div>
                </div>

                <div className="w-full">
                  {config.gameVersions.length < 1 && (
                    <div className="w-full p-1 flex items-center justify-center">
                      <p>{t("features.versions.noVersionsFound")}</p>
                    </div>
                  )}
                  {config.gameVersions.map((gv) => (
                    <div
                      key={gv.version}
                      onClick={() => setVersion(gv)}
                      className={`flex border-l-4 border-transparent cursor-pointer duration-100 hover:pl-1 ${version?.version === gv.version ? "bg-vs/15 border-vs" : "odd:bg-zinc-800"}`}
                    >
                      <div className="w-full p-1">{gv.version}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full flex gap-4">
              <div className="w-48 flex flex-col gap-4 text-right">
                <p className="text-lg">{t("features.installations.labelStartParams")}</p>
              </div>

              <div className="w-full flex flex-col gap-1">
                <Input
                  type="text"
                  className={`w-full h-8 px-2 py-1 rounded-md shadow shadow-zinc-900 hover:shadow-none ${name.length < 5 || name.length > 50 ? "border border-red-800 bg-red-800/10" : "bg-zinc-850"}`}
                  value={startParams}
                  onChange={(e) => {
                    setStartParams(e.target.value)
                  }}
                  placeholder={t("features.installations.startParams")}
                />
                <p className="text-sm text-zinc-500 pl-1 flex gap-1 items-center flex-wrap">
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
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2 justify-center items-center">
        <Button onClick={handleAddInstallation} title={t("generic.save")} className="w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded">
          <p className="px-2 py-1">{t("generic.save")}</p>
        </Button>
        <Link to="/installations" title={t("generic.cancel")} className="w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded">
          <p className="px-2 py-1">{t("generic.cancel")}</p>
        </Link>
      </div>
    </>
  )
}

export default EditInslallation
