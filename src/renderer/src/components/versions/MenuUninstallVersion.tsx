import { useState, useContext } from "react"
import { FaSpinner } from "react-icons/fa6"
import { useTranslation } from "react-i18next"
import { InstalledGameVersionsContext } from "@renderer/contexts/InstalledGameVersionsContext"
import { NotificationsContext } from "@renderer/contexts/NotificationsContext"
import { PreventClosingContext } from "@renderer/contexts/PreventClosingContext"
import Button from "@renderer/components/utils/Buttons"

function MenuUninstallVersion({
  setIsMenuOpen,
  selectedInstalledVersion,
  setSelectedInstalledVersion
}: {
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedInstalledVersion: InstalledGameVersionType | undefined
  setSelectedInstalledVersion: React.Dispatch<React.SetStateAction<InstalledGameVersionType | undefined>>
}): JSX.Element {
  const [isUninstalling, setIsUninstalling] = useState<boolean>(false)
  const { installedGameVersions, setInstalledGameVersions } = useContext(InstalledGameVersionsContext)
  const { addNotification } = useContext(NotificationsContext)
  const { setPreventClosing } = useContext(PreventClosingContext)
  const { t } = useTranslation()

  const handleUninstalling = async (): Promise<void> => {
    try {
      window.api.utils.logMessage("info", `[component] [MenuUninstallNewVersion] Starting game version instalaltion: ${selectedInstalledVersion?.version}`)
      setIsUninstalling(true)
      setPreventClosing(true)
      const result = await window.api.gameVersionsManager.uninstallGameVersion(selectedInstalledVersion as InstalledGameVersionType)

      if (result) {
        window.api.utils.logMessage(
          "info",
          `[component] [MenuUninstallNewVersion] Game version ${selectedInstalledVersion?.version} uninstalled successfully. Updating installed game versions and changing selected game version`
        )
        addNotification(t("notification.title.success"), t("notification-body-versionSuccesfullyUninstalled", { version: selectedInstalledVersion?.version }), "success")
        setInstalledGameVersions(installedGameVersions.filter((version) => version.version !== selectedInstalledVersion?.version))
      }

      window.api.utils.logMessage("info", `[component] [MenuUninstallNewVersion] Game version uninstallation finished: ${selectedInstalledVersion?.version}`)
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [MenuUninstallNewVersion] Error while uninstalling game version ${selectedInstalledVersion?.version}: ${err}`)
      addNotification(t("notification.title.error"), t("notification-body-versionErrorUninstalling", { version: selectedInstalledVersion?.version }), "error")
    } finally {
      setIsUninstalling(false)
      setPreventClosing(false)
      setIsMenuOpen(false)
      setSelectedInstalledVersion(undefined)
    }
  }

  return (
    <div className="w-[600px] flex flex-col items-center p-4 gap-6">
      <h2 className="text-2xl font-bold">{t("component-uninstallVersionMenu-titleAreyouSure")}</h2>
      <p className="text-center">
        {t("component-uninstallVersionMenu-areYouSure")} <span className="font-bold">{selectedInstalledVersion?.version}</span>
      </p>
      <p className="text-center">{t("component-uninstallVersionMenu-uninstallingNotReversible")}</p>
      <div className="flex gap-4 text-center">
        <Button btnType="custom" className="w-fit h-10 bg-zinc-900" disabled={isUninstalling} onClick={handleUninstalling}>
          {isUninstalling ? (
            <div>
              <FaSpinner className="animate-spin" />
            </div>
          ) : (
            t("component-uninstallVersionMenu-uninstall")
          )}
        </Button>
        <Button btnType="custom" className="w-fit h-10 bg-zinc-900" onClick={() => setIsMenuOpen(false)} disabled={isUninstalling}>
          {t("component-uninstallVersionMenu-cancel")}
        </Button>
      </div>
    </div>
  )
}

export default MenuUninstallVersion
