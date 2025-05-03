import { ReactNode, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { useConfigContext } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import { useGetCompleteInstalledMods } from "@renderer/features/mods/hooks/useGetCompleteInstalledMods"

/**
 * This is a little workaround to execute hooks that need to acces configs, notifications... but need to be execute globally and not
 * when opening a page or something.
 *
 * Maybe there are better options but this one is clean, easy to unserstand and read... is perfect!
 *
 * @param {Object} props
 * @param {ReactNode} [props.children] All the content to be rendered.
 * @returns {JSX.Element} Wrapper with NOTHING. Literally nothing. Just children. return <>{children}</>
 */
function GlobalActionsWrapper({ children }: { children: ReactNode }): JSX.Element {
  const { t } = useTranslation()
  const { config } = useConfigContext()
  const { addNotification } = useNotificationsContext()
  const goTo = useNavigate()

  const getCompleteInstalledMods = useGetCompleteInstalledMods()

  useEffect((): void => {
    window.api.utils.onPreventedAppClose(() => addNotification(t("notifications.body.appClosePrevented"), "warning"))
  }, [])

  useEffect((): void => {
    // If the user selects a new Installation check if there are mod updates.
    checkModUpdates()
  }, [config.lastUsedInstallation])

  /**
   * Checkf if there are updates on the selected Installation and notify the user if there are some.
   *
   * @returns {Promise<void>}
   */
  async function checkModUpdates(): Promise<void> {
    if (!config.lastUsedInstallation) return
    const lastUsedInstallation = config.installations.find((i) => i.id === config.lastUsedInstallation)
    if (!lastUsedInstallation) return
    ;(async (): Promise<void> => {
      getCompleteInstalledMods({
        path: lastUsedInstallation.path,
        version: lastUsedInstallation.version,
        onFinish: (updates) => {
          if (config._notifiedModUpdatesInstallations === undefined || config._notifiedModUpdatesInstallations.length === 0) config._notifiedModUpdatesInstallations = []
          if (updates > 0 && !config._notifiedModUpdatesInstallations.some((numi) => numi === lastUsedInstallation.id)) {
            config._notifiedModUpdatesInstallations.push(lastUsedInstallation.id)
            setTimeout(() => {
              addNotification(t("features.mods.updatesAvailableInstallation", { count: updates }), "info", { onClick: () => goTo(`/installations/mods/${lastUsedInstallation.id}`) })
            }, 2_000)
          }
        }
      })
    })()
  }

  return <>{children}</>
}

export default GlobalActionsWrapper
