import { GRIDGROUP_VARIANTS, GRIDITEM_VARIANTS } from "@renderer/utils/animateVariants"
import clsx from "clsx"
import { AnimatePresence, motion, useInView } from "motion/react"
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
  return (
    <div
      className={clsx(
        "relative mx-auto flex flex-col rounded-md p-2",
        "before:absolute before:left-0 before:top-0 before:w-full before:h-full before:rounded-md before:backdrop-blur-sm before:bg-zinc-950/15 before:shadow-sm before:shadow-zinc-950/50 before:border before:border-zinc-400/5",
        className
      )}
    >
      {children}
    </div>
  )
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
    <motion.ul variants={GRIDGROUP_VARIANTS} initial="initial" animate="animate" exit="exit" className={clsx("relative w-full flex flex-row flex-wrap justify-center gap-4", className)}>
      <AnimatePresence>{children}</AnimatePresence>
    </motion.ul>
  )
}

/**
 * Grid item. A li html element with styles. Set the basis-x and max-w-x with the size prop.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {boolean} props.selected - If the item is selected.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {string} [props.size] - Like the className prop but for the size properties.
 * @param {() => void} [props.onClick] - The function to be called when the item is clicked.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function GridItem({
  children,
  className,
  selected = false,
  size,
  onClick
}: {
  children: React.ReactNode
  className?: string
  selected?: boolean
  size?: string
  onClick?: () => void
}): JSX.Element {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: false
  })

  return (
    <motion.li ref={ref} variants={GRIDITEM_VARIANTS} onClick={onClick} className={clsx("grow shrink-0", size)}>
      <motion.div
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        exit="exit"
        className={clsx(
          "w-full h-full rounded-sm backdrop-blur-xs border cursor-pointer shadow-sm shadow-zinc-950/50 hover:shadow-none duration-200",
          selected ? "bg-vsd/50 border-vsl/25" : "bg-zinc-950/50 border-zinc-400/5",
          onClick && "cursor-pointer",
          className
        )}
      >
        {children}
      </motion.div>
    </motion.li>
  )
}
