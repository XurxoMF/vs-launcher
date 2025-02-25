import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { PiDownloadFill, PiArrowClockwiseFill } from "react-icons/pi"
import { FiLoader } from "react-icons/fi"

import { useInstallMod } from "../hooks/useInstallMod"
import { useQueryMod } from "../hooks/useQueryMod"

import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import { FormButton } from "@renderer/components/ui/FormComponents"
import clsx from "clsx"

/**
 * Popup with a mod's installable versions with colors for compatible updates, automatic remove of the old installed version, etc.
 *
 * @param {Object} props
 * @param {number | string | null} [props.modToInstall] useState with the ModID of the mod to install. String from modinfo.json like mycoolmod, number or null if the popup is closed.
 * @param {() => void} [props.setModToInstall] Function called to close the popup. Set modToInstall to null when it's called.
 * @param {string} [props.pathToIsntall] Path to look for mods. /Mods will be added at the end.
 * @param {string} [props.version] Installation/Server version to check if there are compatible updates WITHOUT "v"! Example: ~~v1.2.3~~ 1.2.3
 * @param {string} [props.outName] Name of the Server or Installation where the mod will be installed.
 * @param {InstalledModType} [props.oldMod] The old mod(if there's any) to check for updates and update if it's needed. It'll not get available updates, it'll only check it the _updateTo key is not undefined.
 * @param {() => void} [props.onFinishInstallation] Function called after the mod was installed.
 * @return {JSX.Element} The popup with mod versions.
 */
function InstallModPopup({
  modToInstall,
  setModToInstall,
  pathToInstall,
  version,
  outName,
  oldMod,
  onFinishInstallation
}: {
  modToInstall: number | string
  setModToInstall: Dispatch<SetStateAction<number | string | null>>
  pathToInstall: string
  version: string
  outName: string
  oldMod?: InstalledModType
  onFinishInstallation?: () => void
}): JSX.Element {
  const { t } = useTranslation()

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
    >
      <>
        <p>{t("features.mods.installationPopupDesc", { modName: downloadableModToInstall?.name || "MOD NOT FOUND" })}</p>
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
              {downloadableModToInstall.releases.map((release) => (
                <TableBodyRow key={release.releaseid} disabled={oldMod && oldMod.version === release.modversion}>
                  <div className={clsx("w-full flex", oldMod?._updatableTo === release.modversion && "bg-lime-600/15")}>
                    <TableCell className="w-2/12">{release.modversion}</TableCell>
                    <TableCell className="w-3/12">{new Date(release.created).toLocaleDateString("es")}</TableCell>
                    <TableCell className="w-5/12 overflow-hidden whitespace-nowrap text-ellipsis">
                      <input type="text" value={release.tags.join(", ")} readOnly className="w-full bg-transparent outline-hidden text-center" />
                    </TableCell>
                    <TableCell className="w-2/12 flex gap-2 items-center justify-center text-lg">
                      <FormButton
                        disabled={oldMod && oldMod.version === release.modversion}
                        onClick={async () => {
                          installMod({
                            mod: downloadableModToInstall,
                            path: pathToInstall,
                            outName,
                            release,
                            oldMod,
                            onFinish: () => {
                              if (onFinishInstallation) onFinishInstallation()
                            }
                          })
                          setModToInstall(null)
                          setDownloadableModToInstall(null)
                        }}
                        className="w-7 h-7"
                        type={release.tags.includes(`v${version}`) ? "success" : release.tags.some((tag) => tag.startsWith(`v${version.split(".").slice(0, 2).join(".")}`)) ? "warn" : "error"}
                        title={oldMod ? t("features.installations.updateOnInstallation") : t("features.installations.installOnInstallation")}
                      >
                        {oldMod ? <PiArrowClockwiseFill /> : <PiDownloadFill />}
                      </FormButton>
                    </TableCell>
                  </div>
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
