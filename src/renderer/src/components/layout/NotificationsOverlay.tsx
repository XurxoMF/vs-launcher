import { motion, AnimatePresence } from "motion/react"
import { PiInfoDuotone, PiWarningDuotone, PiCheckCircleDuotone, PiProhibitInsetDuotone, PiXCircleDuotone } from "react-icons/pi"
import { useTranslation } from "react-i18next"

import clsx from "clsx"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { NormalButton } from "../ui/Buttons"

const BORDER_COLOR_TYPES = {
  success: "border-lime-600",
  info: "border-vs",
  error: "border-red-800",
  warning: "border-yellow-400"
}

const FONT_COLOR_TYPES = {
  success: "text-lime-600",
  info: "text-vsl",
  error: "text-red-700",
  warning: "text-yellow-400"
}

const ICON_TYPES = {
  success: <PiCheckCircleDuotone />,
  info: <PiInfoDuotone />,
  error: <PiProhibitInsetDuotone />,
  warning: <PiWarningDuotone />
}

function NotificationsOverlay(): JSX.Element {
  const { t } = useTranslation()
  const { notifications, removeNotification } = useNotificationsContext()

  return (
    <div className="w-[20rem] h-fit absolute flex flex-col items-end top-2 right-2 z-800 gap-2">
      <AnimatePresence>
        {notifications.map(({ id, body, type, options }) => (
          <motion.div
            key={id}
            className={clsx(
              "w-full flex items-center justify-between gap-2 p-2 rounded-sm text-center bg-zinc-950/60 backdrop-blur-sm border-l-4",
              BORDER_COLOR_TYPES[type],
              options?.onClick && "cursor-pointer"
            )}
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            onClick={(e) => {
              e.stopPropagation()
              if (options?.onClick) options?.onClick()
              removeNotification(id)
            }}
          >
            <div className="flex items-center gap-2 text-start">
              <span className={clsx("text-4xl p-1 rounded-full", FONT_COLOR_TYPES[type])}>{ICON_TYPES[type]}</span>
              <div className="flex flex-col items-start justify-center">
                <p className="text-xs text-zinc-400">{body}</p>
              </div>
            </div>
            <NormalButton
              className="p-1 text-zinc-400"
              title={t("notifications.discard")}
              onClick={(e) => {
                e.stopPropagation()
                removeNotification(id)
              }}
            >
              <PiXCircleDuotone />
            </NormalButton>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default NotificationsOverlay
