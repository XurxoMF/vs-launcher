import { createContext, useState, useEffect, useContext } from "react"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"

type NotificationTypes = "success" | "error" | "info" | "warning"

export interface NotificationType {
  id: string
  body: string
  type: NotificationTypes
  options?: {
    duration?: number
    onClick?: () => void
  }
}

interface NotificationsContextType {
  notifications: NotificationType[]
  addNotification: (body: string, type: NotificationTypes, options?: { duration?: number; onClick?: () => void }) => void
  removeNotification: (id: string) => void
}

const defaultValue: NotificationsContextType = { notifications: [], addNotification: () => {}, removeNotification: () => {} }

const NotificationsContext = createContext<NotificationsContextType>(defaultValue)

const NotificationsProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<NotificationType[]>([])

  useEffect(() => {
    window.api.appUpdater.onUpdateAvailable(() => {
      setTimeout(() => {
        addNotification(t("notifications.body.updateAvailable"), "info")
      }, 2_000)
    })

    window.api.appUpdater.onUpdateDownloaded(() => {
      setTimeout(() => {
        addNotification(t("notifications.body.updateDownloaded"), "success", { onClick: () => window.api.appUpdater.updateAndRestart(), duration: 60_000 })
      }, 2_000)
    })
  }, [])

  const addNotification = (body: string, type: NotificationTypes, options?: { duration?: number; onClick?: () => void }): void => {
    const id = uuidv4()
    const duration = options?.duration || 6000
    const onClick = options?.onClick

    setNotifications((prev) => [...prev, { id, body, type, options: { duration, onClick } }])

    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }

  const removeNotification = (id: string): void => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  return <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification }}>{children}</NotificationsContext.Provider>
}

const useNotificationsContext = (): NotificationsContextType => {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error("useNotificationsContext must be used within an NotificationsProvider")
  }
  return context
}

export { NotificationsProvider, useNotificationsContext }
