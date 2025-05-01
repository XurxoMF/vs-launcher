import { Button } from "@headlessui/react"
import clsx from "clsx"
import { AnimatePresence, motion } from "motion/react"
import { useRef, useState } from "react"
import { PiCaretDownDuotone } from "react-icons/pi"

/**
 * Dropdown with a blury background and a title.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} props.title - The title of the FormGroupWrapper
 * @param {string} [props.className] - Additional class names for styling.
 * @param {boolean} [props.bgDark] - Add or not the darker background.
 * @param {boolean} [props.startOpen] - True to show it open by default and false to show it closed by default.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
function DropdownSection({
  children,
  title,
  className,
  bgDark = true,
  startOpen = true
}: {
  children: React.ReactNode
  title?: string
  className?: string
  bgDark?: boolean
  startOpen?: boolean
}): JSX.Element {
  const [open, setOpen] = useState(startOpen)

  const hasMounted = useRef(!startOpen)

  return (
    <div className="flex flex-col gap-1 w-full items-center justify-center">
      <div
        className={clsx(
          "relative w-full",
          bgDark &&
            "before:absolute before:left-0 before:top-0 before:w-full before:h-full before:rounded-md before:backdrop-blur-sm before:bg-zinc-950/15 before:shadow-sm before:shadow-zinc-950/50 before:border before:border-zinc-400/5"
        )}
      >
        {title && (
          <Button
            className="relative w-full flex items-center justify-between gap-2 px-2 py-1 z-1 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none border border-zinc-400/5 rounded-sm cursor-pointer"
            onClick={() => setOpen((prev) => !prev)}
          >
            <h2 className="shrink-0 font-lg">{title}</h2>
            <PiCaretDownDuotone className={clsx("text-zinc-300 shrink-0 duration-200", open && "-rotate-180")} />
          </Button>
        )}
        <AnimatePresence>
          {open && (
            <motion.div
              className={clsx("relative z-1 overflow-hidden", className)}
              initial={hasMounted.current ? { opacity: 0, height: 0 } : false}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              onAnimationComplete={() => {
                // To prevent the animation from running when the component is mounted for the first time
                // we set this var to false. After the first "non animation" we set it to true so it
                // animates nromally.
                hasMounted.current = true
              }}
            >
              <div className={clsx("flex flex-col gap-2 p-2", className)}>{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DropdownSection
