import clsx from "clsx"
import { AnimatePresence, motion, Variants } from "motion/react"

/**
 * List external wrapper.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function ListWrapper({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <div
      className={clsx(
        "relative mx-auto flex flex-col rounded-md p-2",
        "before:absolute before:left-0 before:top-0 before:w-full before:h-full before:rounded-md before:backdrop-blur-sm before:bg-zinc-950/25 before:shadow-sm before:shadow-zinc-950/50 before:border before:border-zinc-400/5",
        className
      )}
    >
      {children}
    </div>
  )
}

const LISTGROUP_VARIANTS: Variants = {
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
}

/**
 * List group. An ul html element with styles.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function ListGroup({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <motion.ul variants={LISTGROUP_VARIANTS} initial="initial" animate="animate" exit="exit" className={clsx("relative w-full flex flex-col gap-2", className)}>
      <AnimatePresence>{children}</AnimatePresence>
    </motion.ul>
  )
}

const LISTITEM_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

/**
 * List item. A li html element with styles.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {() => void} [props.onClick] - The function to be called when the item is clicked.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function ListItem({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }): JSX.Element {
  return (
    <motion.li
      variants={LISTITEM_VARIANTS}
      onClick={onClick}
      className={clsx(
        "w-full rounded-sm backdrop-blur-xs bg-zinc-950/50 border border-zinc-400/5 group overflow-hidden shadow-sm shadow-zinc-950/50 hover:shadow-none duration-200",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.li>
  )
}
