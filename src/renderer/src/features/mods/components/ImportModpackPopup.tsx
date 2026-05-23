import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { PiCheckCircleDuotone, PiProhibitInsetDuotone, PiDownloadDuotone } from "react-icons/pi"
import { FiLoader } from "react-icons/fi"
import clsx from "clsx"

import { useTaskContext } from "@renderer/contexts/TaskManagerContext"
import { useQueryMod } from "../hooks/useQueryMod"

import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import { FormButton } from "@renderer/components/ui/FormComponents"

type ModStatus = "pending" | "downloading" | "done" | "failed" | "not-found" | "no-release"

function ImportModpackPopup({
  isOpen,
  manifest,
  close,
  installation,
  onFinish
}: {
  isOpen: boolean
  manifest: ModpackManifestType | null
  close: () => void
  installation: InstallationType
  onFinish: () => void
}): JSX.Element {
  const { t } = useTranslation()

  const { startDownload } = useTaskContext()
  const queryMod = useQueryMod()

  const [modStatuses, setModStatuses] = useState<Record<string, ModStatus>>({})
  const [importing, setImporting] = useState(false)

  function updateStatus(modid: string, status: ModStatus): void {
    setModStatuses((prev) => ({ ...prev, [modid]: status }))
  }

  function getInitialStatuses(mods: ModpackModEntryType[]): Record<string, ModStatus> {
    const statuses: Record<string, ModStatus> = {}
    for (const mod of mods) {
      statuses[mod.modid] = "pending"
    }
    return statuses
  }

  async function handleImport(): Promise<void> {
    if (!manifest) return

    setImporting(true)

    const versionPrefix = installation.version.split(".").slice(0, 2).join(".")

    for (const entry of manifest.mods) {
      updateStatus(entry.modid, "downloading")

      const mod = await queryMod({ modid: entry.modid })

      if (!mod) {
        updateStatus(entry.modid, "not-found")
        continue
      }

      const exactRelease = mod.releases.find((release) => release.modversion === entry.version)
      const compatibleRelease = mod.releases.find((release) => release.tags.some((tag) => tag.startsWith(versionPrefix)))
      const release = exactRelease || compatibleRelease || mod.releases[0]

      if (!release) {
        updateStatus(entry.modid, "no-release")
        continue
      }

      const installPath = await window.api.pathsManager.formatPath([installation.path, "Mods"])

      await new Promise<void>((resolve) => {
        startDownload(
          t("features.mods.modTaskName", { name: mod.name, version: `v${release.modversion}`, out: installation.name }),
          t("features.mods.modDownloadDesc", { name: mod.name, version: `v${release.modversion}`, out: installation.name }),
          "end",
          release.mainfile,
          installPath,
          `${release.modidstr}-${release.modversion}`,
          (status) => {
            updateStatus(entry.modid, status ? "done" : "failed")
            resolve()
          }
        )
      })
    }

    setImporting(false)
    onFinish()
  }

  function handleClose(): void {
    if (importing) return
    setModStatuses({})
    setImporting(false)
    close()
  }

  useEffect(() => {
    if (manifest) {
      setModStatuses(getInitialStatuses(manifest.mods))
    }
  }, [manifest])

  return (
    <PopupDialogPanel title={t("features.mods.importModpackTitle")} isOpen={isOpen} close={handleClose} fixedWidth={false}>
      <>
        {manifest && (
          <>
            <p>{t("features.mods.importModpackDesc", { name: manifest.name })}</p>

            {manifest.gameVersion !== installation.version && (
              <p className="text-yellow-400 text-sm">
                {t("features.mods.importModpackVersionWarning", { packVersion: manifest.gameVersion, installVersion: installation.version })}
              </p>
            )}

            <TableWrapper className="w-[40rem]">
              <TableHead>
                <TableHeadRow>
                  <TableCell className="w-5/12">{t("generic.name")}</TableCell>
                  <TableCell className="w-3/12">{t("generic.version")}</TableCell>
                  <TableCell className="w-4/12">{t("generic.status")}</TableCell>
                </TableHeadRow>
              </TableHead>

              <TableBody className="max-h-[18rem]">
                {manifest.mods.map((mod) => {
                  const status = modStatuses[mod.modid] || "pending"
                  return (
                    <TableBodyRow key={mod.modid}>
                      <TableCell className="w-5/12 overflow-hidden whitespace-nowrap text-ellipsis">{mod.modid}</TableCell>
                      <TableCell className="w-3/12">{mod.version}</TableCell>
                      <TableCell className="w-4/12">
                        <span className={clsx("flex items-center justify-center gap-1 text-sm", statusColor(status))}>
                          <StatusIcon status={status} />
                          {statusLabel(status, t)}
                        </span>
                      </TableCell>
                    </TableBodyRow>
                  )
                })}
              </TableBody>
            </TableWrapper>

            <div className="flex gap-2 justify-center">
              {!importing ? (
                <FormButton
                  title={t("features.mods.importModpackButton")}
                  className="p-1 px-4 h-8"
                  onClick={handleImport}
                  type="success"
                  disabled={manifest.mods.length === 0}
                >
                  <PiDownloadDuotone className="text-xl" />
                  <p>{t("features.mods.importModpackButton")}</p>
                </FormButton>
              ) : (
                <FormButton title={t("features.mods.importModpackImporting")} className="p-1 px-4 h-8" type="normal" disabled onClick={() => {}}>
                  <FiLoader className="animate-spin text-xl" />
                  <p>{t("features.mods.importModpackImporting")}</p>
                </FormButton>
              )}
            </div>
          </>
        )}
      </>
    </PopupDialogPanel>
  )
}

function StatusIcon({ status }: { status: ModStatus }): JSX.Element {
  switch (status) {
    case "done":
      return <PiCheckCircleDuotone />
    case "downloading":
      return <FiLoader className="animate-spin" />
    case "failed":
    case "not-found":
    case "no-release":
      return <PiProhibitInsetDuotone />
    default:
      return <PiDownloadDuotone />
  }
}

function statusColor(status: ModStatus): string {
  switch (status) {
    case "done":
      return "text-green-400"
    case "downloading":
      return "text-blue-400"
    case "failed":
    case "not-found":
    case "no-release":
      return "text-red-400"
    default:
      return "text-zinc-400"
  }
}

function statusLabel(status: ModStatus, t: (key: string) => string): string {
  switch (status) {
    case "done":
      return t("features.mods.importModpackStatusDone")
    case "downloading":
      return t("features.mods.importModpackStatusDownloading")
    case "failed":
      return t("features.mods.importModpackStatusFailed")
    case "not-found":
      return t("features.mods.importModpackNotFound")
    case "no-release":
      return t("features.mods.importModpackNoRelease")
    default:
      return t("features.mods.importModpackStatusPending")
  }
}

export default ImportModpackPopup
