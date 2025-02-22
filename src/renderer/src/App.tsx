import { useEffect, useState } from "react"
import { HashRouter as Router, Route, Routes, useLocation } from "react-router-dom"
import { FiExternalLink, FiLoader } from "react-icons/fi"
import { Trans, useTranslation } from "react-i18next"
import { AnimatePresence, motion } from "motion/react"
import "./i18n"
import clsx from "clsx"

import { ConfigProvider } from "@renderer/features/config/contexts/ConfigContext"
import { NotificationsProvider } from "@renderer/contexts/NotificationsContext"
import { TaskProvider } from "@renderer/contexts/TaskManagerContext"

import i18n from "./i18n"
import NotificationsOverlay from "@renderer/components/layout/NotificationsOverlay"

import MainMenu from "@renderer/components/layout/MainMenu"
import { FormButton } from "./components/ui/FormComponents"

import HomePage from "@renderer/features/home/pages/HomePage"

import ListInslallations from "@renderer/features/installations/pages/ListInstallations"
import AddInslallation from "@renderer/features/installations/pages/AddInstallation"
import EditInslallation from "@renderer/features/installations/pages/EditInstallation"
import RestoreInstallationBackup from "@renderer/features/installations/pages/RestoreInstallationBackup"
import ManageInstallationMods from "@renderer/features/installations/pages/ManageMods"

import ListVersions from "@renderer/features/versions/pages/ListVersions"
import AddVersion from "@renderer/features/versions/pages/AddVersion"
import LookForAVersion from "@renderer/features/versions/pages/LookForAVersion"

import ListMods from "@renderer/features/mods/pages/ListMods"

import ConfigPage from "@renderer/features/config/pages/ConfigPage"
import { NormalButton } from "./components/ui/Buttons"

function App(): JSX.Element {
  useEffect(() => {
    const lang = window.localStorage.getItem("lang")
    if (lang) i18n.changeLanguage(lang)
  }, [])

  return (
    <ConfigProvider>
      <NotificationsProvider>
        <TaskProvider>
          <Router>
            <div
              className={clsx(
                "relative w-screen h-screen select-none bg-image-vs bg-center bg-cover",
                "before:absolute before:left-0 before:top-0 before:w-full before:h-full before:backdrop-blur-[2px]"
              )}
            >
              <div className="w-full h-full flex bg-zinc-900/30">
                <Loader />

                <MainMenu />

                <main className="relative w-full h-full flex-1">
                  <AppInfo />

                  <AnimatedRoutes />
                </main>

                <NotificationsOverlay />
              </div>
            </div>
          </Router>
        </TaskProvider>
      </NotificationsProvider>
    </ConfigProvider>
  )
}

function AnimatedRoutes(): JSX.Element {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedRoute element={<HomePage />} />} />
        <Route path="/installations" element={<AnimatedRoute element={<ListInslallations />} />} />
        <Route path="/installations/add" element={<AnimatedRoute element={<AddInslallation />} />} />
        <Route path="/installations/edit/:id" element={<AnimatedRoute element={<EditInslallation />} />} />
        <Route path="/installations/backups/:id" element={<AnimatedRoute element={<RestoreInstallationBackup />} />} />
        <Route path="/installations/mods/:id" element={<AnimatedRoute element={<ManageInstallationMods />} />} />
        <Route path="/versions" element={<AnimatedRoute element={<ListVersions />} />} />
        <Route path="/versions/add" element={<AnimatedRoute element={<AddVersion />} />} />
        <Route path="/versions/look-for-a-version" element={<AnimatedRoute element={<LookForAVersion />} />} />
        <Route path="/mods" element={<AnimatedRoute element={<ListMods />} />} />
        <Route path="/config" element={<AnimatedRoute element={<ConfigPage />} />} />
      </Routes>
    </AnimatePresence>
  )
}

function AnimatedRoute({ element }: { element: React.ReactElement }): JSX.Element {
  return (
    <motion.div transition={{ duration: 0.1 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full h-full">
      {element}
    </motion.div>
  )
}

function AppInfo(): JSX.Element {
  const { t } = useTranslation()

  const [version, setVersion] = useState("")

  useEffect(() => {
    ;(async (): Promise<void> => {
      const res = await window.api.utils.getAppVersion()
      setVersion(res)
    })()
  }, [])

  return (
    <div className="w-full absolute z-100 top-0 left-0 py-1 p-3 flex justify-between items-center text-xs">
      <div className="shrink-0 flex flex-nowrap gap-1">
        <MiniLinks to="https://github.com/XurxoMF/vs-launcher/issues" text={t("generic.issues")} />
        <MiniLinks to="https://vsldocs.xurxomf.xyz/" text={t("generic.guides")} />
        <MiniLinks to="https://discord.gg/RtWpYBRRUz" text="Discord" />
        <MiniLinks to="https://ko-fi.com/xurxomf" text={t("generic.donate")} />
      </div>

      <span className="flex gap-1 items-center flex-wrap justify-center animate-pulse">
        <Trans
          i18nKey="generic.tryMVL"
          components={{
            link: (
              <NormalButton title="MVL" onClick={() => window.api.utils.openOnBrowser("https://mods.vintagestory.at/mvl")} className="text-vsl">
                MVL
              </NormalButton>
            )
          }}
        />
      </span>

      <div className="shrink-0 flex flex-nowrap gap-1">
        <MiniLinks text={`VS Launcher v${version}`} to="https://github.com/XurxoMF/vs-launcher" />
      </div>
    </div>
  )
}

function MiniLinks({ to, text }: { to: string; text: string }): JSX.Element {
  return (
    <FormButton title={text} onClick={() => window.api.utils.openOnBrowser(to)} className={"px-1 gap-1 opacity-50 hover:opacity-100 duration-200"}>
      <span>{text}</span> <FiExternalLink className="text-[.6rem]" />
    </FormButton>
  )
}

function Loader(): JSX.Element {
  const { t } = useTranslation()

  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true)
    }, 2000)

    return (): void => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {!minTimeElapsed && (
        <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-zinc-800 z-1000">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            exit={{ opacity: 0, y: -100 }}
            className="flex flex-col gap-4 items-center justify-center"
          >
            <h1 className="text-4xl">{t("components.loader.title")}</h1>
            <p className="text-xl">{t("components.loader.desc")}</p>
            <p className="pt-4">
              <FiLoader className="animate-spin text-5xl text-zinc-400 " />
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
