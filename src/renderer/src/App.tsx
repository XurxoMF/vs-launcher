import { useEffect, useState } from "react"
import { HashRouter as Router, Route, Routes } from "react-router-dom"
import { FiExternalLink, FiLoader } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { AnimatePresence, motion } from "motion/react"
import "./i18n"

import { ConfigProvider } from "@renderer/contexts/ConfigContext"
import { NotificationsProvider } from "@renderer/contexts/NotificationsContext"
import { TaskProvider } from "@renderer/contexts/TaskManagerContext"

import i18n from "./i18n"
import NotificationsOverlay from "@renderer/components/layout/NotificationsOverlay"

import MainMenu from "@renderer/components/layout/MainMenu"

import HomePage from "@renderer/features/home/pages/HomePage"

import InstallationsLayout from "@renderer/features/installations/pages/InstallationsLayout"
import ListInslallations from "@renderer/features/installations/pages/ListInstallations"
import AddInslallation from "@renderer/features/installations/pages/AddInstallation"
import EditInslallation from "@renderer/features/installations/pages/EditInstallation"

import VersionsLayout from "@renderer/features/versions/pages/VersionsLayout"
import ListVersions from "@renderer/features/versions/pages/ListVersions"
import AddVersion from "@renderer/features/versions/pages/AddVersion"
import LookForAVersion from "@renderer/features/versions/pages/LookForAVersion"

import ModsLayout from "@renderer/features/mods/pages/ModsLayout"
import ListMods from "@renderer/features/mods/pages/ListMods"

import ConfigPage from "@renderer/features/config/pages/ConfigPage"

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
            <div className="relative w-screen h-screen flex">
              <Loader />

              <MainMenu />

              <main className="relative w-full h-full flex-1">
                <AppInfo />

                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/installations" element={<InstallationsLayout />}>
                    <Route index element={<ListInslallations />} />
                    <Route path="add" element={<AddInslallation />} />
                    <Route path="edit/:id" element={<EditInslallation />} />
                  </Route>
                  <Route path="/versions" element={<VersionsLayout />}>
                    <Route index element={<ListVersions />} />
                    <Route path="add" element={<AddVersion />} />
                    <Route path="look-for-a-version" element={<LookForAVersion />} />
                  </Route>
                  <Route path="/mods" element={<ModsLayout />}>
                    <Route index element={<ListMods />} />
                  </Route>
                  <Route path="/config" element={<ConfigPage />} />
                </Routes>
              </main>

              <NotificationsOverlay />
            </div>
          </Router>
        </TaskProvider>
      </NotificationsProvider>
    </ConfigProvider>
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
    <div className="w-full absolute z-[100] p-1 px-4 select-none bg-gradient-to-b from-zinc-950/60 to-zinc-950/0 flex justify-between items-center text-xs text-zinc-500">
      <div className="flex flex-nowrap gap-1">
        <MiniLinks to="https://github.com/XurxoMF/vs-launcher/issues" text={t("generic.issues")} />
        <MiniLinks to="https://github.com/XurxoMF/vs-launcher/wiki" text={t("generic.guides")} />
        <MiniLinks to="https://github.com/XurxoMF/vs-launcher" text={t("generic.source")} />
        <MiniLinks to="https://ko-fi.com/xurxomf" text={t("generic.kofi")} />
        <MiniLinks to="https://patreon.com/XurxoMF" text={t("generic.patreon")} />
      </div>
      <p>VS Launcher - v{version}</p>
    </div>
  )
}

function MiniLinks({ to, text }: { to: string; text: string }): JSX.Element {
  return (
    <a title={text} onClick={() => window.api.utils.openOnBrowser(to)} className="flex flex-row flex-nowrap items-center gap-1 cursor-pointer [&:not(:last-child)]:after:content-['|']">
      {text} <FiExternalLink className="text-[.6rem]" />
    </a>
  )
}

function Loader(): JSX.Element {
  const { t } = useTranslation()

  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true)
    }, 3000)

    return (): void => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {!minTimeElapsed && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-zinc-800 z-[1000] select-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            exit={{ opacity: 0, y: -100 }}
            className="flex flex-col gap-4 items-center justify-center"
          >
            <h1 className="text-4xl">{t("components.loader.title")}</h1>
            <p className="text-xl">{t("components.loader.desc")}</p>
            <p className="pt-4">
              <FiLoader className="animate-spin text-5xl text-zinc-500 " />
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
