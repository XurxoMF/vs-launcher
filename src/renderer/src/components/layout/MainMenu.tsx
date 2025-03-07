import { ReactNode, useEffect, useState } from "react"
import { FiExternalLink } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import {
  PiBoxArrowDownDuotone,
  PiFolderOpenDuotone,
  PiGearDuotone,
  PiGitForkDuotone,
  PiHouseLineDuotone,
  PiNoteDuotone,
  PiPencilDuotone,
  PiPlusCircleDuotone,
  PiUserCheckDuotone,
  PiUserDuotone
} from "react-icons/pi"
import { v4 as uuidv4 } from "uuid"
import clsx from "clsx"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useMakeInstallationBackup } from "@renderer/features/installations/hooks/useMakeInstallationBackup"

import LanguagesMenu from "@renderer/components/ui/LanguagesMenu"
import InstallationsDropdownMenu from "@renderer/features/installations/components/InstallationsDropdownMenu"
import TasksMenu from "@renderer/components/ui/TasksMenu"
import { NormalButton } from "@renderer/components/ui/Buttons"
import { FormButton, FormLinkButton } from "@renderer/components/ui/FormComponents"

interface MainMenuLinkProps {
  icon: ReactNode
  text: string
  desc: string
  to: string
}

interface MainMenuAProps {
  icon: ReactNode
  text: string
  desc: string
  href: string
}

