import { FiExternalLink } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { PiGearFill } from "react-icons/pi"
import { v4 as uuidv4 } from "uuid"
import clsx from "clsx"

import icon from "@renderer/assets/icon.png"
import iconVersions from "@renderer/assets/icon-versions.png"
import iconMods from "@renderer/assets/icon-moddb.png"
import iconChangelog from "@renderer/assets/icon-changelog.png"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useMakeInstallationBackup } from "@renderer/features/installations/hooks/useMakeInstallationBackup"

import LanguagesMenu from "@renderer/components/ui/LanguagesMenu"
import InstallationsDropdownMenu from "@renderer/features/installations/components/InstallationsDropdownMenu"
import TasksMenu from "@renderer/components/ui/TasksMenu"
import { NormalButton } from "../ui/Buttons"
import { FormLinkButton } from "../ui/FormComponents"

interface MainMenuLinkProps {
  icon: string
  text: string
  desc: string
  to: string
}

interface MainMenuAProps {
  icon: string
  text: string
  desc: string
  href: string
}

function MainMenu(): JSX.Element {
  const { t } = useTranslation()
  const { config, configDispatch } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  const makeInstallationBackup = useMakeInstallationBackup()

  const GROUP_1: MainMenuLinkProps[] = [
    {
      icon: icon,
      text: t("components.mainMenu.homeTitle"),
      desc: t("components.mainMenu.homeDesc"),
      to: "/"
    },
    {
      icon: iconVersions,
      text: t("components.mainMenu.installationsTitle"),
      desc: t("components.mainMenu.installationsDesc"),
      to: "/installations"
    },
    {
      icon: iconVersions,
      text: t("components.mainMenu.versionsTitle"),
      desc: t("components.mainMenu.versionsDesc"),
      to: "/versions"
    },
    {
      icon: iconMods,
      text: t("components.mainMenu.modsTitle"),
      desc: t("components.mainMenu.modsDesc"),
      to: "/mods"
    }
  ]

  const AS: MainMenuAProps[] = [
    {
      icon: iconChangelog,
      text: t("components.mainMenu.changelogTitle"),
      desc: t("components.mainMenu.changelogDesc"),
      href: "https://www.vintagestory.at/blog.html/news"
    }
  ]

  async function PlayHandler(): Promise<void> {
    const id = uuidv4()
    window.api.utils.setPreventAppClose("add", id, "Started playing Vintage Story.")

    try {
      const installationToRun = config.installations.find((installation) => installation.id === config.lastUsedInstallation)
      if (!installationToRun) return addNotification(t("features.installations.noInstallationSelected"), "error")
      if (installationToRun._playing) return addNotification(t("features.installations.gameAlreadyRunning"), "error")

      const gameVersionToRun = config.gameVersions.find((gv) => gv.version === installationToRun.version)
      if (!gameVersionToRun) return addNotification(t("features.versions.versionNotInstalled", { version: installationToRun.version }), "error")
      if (gameVersionToRun._installing) return addNotification(t("features.versions.versionInstalling", { version: installationToRun.version }), "error")
      if (gameVersionToRun._deleting) return addNotification(t("features.versions.versionDeleting", { version: installationToRun.version }), "error")
      if (gameVersionToRun._playing) return addNotification(t("features.versions.versionPlaying", { version: installationToRun.version }), "error")

      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installationToRun.id, updates: { _playing: true } } })
      configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: gameVersionToRun.version, updates: { _playing: true } } })

      if (installationToRun.backupsAuto) {
        const backupMade = await makeInstallationBackup(installationToRun.id)
        if (!backupMade) return
      }

      const closeStatus = await window.api.gameManager.executeGame(gameVersionToRun, installationToRun)
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installationToRun.id, updates: { _playing: false } } })
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
          <PiGearFill />
        </FormLinkButton>
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
        <NormalButton title={t("generic.play")} onClick={PlayHandler} className="w-full h-14 bg-vs/75 shadow-sm shadow-zinc-950/50 hover:shadow-none">
          <p className="text-2xl">{t("generic.play")}</p>
        </NormalButton>
      </div>
    </header>
  )
}

interface LinkContentProps {
  icon: string
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
      <img src={icon} alt={text} className="w-7" />
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
