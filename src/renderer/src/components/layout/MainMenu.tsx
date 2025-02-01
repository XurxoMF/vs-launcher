import { FiExternalLink } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@headlessui/react"
import { PiGearFill } from "react-icons/pi"
import { v4 as uuidv4 } from "uuid"

import icon from "@renderer/assets/icon.png"
import iconVersions from "@renderer/assets/icon-versions.png"
import iconMods from "@renderer/assets/icon-moddb.png"
import iconNews from "@renderer/assets/icon-news.png"
import iconChangelog from "@renderer/assets/icon-changelog.png"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useMakeInstallationBackup } from "@renderer/features/installations/hooks/useMakeInstallationBackup"

import LanguagesMenu from "@renderer/components/ui/LanguagesMenu"
import InstallationsDropdownMenu from "@renderer/features/installations/components/InstallationsDropdownMenu"
import TasksMenu from "@renderer/components/ui/TasksMenu"
import clsx from "clsx"

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

  const LINKS: MainMenuLinkProps[] = [
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
      icon: iconNews,
      text: t("components.mainMenu.newsTitle"),
      desc: t("components.mainMenu.newsDesc"),
      href: "https://github.com/XurxoMF/vs-launcher/discussions/categories/announcements-news"
    },
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
      if (!installationToRun) return addNotification(t("notifications.titles.error"), t("features.installations.noInstallationSelected"), "error")
      if (installationToRun._playing) return addNotification(t("notifications.titles.error"), t("features.installations.gameAlreadyRunning"), "error")

      const gameVersionToRun = config.gameVersions.find((gv) => gv.version === installationToRun.version)
      if (!gameVersionToRun) return addNotification(t("notifications.titles.error"), t("features.versions.versionNotInstalled", { version: installationToRun.version }), "error")
      if (gameVersionToRun._installing) return addNotification(t("notifications.titles.error"), t("features.versions.versionInstalling", { version: installationToRun.version }), "error")
      if (gameVersionToRun._deleting) return addNotification(t("notifications.titles.error"), t("features.versions.versionDeleting", { version: installationToRun.version }), "error")
      if (gameVersionToRun._playing) return addNotification(t("notifications.titles.error"), t("features.versions.versionPlaying", { version: installationToRun.version }), "error")

      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installationToRun.id, updates: { _playing: true } } })
      configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: gameVersionToRun.version, updates: { _playing: true } } })

      if (installationToRun.backupsAuto) {
        const backupMade = await makeInstallationBackup(installationToRun.id)
        if (!backupMade) return
      }

      const closeStatus = await window.api.gameManager.executeGame(gameVersionToRun, installationToRun)
      configDispatch({ type: CONFIG_ACTIONS.EDIT_INSTALLATION, payload: { id: installationToRun.id, updates: { _playing: false } } })
      configDispatch({ type: CONFIG_ACTIONS.EDIT_GAME_VERSION, payload: { version: gameVersionToRun.version, updates: { _playing: false } } })
      if (!closeStatus) return addNotification(t("notifications.titles.error"), t("notifications.body.gameExitedWithErrors"), "error")
    } catch (err) {
      addNotification(t("notifications.titles.error"), t("notifications.body.errorExecutingGame"), "error")
    } finally {
      window.api.utils.setPreventAppClose("remove", id, "Finished playing vintage Story.")
    }
  }

  return (
    <header className="z-99 w-[280px] flex flex-col gap-4 p-2 shadow-[0_0_5px_2px] shadow-zinc-900">
      <div className="flex h-7 shrink-0 gap-2">
        <Link to="/config" title={t("features.config.title")} className="shrink-0 w-7 h-7 bg-zinc-850 rounded flex items-center justify-center shadow shadow-zinc-900 hover:shadow-none">
          <PiGearFill />
        </Link>
        <TasksMenu />
        <LanguagesMenu />
      </div>

      <div className="h-full flex flex-col gap-2">
        {LINKS.map((link) => (
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
        <Button title={t("generic.play")} onClick={PlayHandler} className="w-full h-14 bg-vs rounded shadow-md shadow-zinc-900 hover:shadow-none">
          <p className="text-2xl">{t("generic.play")}</p>
        </Button>
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
    <div
      className={clsx(
        "w-full flex items-center gap-2 px-2 py-1 rounded duration-100 group hover:translate-x-1 border-l-4 select-none",
        currentLocation() ? "border-vs bg-vs/15" : "border-transparent"
      )}
    >
      <img src={icon} alt={text} className="w-7" />
      <div className="flex flex-col overflow-hidden whitespace-nowrap">
        <div className="font-bold text-sm flex items-center gap-2">
          <p className="overflow-hidden text-ellipsis">{text}</p>
          {external && <FiExternalLink className="text-zinc-600" />}
        </div>
        <p className="text-zinc-600 text-xs overflow-hidden text-ellipsis">{desc}</p>
      </div>
    </div>
  )
}

export default MainMenu