function MainMenu(): JSX.Element {
  const { t } = useTranslation()
  const { config, configDispatch } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  const makeInstallationBackup = useMakeInstallationBackup()

  const [seletedInstallation, setSelectedInstallation] = useState<InstallationType | undefined>(undefined)

  useEffect(() => {
    const si = config.installations.find((i) => i.id === config.lastUsedInstallation)
    setSelectedInstallation(si)
  }, [config.lastUsedInstallation, config.installations])

  const GROUP_1: MainMenuLinkProps[] = [
    {
      icon: <PiHouseLineDuotone />,
      text: t("components.mainMenu.homeTitle"),
      desc: t("components.mainMenu.homeDesc"),
      to: "/"
    },
    {
      icon: <PiFolderOpenDuotone />,
      text: t("components.mainMenu.installationsTitle"),
      desc: t("components.mainMenu.installationsDesc"),
      to: "/installations"
    },
    {
      icon: <PiGitForkDuotone />,
      text: t("components.mainMenu.versionsTitle"),
      desc: t("components.mainMenu.versionsDesc"),
      to: "/versions"
    },
    {
      icon: <PiGearDuotone />,
      text: t("components.mainMenu.modsTitle"),
      desc: t("components.mainMenu.modsDesc"),
      to: "/mods"
    }
  ]

  const AS: MainMenuAProps[] = [
    {
      icon: <PiNoteDuotone />,
      text: t("components.mainMenu.changelogTitle"),
      desc: t("components.mainMenu.changelogDesc"),
      href: "https://www.vintagestory.at/blog.html/news"
    }
  ]

  async function PlayHandler(): Promise<void> {
    const id = uuidv4()
    window.api.utils.setPreventAppClose("add", id, "Started playing Vintage Story.")

    try {
      if (!seletedInstallation) return addNotification(t("features.installations.noInstallationSelected"), "error")
      if (seletedInstallation._playing) return addNotification(t("features.installations.gameAlreadyRunning"), "error")

      const gameVersionToRun = config.gameVersions.find((gv) => gv.version === seletedInstallation.version)
      if (!gameVersionToRun) return addNotification(t("features.versions.versionNotInstalled", { version: seletedInstallation.version }), "error")
      if (gameVersionToRun._installing) return addNotification(t("features.versions.versionInstalling", { version: seletedInstallation.version }), "error")
      if (gameVersionToRun._deleting) return addNotification(t("features.versions.versionDeleting", { version: seletedInstallation.version }), "error")
      if (gameVersionToRun._playing) return addNotification(t("features.versions.versionPlaying", { version: seletedInstallation.version }), "error")

      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: seletedInstallation.id, updates: { _playing: true } } })
      configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: gameVersionToRun.version, updates: { _playing: true } } })

      if (seletedInstallation.backupsAuto) {
        const backupMade = await makeInstallationBackup(seletedInstallation.id)
        if (!backupMade) return
      }

      const startedPlaying = Date.now()
      const closeStatus = await window.api.gameManager.executeGame(gameVersionToRun, seletedInstallation, config.account)
      const finishedPlaying = Date.now()
      const ttp = finishedPlaying - startedPlaying + seletedInstallation.totalTimePlayed
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: seletedInstallation.id, updates: { _playing: false, lastTimePlayed: finishedPlaying, totalTimePlayed: ttp } } })
      configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: gameVersionToRun.version, updates: { _playing: false } } })
      if (!closeStatus) return addNotification(t("notifications.body.gameExitedWithErrors"), "error")
    } catch (err) {
      addNotification(t("notifications.body.errorExecutingGame"), "error")
    } finally {
      window.api.utils.setPreventAppClose("remove", id, "Finished playing vintage Story.")
    }
  }

  return (
    <header className="z-99 w-[280px] flex flex-col gap-4 p-2 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 backdrop-blur-sm border-r border-zinc-400/5">
      <div className="flex h-7 shrink-0 gap-2">
        <FormLinkButton to="/config" title={t("features.config.title")} className="shrink-0 w-8 h-8">
          <PiGearDuotone />
        </FormLinkButton>
        {!config.account ? (
          <FormLinkButton to="/login" title={t("features.config.loginTitle")} className="shrink-0 w-8 h-8">
            <PiUserDuotone />
          </FormLinkButton>
        ) : (
          <FormButton
            onClick={(e) => {
              e.stopPropagation()
              configDispatch({ type: CONFIG_ACTIONS.SET_ACCOUNT, payload: null })
              addNotification(t("features.config.loggedout"), "success")
            }}
            type={config.account ? "success" : "normal"}
            title={`${t("features.config.logoutTitle")} · ${config.account.playerName}`}
            className="shrink-0 w-8 h-8"
          >
            <PiUserCheckDuotone />
          </FormButton>
        )}
        <TasksMenu />
        <LanguagesMenu />
      </div>

      <div className="h-full flex flex-col gap-2">
        {GROUP_1.map((link) => (
          <Link key={link.to} to={link.to} className="flex items-start">
            <LinkContent icon={link.icon} text={link.text} desc={link.desc} link={link.to} external={false} />
          </Link>
        ))}
        {AS.map((link) => (
          <a key={link.href} onClick={() => window.api.utils.openOnBrowser(link.href)} className="flex items-start cursor-pointer">
            <LinkContent icon={link.icon} text={link.text} desc={link.desc} link={link.href} external={true} />
          </a>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <InstallationsDropdownMenu />
        <div className="w-full flex gap-2 items-center">
          <NormalButton
            title={t("generic.play")}
            disabled={!seletedInstallation}
            onClick={PlayHandler}
            className="w-full h-14 bg-vs disabled:text-zinc-600 disabled:bg-vs/20 shadow-sm shadow-zinc-950/50 hover:shadow-none"
          >
            <p className="text-2xl">{t("generic.play")}</p>
          </NormalButton>
          {seletedInstallation && (
            <div className="shrink-0 w-14 h-full grid grid-cols-2 grid-rows-2 gap-1 text-sm">
              <FormButton
                className="p-1"
                title={t("generic.backup")}
                onClick={async () => {
                  if (!(await window.api.pathsManager.checkPathExists(seletedInstallation.path))) return addNotification(t("features.backups.folderDoesntExists"), "error")
                  makeInstallationBackup(seletedInstallation.id)
                }}
              >
                <PiBoxArrowDownDuotone />
              </FormButton>
              <FormLinkButton to={`/installations/mods/${seletedInstallation.id}`} title={t("features.mods.manageMods")}>
                <PiGearDuotone />
              </FormLinkButton>
              <FormLinkButton title={t("generic.edit")} to={`/installations/edit/${seletedInstallation.id}`}>
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
  external: boolean
}

function LinkContent({ icon, text, desc, link, external }: LinkContentProps): JSX.Element {
  const location = useLocation()

  function currentLocation(): boolean {
    if (link === "/") return location.pathname === "/"
    return location.pathname.startsWith(link)
  }

  return (
    <div className={clsx("w-full flex items-center gap-2 px-2 py-1 rounded-sm duration-100 group hover:pl-3 border-l-4", currentLocation() ? "border-vs bg-vs/15" : "border-transparent")}>
      <span className="text-2xl text-zinc-400">{icon}</span>
      <div className="flex flex-col overflow-hidden whitespace-nowrap">
        <div className="font-bold text-sm flex items-center gap-2">
          <p className="overflow-hidden text-ellipsis">{text}</p>
          {external && <FiExternalLink className="text-zinc-500" />}
        </div>
        <p className="text-zinc-500 text-xs overflow-hidden text-ellipsis">{desc}</p>
      </div>
    </div>
  )
}

export default MainMenu
