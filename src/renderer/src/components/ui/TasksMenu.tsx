import { AnimatePresence, motion } from "motion/react"
import { PiDownloadDuotone, PiBoxArrowDownDuotone, PiXCircleDuotone, PiBoxArrowUpDuotone } from "react-icons/pi"
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import clsx from "clsx"

import { useTaskContext } from "@renderer/contexts/TaskManagerContext"
import { useTranslation } from "react-i18next"
import { DROPDOWN_MENU_ITEM_VARIANTS, DROPDOWN_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"
import { NormalButton } from "./Buttons"

const NAME_BY_TYPE = {
  download: "components.tasksMenu.downloading",
  extract: "components.tasksMenu.extracting",
  compress: "components.tasksMenu.compressing"
}

const FONT_COLOR_TYPES = {
  pending: "text-vsl",
  "in-progress": "text-yellow-400",
  failed: "text-red-800",
  completed: "text-lime-600"
}

const ICON_TYPES = {
  download: <PiDownloadDuotone />,
  extract: <PiBoxArrowUpDuotone />,
  compress: <PiBoxArrowDownDuotone />
}

function TasksMenu(): JSX.Element {
  const { t } = useTranslation()
  const { tasks, removeTask } = useTaskContext()

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton className="w-8 h-8 px-2 py-1 flex items-center justify-between gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none cursor-pointer">
            <PiDownloadDuotone />
          </PopoverButton>

          <AnimatePresence>
            {open && (
              <PopoverPanel static anchor="bottom" className="w-80 z-600 mt-1 ml-2 select-none rounded-sm overflow-hidden">
                <motion.ul
                  variants={DROPDOWN_MENU_WRAPPER_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="max-h-60 flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm overflow-y-scroll text-sm"
                >
                  <AnimatePresence>
                    {tasks.length < 1 ? (
                      <motion.li variants={DROPDOWN_MENU_ITEM_VARIANTS} className="w-full text-sm font-bold text-center p-4">
                        {t("components.tasksMenu.noTasksAvailable")}
                      </motion.li>
                    ) : (
                      <>
                        {tasks.map((task) => (
                          <motion.li key={task.id} variants={DROPDOWN_MENU_ITEM_VARIANTS} className="w-full flex flex-col odd:bg-zinc-800/30 even:bg-zinc-950/30">
                            <div className="w-full flex justify-between gap-2 p-1">
                              <div className="w-full flex items-center gap-2">
                                <p className={clsx("text-xl p-2", FONT_COLOR_TYPES[task.status])}>{ICON_TYPES[task.type]}</p>
                                <div className="flex flex-col items-start justify-center">
                                  <p className="font-bold text-sm">{`${t(NAME_BY_TYPE[task.type])}`}</p>
                                  <p className="text-xs text-zinc-400 line-clamp-2">{task.desc}</p>
                                  {task.status === "failed" && <p className={clsx("text-xs", FONT_COLOR_TYPES["failed"])}>{t("components.tasksMenu.error")}</p>}
                                </div>
                              </div>
                              {(task.status === "completed" || task.status === "failed") && (
                                <NormalButton className="p-1 text-zinc-400" title={t("generic.discard")} onClick={() => removeTask(task.id)}>
                                  <PiXCircleDuotone />
                                </NormalButton>
                              )}
                            </div>
                            {task.status === "in-progress" && (
                              <div className="w-full h-1 bg-zinc-900 rounded-full">
                                <motion.div
                                  className={`h-full bg-vs rounded-full`}
                                  initial={{ width: `${task.progress}%` }}
                                  animate={{ width: `${task.progress}%` }}
                                  transition={{ ease: "easeInOut", duration: 0.2 }}
                                ></motion.div>
                              </div>
                            )}
                          </motion.li>
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </motion.ul>
              </PopoverPanel>
            )}
          </AnimatePresence>
        </>
      )}
    </Popover>
  )
}

export default TasksMenu
