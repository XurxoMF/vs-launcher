import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import clsx from "clsx"
import { AnimatePresence, motion } from "motion/react"

function PopupDialogPanel({
  children,
  title,
  isOpen,
  close,
  maxWidth = true
}: {
  children: React.ReactElement
  title: JSX.Element | string
  isOpen: boolean
  close: (value: boolean) => void
  maxWidth?: boolean
}): JSX.Element {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={close}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full absolute top-0 left-0 z-[200] flex justify-center items-center backdrop-blur-md select-none"
          >
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} transition={{ duration: 0.2 }}>
              <DialogPanel className={clsx("flex flex-col gap-4 text-center p-6 rounded-md border border-zinc-400/5 bg-zinc-950/30 shadow shadow-zinc-950/25", maxWidth && "max-w-[600px]")}>
                <>
                  <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
                  {children}
                </>
              </DialogPanel>
            </motion.div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default PopupDialogPanel
