import { ReactNode, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { PiBoxArrowDownDuotone, PiFolderOpenDuotone, PiGearDuotone, PiWrenchDuotone, PiGitForkDuotone, PiHouseLineDuotone, PiPencilDuotone, PiPlusCircleDuotone } from "react-icons/pi"
import { v4 as uuidv4 } from "uuid"
import clsx from "clsx"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useMakeInstallationBackup } from "@renderer/features/installations/hooks/useMakeInstallationBackup"

import InstallationsDropdownMenu from "@renderer/features/installations/components/InstallationsDropdownMenu"
import TasksMenu from "@renderer/components/ui/TasksMenu"
import { NormalButton } from "@renderer/components/ui/Buttons"
import { FormButton, FormLinkButton } from "@renderer/components/ui/FormComponents"
import SessionButton from "../ui/SessionButton"

interface MainMenuLinkProps {
  icon: ReactNode
  text: string
  desc: string
  to: string
}

function MainMenu(): JSX.Element {
  const { t } = useTranslation()
  const { config, configDispatch } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  const makeInstallationBackup = useMakeInstallationBackup()

  const [selectedInstallation, setSelectedInstallation] = useState<InstallationType | undefined>(undefined)

  useEffect(() => {
    const si = config.installations.find((i) => i.id === config.lastUsedInstallation)
    setSelectedInstallation(si)
  }, [config.lastUsedInstallation, config.installations])

  const GROUP_1: MainMenuLinkProps[] = [
    { icon: <PiHouseLineDuotone />, text: t("components.mainMenu.homeTitle"), desc: t("components.mainMenu.homeDesc"), to: "/" },
    { icon: <PiFolderOpenDuotone />, text: t("components.mainMenu.installationsTitle"), desc: t("components.mainMenu.installationsDesc"), to: "/installations" },
    { icon: <PiGitForkDuotone />, text: t("components.mainMenu.versionsTitle"), desc: t("components.mainMenu.versionsDesc"), to: "/versions" },
    { icon: <PiWrenchDuotone />, text: t("components.mainMenu.modsTitle"), desc: t("components.mainMenu.modsDesc"), to: "/mods" },
    { icon: <PiGearDuotone />, text: t("components.mainMenu.configTitle"), desc: t("components.mainMenu.configDesc"), to: "/config" }
  ]

  async function PlayHandler(): Promise<void> {
    const id = uuidv4()
    window.api.utils.setPreventAppClose("add", id, "Started playing Vintage Story.")

    try {
      if (!selectedInstallation) return addNotification(t("features.installations.noInstallationSelected"), "error")
      if (selectedInstallation._playing) return addNotification(t("features.installations.gameAlreadyRunning"), "error")

      const gameVersionToRun = config.gameVersions.find((gv) => gv.version === selectedInstallation.version)
      if (!gameVersionToRun) return addNotification(t("features.versions.versionNotInstalled", { version: selectedInstallation.version }), "error")
      if (gameVersionToRun._installing) return addNotification(t("features.versions.versionInstalling", { version: selectedInstallation.version }), "error")
      if (gameVersionToRun._deleting) return addNotification(t("features.versions.versionDeleting", { version: selectedInstallation.version }), "error")
      if (gameVersionToRun._playing) return addNotification(t("features.versions.versionPlaying", { version: selectedInstallation.version }), "error")

      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: selectedInstallation.id, updates: { _playing: true } } })
      configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: gameVersionToRun.version, updates: { _playing: true } } })

      if (selectedInstallation.backupsAuto) {
        const backupMade = await makeInstallationBackup(selectedInstallation.id)
        if (!backupMade) return
      }

      const startedPlaying = Date.now()
      const closeStatus = await window.api.gameManager.executeGame(gameVersionToRun, selectedInstallation, config.account)
      const finishedPlaying = Date.now()
      const ttp = finishedPlaying - startedPlaying + selectedInstallation.totalTimePlayed
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: selectedInstallation.id, updates: { _playing: false, lastTimePlayed: finishedPlaying, totalTimePlayed: ttp } } })
      configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: gameVersionToRun.version, updates: { _playing: false } } })
      if (!closeStatus) return addNotification(t("notifications.body.gameExitedWithErrors"), "error")
    } catch (err) {
      addNotification(t("notifications.body.errorExecutingGame"), "error")
    } finally {
      window.api.utils.setPreventAppClose("remove", id, "Finished playing vintage Story.")
    }
  }

  return (
    <header className="z-99 w-72 shrink-0 flex flex-col gap-4 p-2 bg-zinc-950/30 shadow-sm shadow-zinc-950/50 backdrop-blur-sm border-r border-zinc-400/5">
      <div className="flex items-center shrink-0 gap-2">
        <SessionButton />
        <TasksMenu />
      </div>

      <div className="h-full flex flex-col gap-2">
        {GROUP_1.map((link) => (
          <Link key={link.to} to={link.to} className="flex items-start">
            <LinkContent icon={link.icon} text={link.text} desc={link.desc} link={link.to} />
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <InstallationsDropdownMenu />

        <div className="w-full flex gap-2 items-center">
          <NormalButton
            title={t("generic.play")}
            disabled={!selectedInstallation}
            onClick={PlayHandler}
            className="w-full h-14 bg-vs disabled:opacity-50 shadow-sm shadow-zinc-950/50 hover:shadow-none"
          >
            <p className="text-2xl">{t("generic.play")}</p>
          </NormalButton>

          {selectedInstallation && (
            <div className="shrink-0 w-14 h-full grid grid-cols-2 grid-rows-2 gap-1 text-sm">
              <FormButton
                className="p-1"
                title={t("generic.backup")}
                onClick={async () => {
                  if (!(await window.api.pathsManager.checkPathExists(selectedInstallation.path))) return addNotification(t("features.backups.folderDoesntExists"), "error")
                  makeInstallationBackup(selectedInstallation.id)
                }}
              >
                <PiBoxArrowDownDuotone />
              </FormButton>
              <FormLinkButton to={`/installations/mods/${selectedInstallation.id}`} title={t("features.mods.manageMods")}>
                <PiWrenchDuotone />
              </FormLinkButton>
              <FormLinkButton title={t("generic.edit")} to={`/installations/edit/${selectedInstallation.id}`}>
                <PiPencilDuotone />
              </FormLinkButton>
              <FormLinkButton title={t("generic.add")} to="/installations/add">
                <PiPlusCircleDuotone />
              </FormLinkButton>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

interface LinkContentProps {
  icon: ReactNode
  text: string
  desc: string
  link: string
}

function LinkContent({ icon, text, desc, link }: LinkContentProps): JSX.Element {
  const location = useLocation()

  function currentLocation(): boolean {
    // If we are on the main page return true.
    if (link === "/") return location.pathname === "/"
    // If we are on any other page return true if the current page URL starts with the menu option URL.
    return location.pathname.startsWith(link)
  }

  return (
    <div className={clsx("w-full flex items-center gap-2 px-2 py-1 rounded-sm duration-100 hover:pl-3 border-l-4", currentLocation() ? "border-vs bg-vs/15" : "border-transparent")}>
      <span className="text-2xl text-zinc-400">{icon}</span>
      <div className="flex flex-col overflow-hidden whitespace-nowrap">
        <p className="font-bold text-sm overflow-hidden text-ellipsis">{text}</p>
        <p className="text-zinc-500 text-xs overflow-hidden text-ellipsis">{desc}</p>
      </div>
    </div>
  )
}

export default MainMenu
