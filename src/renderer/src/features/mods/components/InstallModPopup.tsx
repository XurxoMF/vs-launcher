import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { PiDownloadFill, PiArrowClockwiseFill } from "react-icons/pi"
import { FiLoader } from "react-icons/fi"
import clsx from "clsx"

import { useInstallMod } from "../hooks/useInstallMod"
import { useQueryMod } from "../hooks/useQueryMod"
import { useGetInstalledMods } from "../hooks/useGetInstalledMods"

import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import { NormalButton } from "@renderer/components/ui/Buttons"

function InstallModPopup({
  modToInstall,
  setModToInstall,
  installation
}: {
  modToInstall: string | null
  setModToInstall: Dispatch<SetStateAction<string | null>>
  installation: InstallationType
}): JSX.Element {
  const { t } = useTranslation()

  const installMod = useInstallMod()
  const queryMod = useQueryMod()
  const getInstalledMods = useGetInstalledMods()

  const [downloadableModToInstall, setDownloadableModToInstall] = useState<DownloadableMod | null>(null)
  const [installedMods, setInstalledMods] = useState<InstalledModType[]>([])

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
    // if (mods.errors.length > 0) addNotification(t("features.mods.someModsCouldNotBeParsed"), "warning")
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
              <FiLoader className="animate-spin text-3xl text-zinc-300" />
            </div>
          ) : (
            <TableBody className="max-h-[300px]">
              {downloadableModToInstall?.releases.map((release) => (
                <TableBodyRow key={release.releaseid} disabled={installedMods.find((im) => release.modidstr === im.modid)?.version === release.modversion}>
                  <TableCell className="w-2/12">{release.modversion}</TableCell>
                  <TableCell className="w-3/12">{new Date(release.created).toLocaleDateString("es")}</TableCell>
                  <TableCell className="w-5/12 overflow-hidden whitespace-nowrap text-ellipsis">
                    <input type="text" value={release.tags.join(", ")} readOnly className="w-full bg-transparent outline-none text-center" />
                  </TableCell>
                  <TableCell className="w-2/12 flex gap-2 items-center justify-center">
                    <NormalButton
                      disabled={installedMods.find((im) => release.modidstr === im.modid)?.version === release.modversion}
                      onClick={() => {
                        const oldMod = installedMods.find((im) => release.modidstr === im.modid)
                        installMod(installation, downloadableModToInstall || undefined, release, oldMod, () => {
                          manageGetInstalledMods()
                        })
                        setModToInstall(null)
                        setDownloadableModToInstall(null)
                      }}
                      className={clsx(
                        "w-7 h-7 backdrop-blur-sm border border-zinc-400/5 shadow shadow-zinc-950/50 hover:shadow-none rounded",
                        release.tags.includes(`v${installation.version}`)
                          ? "bg-green-700/50"
                          : release.tags.some((tag) => tag.startsWith(`v${installation.version.split(".").slice(0, 2).join(".")}`))
                            ? "bg-yellow-600/50"
                            : "bg-red-700/50"
                      )}
                      title={installedMods.some((im) => release.modidstr === im.modid) ? t("features.installations.updateOnInstallation") : t("features.installations.installOnInstallation")}
                    >
                      {installedMods.some((im) => release.modidstr === im.modid) ? <PiArrowClockwiseFill /> : <PiDownloadFill />}
                    </NormalButton>
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
