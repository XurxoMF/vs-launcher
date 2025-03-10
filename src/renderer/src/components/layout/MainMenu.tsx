import { ReactNode, useEffect, useState } from "react"
import { FiExternalLink } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import {
  PiBoxArrowDownDuotone,
  PiFloppyDiskBackDuotone,
  PiFolderOpenDuotone,
  PiGearDuotone,
  PiGitForkDuotone,
  PiHouseLineDuotone,
  PiNoteDuotone,
  PiPencilDuotone,
  PiPlusCircleDuotone,
  PiUserCheckDuotone,
  PiUserDuotone,
  PiXCircleDuotone
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
import {
  ButtonsWrapper,
  FormBody,
  FormButton,
  FormFieldDescription,
  FormFieldGroup,
  FormFieldGroupWithDescription,
  FormGroupWrapper,
  FormHead,
  FormInputPassword,
  FormInputText,
  FormLabel,
  FormLinkButton,
  FromGroup,
  FromWrapper
} from "@renderer/components/ui/FormComponents"
import PopupDialogPanel from "../ui/PopupDialogPanel"

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

  // Log In states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twofacode, setTwofacode] = useState("")

  const [loggingIn, setLoggingIn] = useState(false)
  const [logInOpen, setLogInOpen] = useState<boolean>(false)

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

  async function handleLogin(): Promise<void> {
    setLoggingIn(true)
    addNotification(t("features.config.loggingin"), "info")

    // Thanks a lot to https://github.com/scgm0 for teaching me how to login using the Vintage Story Game Account
    // If you're reading this, make sure to check out MVL https://github.com/scgm0/MVL

    const preLogin = await window.api.netManager.postUrl("https://auth3.vintagestory.at/v2/gamelogin", { email, password })

    if (preLogin["valid"] == 0) {
      const reason = preLogin["reason"]

      if (reason == "requiretotpcode") {
        const fullLogin = await window.api.netManager.postUrl("https://auth3.vintagestory.at/v2/gamelogin", { email, password, preLoginToken: preLogin["prelogintoken"], twofacode })

        if (fullLogin["valid"] == 0 && fullLogin["reason"] == "wrongtotpcode") return addNotification(t("features.config.wrongtwofa"), "error")

        saveLogin(fullLogin)
      } else if (reason == "invalidemailorpassword") {
        addNotification(t("features.config.invalidEmailPass"), "error")
      }
    } else {
      saveLogin(preLogin)
    }
  }

  async function saveLogin(data: object): Promise<void> {
    const newAccount: AccountType = {
      email: email,
      playerName: data["playername"],
      playerUid: data["uid"],
      playerEntitlements: data["entitlements"],
      sessionKey: data["sessionkey"],
      sessionSignature: data["sessionsignature"],
      mptoken: data["mptoken"],
      hostGameServer: data["hasgameserver"]
    }

    configDispatch({
      type: CONFIG_ACTIONS.SET_ACCOUNT,
      payload: newAccount
    })

    addNotification(t("features.config.loggedin", { user: newAccount.playerName }), "success")
    setLoggingIn(false)
    setLogInOpen(false)
  }

  return (
    <header className="z-99 w-[280px] flex flex-col gap-4 p-2 bg-zinc-950/30 shadow-sm shadow-zinc-950/50 backdrop-blur-sm border-r border-zinc-400/5">
      <div className="flex h-7 shrink-0 gap-2">
        <FormLinkButton to="/config" title={t("features.config.title")} className="shrink-0 w-8 h-8">
          <PiGearDuotone />
        </FormLinkButton>
        {!config.account ? (
          <FormButton onClick={() => setLogInOpen(true)} type="warn" title={t("features.config.loginTitle")} className="shrink-0 w-8 h-8">
            <PiUserDuotone />
          </FormButton>
        ) : (
          <FormButton
            onClick={(e) => {
              e.stopPropagation()
              configDispatch({ type: CONFIG_ACTIONS.SET_ACCOUNT, payload: null })
              addNotification(t("features.config.loggedout"), "success")
            }}
            type="success"
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

      <PopupDialogPanel title={t("features.config.loginTitle")} isOpen={logInOpen} close={() => setLogInOpen(false)} maxWidth={false} bgDark={false}>
        <FromWrapper className="w-[500px]">
          <FormGroupWrapper bgDark={false}>
            <FromGroup>
              <FormHead>
                <FormLabel content={t("generic.email")} />
              </FormHead>

              <FormBody>
                <FormFieldGroup>
                  <FormInputText
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                    }}
                    placeholder={t("generic.email")}
                    readOnly={loggingIn}
                  />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("generic.password")} />
              </FormHead>

              <FormBody>
                <FormFieldGroup>
                  <FormInputPassword
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                    }}
                    placeholder={t("generic.password")}
                    readOnly={loggingIn}
                  />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("generic.twofacode")} />
              </FormHead>

              <FormBody>
                <FormFieldGroupWithDescription>
                  <FormInputText
                    value={twofacode}
                    onChange={(e) => {
                      setTwofacode(e.target.value)
                    }}
                    placeholder={t("generic.twofacode")}
                    minLength={6}
                    maxLength={6}
                    readOnly={loggingIn}
                  />
                  <FormFieldDescription content={t("features.config.onlyIfEnabledTwoFA")} />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>

          <ButtonsWrapper className="text-lg" bgDark={false}>
            <FormButton onClick={() => setLogInOpen(false)} title={t("generic.goBack")} type="error" className="p-2">
              <PiXCircleDuotone />
            </FormButton>
            <FormButton onClick={handleLogin} title={t("generic.add")} type="success" className="p-2">
              <PiFloppyDiskBackDuotone />
            </FormButton>
          </ButtonsWrapper>
        </FromWrapper>
      </PopupDialogPanel>
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
