import clsx from "clsx"

/**
 * Table external wrapper.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - TableHead and TableRow.
 * @param {string} props.className - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function TableWrapper({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("rounded shadow shadow-zinc-950 overflow-hidden", className)}>{children}</div>
}

/**
 * Table head. Fixed to top.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - TableHeadRow.
 * @param {string} props.className - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function TableHead({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("sticky top-0 z-10 bg-zinc-950/50 flex flex-col pr-[10px]", className)}>{children}</div>
}

/**
 * Table head row.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - One or more TableCell. Same cells as the body.
 * @param {string} props.className - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function TableHeadRow({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("flex border-l-4 border-transparent", className)}>{children}</div>
}

/**
 * Table body.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - One or more TableBodyRow.
 * @param {string} props.className - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function TableBody({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("flex flex-col overflow-x-hidden overflow-y-scroll", className)}>{children}</div>
}

/**
 * Table body row.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - One or more TableCell. Same cells as the head.
 * @param {string} props.className - Additional class names for styling.
 * @param {boolean} props.selected - If the row is selected or not.
 * @param {boolean} props.disabled - If the row can be selected or not.
 * @param {() => void} props.onClick - Function to be called when the row is clicked.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function TableBodyRow({
  children,
  className,
  selected,
  disabled,
  onClick
}: {
  children: React.ReactNode
  className?: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}): JSX.Element {
  return (
    <div
      className={clsx(
        "flex group border-l-4 border-transparent duration-200",
        selected ? "bg-vs/15 border-vs" : "even:bg-zinc-950/50 odd:bg-zinc-900/50 hover:bg-vs/25",
        disabled ? "text-zinc-500" : "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/**
 * Table cell.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - Anything, but text is the ideal.
 * @param {string} props.className - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function TableCell({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("shrink-0 p-1 overflow-hidden", className)}>{children}</div>
}
