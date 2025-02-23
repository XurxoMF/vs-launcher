import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { PiDownloadFill, PiArrowClockwiseFill } from "react-icons/pi"
import { FiLoader } from "react-icons/fi"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useInstallMod } from "../hooks/useInstallMod"
import { useQueryMod } from "../hooks/useQueryMod"
import { useGetInstalledMods } from "../hooks/useGetInstalledMods"

import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import { FormButton } from "@renderer/components/ui/FormComponents"

function InstallModPopup({
  modToInstall,
  setModToInstall,
  installation
}: {
  modToInstall: number | string | null
  setModToInstall: Dispatch<SetStateAction<number | string | null>>
  installation: InstallationType
}): JSX.Element {
  const { t } = useTranslation()
  const goTo = useNavigate()
  const { addNotification } = useNotificationsContext()

  const installMod = useInstallMod()
  const queryMod = useQueryMod()
  const getInstalledMods = useGetInstalledMods()

  const [downloadableModToInstall, setDownloadableModToInstall] = useState<DownloadableMod | null>(null)
  const [installedMods, setInstalledMods] = useState<InstalledModType[]>([])

  const installationsWithNotifiedErrors = useRef<string[]>([])

  const firstTimeGettingModsListMods = useRef(true)
  useEffect(() => {
    if (!firstTimeGettingModsListMods.current) return
    firstTimeGettingModsListMods.current = false
    manageGetInstalledMods()
  }, [])

  useEffect(() => {
    if (!modToInstall) return
    ;(async (): Promise<void> => {
      const mod = await queryMod({ modid: modToInstall })
      setDownloadableModToInstall(mod || null)
    })()
  }, [modToInstall])

  async function manageGetInstalledMods(): Promise<void> {
    const mods = await getInstalledMods({ path: installation.path })
    if (mods.errors.length > 0 && !installationsWithNotifiedErrors.current.some((iid) => iid === installation.id)) {
      addNotification(t("features.mods.someModsCouldNotBeParsed"), "warning", { onClick: () => goTo(`/installations/mods/${installation.id}`) })
      installationsWithNotifiedErrors.current.push(installation.id)
    }
    setInstalledMods(mods.mods)
  }

  return (
    <PopupDialogPanel
      title={t("features.mods.installMod")}
      isOpen={modToInstall !== null}
      close={() => {
        setModToInstall(null)
        setDownloadableModToInstall(null)
      }}
      maxWidth={false}
    >
      <>
        <p>{t("features.mods.installationPopupDesc", { modName: downloadableModToInstall?.name })}</p>
        <TableWrapper className="w-[800px]">
          <TableHead>
            <TableHeadRow>
              <TableCell className="w-2/12">{t("generic.version")}</TableCell>
              <TableCell className="w-3/12">{t("generic.releaseDate")}</TableCell>
              <TableCell className="w-5/12">{t("generic.versions")}</TableCell>
              <TableCell className="w-2/12">{t("generic.actions")}</TableCell>
            </TableHeadRow>
          </TableHead>

          {!downloadableModToInstall ? (
            <div className="flex items-center justify-center py-10">
              <FiLoader className="animate-spin text-3xl text-zinc-400" />
            </div>
          ) : (
            <TableBody className="max-h-[300px]">
              {downloadableModToInstall?.releases.map((release) => (
                <TableBodyRow key={release.releaseid} disabled={installedMods.find((im) => release.modidstr === im.modid)?.version === release.modversion}>
                  <TableCell className="w-2/12">{release.modversion}</TableCell>
                  <TableCell className="w-3/12">{new Date(release.created).toLocaleDateString("es")}</TableCell>
                  <TableCell className="w-5/12 overflow-hidden whitespace-nowrap text-ellipsis">
                    <input type="text" value={release.tags.join(", ")} readOnly className="w-full bg-transparent outline-hidden text-center" />
                  </TableCell>
                  <TableCell className="w-2/12 flex gap-2 items-center justify-center text-lg">
                    <FormButton
                      disabled={installedMods.find((im) => release.modidstr === im.modid)?.version === release.modversion}
                      onClick={() => {
                        const oldMod = installedMods.find((im) => release.modidstr === im.modid)
                        installMod(installation, downloadableModToInstall || undefined, release, oldMod, () => {
                          manageGetInstalledMods()
                        })
                        setModToInstall(null)
                        setDownloadableModToInstall(null)
                      }}
                      className="w-7 h-7"
                      type={
                        release.tags.includes(`v${installation.version}`)
                          ? "success"
                          : release.tags.some((tag) => tag.startsWith(`v${installation.version.split(".").slice(0, 2).join(".")}`))
                            ? "warn"
                            : "error"
                      }
                      title={installedMods.some((im) => release.modidstr === im.modid) ? t("features.installations.updateOnInstallation") : t("features.installations.installOnInstallation")}
                    >
                      {installedMods.some((im) => release.modidstr === im.modid) ? <PiArrowClockwiseFill /> : <PiDownloadFill />}
                    </FormButton>
                  </TableCell>
                </TableBodyRow>
              ))}
            </TableBody>
          )}
        </TableWrapper>
      </>
    </PopupDialogPanel>
  )
}

export default InstallModPopup
