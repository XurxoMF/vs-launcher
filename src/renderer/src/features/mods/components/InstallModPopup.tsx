import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { PiDownloadDuotone, PiArrowClockwiseDuotone } from "react-icons/pi"
import { FiLoader } from "react-icons/fi"
import clsx from "clsx"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useInstallMod } from "../hooks/useInstallMod"
import { useQueryMod } from "../hooks/useQueryMod"

import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import { FormButton } from "@renderer/components/ui/FormComponents"

interface IInstallationToInstallModIn {
  installation: InstallationType
  oldMod?: InstalledModType
}

/**
 * Popup with a mod's installable versions with colors for compatible updates, automatic remove of the old installed version, etc.
 *
 * @param {Object} props
 * @param {number | string | null} [props.modToInstall] useState with the ModID of the mod to install. String from modinfo.json like mycoolmod, number or null if the popup is closed.
 * @param {() => void} [props.setModToInstall] Function called to close the popup. Set modToInstall to null when it's called.
 * @param {IInstallationToInstallModIn} [props.installation] Installation data to install a mod on it.
 * @param {string} [props.installation.pathToIsntall] Path to look for mods. /Mods will be added at the end.
 * @param {string} [props.installation.version] Installation/Server version to check if there are compatible updates WITHOUT "v"! Example: ~~v1.2.3~~ 1.2.3
 * @param {string} [props.installation.outName] Name of the Server or Installation where the mod will be installed.
 * @param {InstalledModType} [props.installation.oldMod] The old mod(if there's any) to check for updates and update if it's needed. It'll not get available updates, it'll only check it the _updateTo key is not undefined.
 * @param {() => void} [props.onFinishInstallation] Function called after the mod was installed.
 * @return {JSX.Element} The popup with mod versions.
 */
function InstallModPopup({
  modToInstall,
  setModToInstall,
  installation,
  onFinishInstallation
}: {
  modToInstall: number | string | null
  setModToInstall: Dispatch<SetStateAction<number | string | null>>
  installation?: IInstallationToInstallModIn
  onFinishInstallation?: () => void
}): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()

  const installMod = useInstallMod()
  const queryMod = useQueryMod()

  const [downloadableModToInstall, setDownloadableModToInstall] = useState<DownloadableModType | null>(null)

  useEffect(() => {
    if (!modToInstall) return
    ;(async (): Promise<void> => {
      const mod = await queryMod({ modid: modToInstall })
      setDownloadableModToInstall(mod || null)
    })()
  }, [modToInstall])

  return (
    <PopupDialogPanel
      title={t("features.mods.installMod")}
      isOpen={modToInstall !== null}
      close={() => {
        setModToInstall(null)
        setDownloadableModToInstall(null)
      }}
      maxWidth={false}
      bgDark={false}
    >
      <>
        <p>{t("features.mods.installationPopupDesc", { modName: downloadableModToInstall?.name || "MOD NOT FOUND" })}</p>
        <TableWrapper className="w-[800px]">
          <TableHead>
            <TableHeadRow>
              <TableCell className="w-2/12">{t("generic.version")}</TableCell>
              <TableCell className="w-3/12">{t("generic.releaseDate")}</TableCell>
              <TableCell className="w-5/12">{t("features.versions.labelGameVersions")}</TableCell>
              <TableCell className="w-2/12">{t("generic.actions")}</TableCell>
            </TableHeadRow>
          </TableHead>

          {!downloadableModToInstall ? (
            <div className="flex items-center justify-center py-10">
              <FiLoader className="animate-spin text-3xl text-zinc-400" />
            </div>
          ) : (
            <TableBody className="max-h-[300px]">
              {downloadableModToInstall.releases.map((release) => (
                <TableBodyRow key={release.releaseid}>
                  <TableCell className="w-2/12">{release.modversion}</TableCell>
                  <TableCell className="w-3/12">{new Date(release.created).toLocaleDateString("es")}</TableCell>
                  <TableCell className="w-5/12 overflow-hidden whitespace-nowrap text-ellipsis">
                    <input type="text" value={release.tags.join(", ")} readOnly className="w-full bg-transparent outline-hidden text-center" />
                  </TableCell>
                  <TableCell className="w-2/12 flex gap-2 items-center justify-center text-lg">
                    {installation && (
                      <FormButton
                        disabled={installation.oldMod && installation.oldMod.version === release.modversion}
                        onClick={async () => {
                          if (!installation) return addNotification(t("features.installations.noInstallationFound"), "error")
                          if (installation.installation._backuping || installation.installation._restoringBackup) return addNotification(t("features.mods.cantUpdateWhileinUse"), "error")

                          installMod({
                            mod: downloadableModToInstall,
                            path: installation.installation.path,
                            outName: installation.installation.name,
                            release,
                            oldMod: installation.oldMod,
                            onFinish: () => {
                              if (onFinishInstallation) onFinishInstallation()
                            }
                          })
                          setModToInstall(null)
                          setDownloadableModToInstall(null)
                        }}
                        className="w-7 h-7"
                        type={
                          release.tags.includes(`v${installation.installation.version}`)
                            ? "success"
                            : release.tags.some((tag) => tag.startsWith(`v${installation.installation.version.split(".").slice(0, 2).join(".")}`))
                              ? "warn"
                              : "error"
                        }
                        title={
                          release.tags.includes(`v${installation.installation.version}`)
                            ? t("features.mods.worksOnTheVersion")
                            : release.tags.some((tag) => tag.startsWith(`v${installation.installation.version.split(".").slice(0, 2).join(".")}`))
                              ? t("features.mods.shouldWorkOnTheVersion")
                              : t("features.mods.probablyDontWorkOnTheVersion")
                        }
                      >
                        <div className={clsx("w-full h-full rounded-sm flex items-center justify-center", installation.oldMod?._updatableTo === release.modversion && "bg-lime-600/15")}>
                          {installation.oldMod ? <PiArrowClockwiseDuotone /> : <PiDownloadDuotone />}
                        </div>
                      </FormButton>
                    )}
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
