import { createContext, useState, useEffect, useRef, useContext } from "react"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"

type NotificationTypes = "success" | "error" | "info" | "warning"

export interface NotificationType {
  id: string
  title: string
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

  const firstExecutedNotificationsContext = useRef(true)
  useEffect(() => {
    if (firstExecutedNotificationsContext.current) {
      firstExecutedNotificationsContext.current = false

      window.api.appUpdater.onUpdateAvailable(() => {
        addNotification(t("notifications.body.updateAvailable"), "info")
      })

      window.api.appUpdater.onUpdateDownloaded(() => {
        addNotification(t("notifications.body.updateDownloaded"), "success")
      })
    }
  }, [])

  const addNotification = (body: string, type: NotificationTypes, options?: { duration?: number; onClick?: () => void }): void => {
    const id = uuidv4()
    const duration = options?.duration || 6000
    const onClick = options?.onClick

    const title =
      (type === "error" && t("notifications.titles.error")) ||
      (type === "warning" && t("notifications.titles.warning")) ||
      (type === "info" && t("notifications.titles.info")) ||
      (type === "success" && t("notifications.titles.success")) ||
      t("notifications.titles.info")

    setNotifications((prev) => [...prev, { id, title, body, type, options: { duration, onClick } }])

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
