import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { PiCheckCircleDuotone, PiProhibitInsetDuotone, PiDownloadDuotone, PiMinusCircleDuotone, PiWarningDuotone } from "react-icons/pi"
import { FiLoader } from "react-icons/fi"
import clsx from "clsx"

import { compareVersions } from "@renderer/utils/semver"
import { useTaskContext } from "@renderer/contexts/TaskManagerContext"
import { useQueryMod } from "../hooks/useQueryMod"

import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import { FormButton } from "@renderer/components/ui/FormComponents"
import ModChangeSummaryPopup from "./ModChangeSummaryPopup"

type ModStatus = "pending" | "downloading" | "done" | "failed" | "not-found" | "no-release" | "already-present"

function ImportModpackPopup({
  isOpen,
  manifest,
  close,
  installation,
  installedMods,
  onFinish
}: {
  isOpen: boolean
  manifest: ModpackManifestType | null
  close: () => void
  installation: InstallationType
  installedMods: InstalledModType[]
  onFinish: () => void
}): JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { startDownload } = useTaskContext()
  const queryMod = useQueryMod()

  const [modStatuses, setModStatuses] = useState<Record<string, ModStatus>>({})
  const [importing, setImporting] = useState(false)
  const [summaryEntries, setSummaryEntries] = useState<ModChangeSummaryEntry[]>([])
  const [showSummary, setShowSummary] = useState(false)

  const downgradedMods = useMemo(() => {
    if (!manifest) return []
    return manifest.mods.filter((entry) => {
      const existing = installedMods.find((m) => m.modid === entry.modid)
      return existing && compareVersions(entry.version, existing.version) < 0
    })
  }, [manifest, installedMods])

  const completedCount = useMemo(() => {
    return Object.values(modStatuses).filter((s) => s !== "pending" && s !== "downloading").length
  }, [modStatuses])

  const totalCount = manifest?.mods.length ?? 0
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

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
    const collected: ModChangeSummaryEntry[] = []

    for (const entry of manifest.mods) {
      updateStatus(entry.modid, "downloading")

      const existingMod = installedMods.find((m) => m.modid === entry.modid)

      if (existingMod && existingMod.version === entry.version) {
        updateStatus(entry.modid, "already-present")
        collected.push({ name: existingMod.name, modid: entry.modid, fromVersion: existingMod.version, toVersion: existingMod.version, assetid: existingMod._mod?.assetid, alreadyPresent: true })
        continue
      }

      const mod = await queryMod({ modid: entry.modid })

      if (!mod) {
        updateStatus(entry.modid, "not-found")
        collected.push({ name: entry.modid, modid: entry.modid, fromVersion: existingMod?.version ?? null, toVersion: null })
        continue
      }

      const exactRelease = mod.releases.find((release) => release.modversion === entry.version)
      const compatibleRelease = mod.releases.find((release) => release.tags.some((tag) => tag.startsWith(versionPrefix)))
      const release = exactRelease || compatibleRelease || mod.releases[0]

      if (!release) {
        updateStatus(entry.modid, "no-release")
        collected.push({ name: mod.name, modid: entry.modid, fromVersion: existingMod?.version ?? null, toVersion: null, assetid: mod.assetid })
        continue
      }

      if (existingMod) {
        await window.api.pathsManager.deletePath(existingMod.path)
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
            collected.push({ name: mod.name, modid: entry.modid, fromVersion: existingMod?.version ?? null, toVersion: status ? release.modversion : null, assetid: mod.assetid })
            resolve()
          }
        )
      })
    }

    setImporting(false)
    setSummaryEntries(collected)
    setShowSummary(true)
  }

  function handleClose(): void {
    if (importing) return
    setModStatuses({})
    setImporting(false)
    setSummaryEntries([])
    setShowSummary(false)
    close()
  }

  useEffect(() => {
    if (manifest) {
      setModStatuses(getInitialStatuses(manifest.mods))
      setSummaryEntries([])
      setShowSummary(false)
    }
  }, [manifest])

  if (showSummary) {
    return (
      <ModChangeSummaryPopup
        isOpen={isOpen}
        close={() => {
          handleClose()
          onFinish()
        }}
        title={t("features.mods.importSummaryTitle")}
        entries={summaryEntries}
      />
    )
  }

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

            {downgradedMods.length > 0 && (
              <div className="flex items-center justify-between gap-4 rounded-sm bg-orange-500/10 border border-orange-500/30 px-3 py-2 text-sm text-orange-300">
                <span className="flex items-center gap-2">
                  <PiWarningDuotone className="text-lg shrink-0" />
                  {t("features.mods.importModpackDowngradeWarning", { count: downgradedMods.length })}
                </span>
                <button
                  className="shrink-0 underline hover:text-orange-200 duration-150"
                  onClick={() => {
                    handleClose()
                    navigate(`/installations/backups/${installation.id}`)
                  }}
                >
                  {t("features.mods.importModpackDowngradeBackupLink")}
                </button>
              </div>
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

            {importing && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>{t("features.mods.importModpackProgress", { completed: completedCount, total: totalCount })}</span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-700/50">
                  <div className="h-full rounded-full bg-vs transition-all duration-300" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}

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
    case "already-present":
      return <PiMinusCircleDuotone />
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
    case "already-present":
      return "text-zinc-400"
    case "downloading":
      return "text-blue-400"
    case "failed":
    case "not-found":
    case "no-release":
      return "text-red-400"
    default:
      return "text-zinc-500"
  }
}

function statusLabel(status: ModStatus, t: (key: string) => string): string {
  switch (status) {
    case "done":
      return t("features.mods.importModpackStatusDone")
    case "already-present":
      return t("features.mods.importModpackAlreadyPresent")
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
