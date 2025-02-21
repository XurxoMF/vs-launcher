import clsx from "clsx"
import { AnimatePresence, motion, useInView, Variants } from "motion/react"
import { useRef } from "react"

/**
 * Grid external wrapper.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function GridWrapper({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("mx-auto flex flex-col rounded-md p-2 bg-zinc-900/25", className)}>{children}</div>
}

const GRIDGROUP_VARIANTS: Variants = {
  animate: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.05
    }
  }
}

/**
 * Grid group. An ul html element with styles.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function GridGroup({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <AnimatePresence>
      <motion.ul variants={GRIDGROUP_VARIANTS} initial="initial" animate="animate" exit="exit" className={clsx("w-full flex items-center justify-center gap-4 flex-wrap", className)}>
        {children}
      </motion.ul>
    </AnimatePresence>
  )
}

const GRIDITEM_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

/**
 * Grid item. A li html element with styles.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {() => void} [props.onClick] - The function to be called when the item is clicked.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function GridItem({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }): JSX.Element {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: false
  })

  return (
    <motion.li
      ref={ref}
      variants={GRIDITEM_VARIANTS}
      animate={isInView ? "animate" : "initial"}
      onClick={onClick}
      className={clsx("flex-1 rounded-sm backdrop-blur-xs bg-zinc-950/50 border border-zinc-400/5 cursor-pointer shadow-sm shadow-zinc-950/50 hover:shadow-none duration-200", className)}
    >
      {children}
    </motion.li>
  )
}
