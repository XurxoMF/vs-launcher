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
  return <div className={clsx("bg-zinc-850 rounded shadow shadow-zinc-900 select-none", className)}>{children}</div>
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
  return <div className={clsx("sticky top-0 z-10 bg-zinc-850 flex flex-col", className)}>{children}</div>
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
  return <div className={clsx("flex flex-col", className)}>{children}</div>
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
    <div className={clsx("border-l-4 border-transparent", selected ? "bg-vs/15 border-vs" : "odd:bg-zinc-800", disabled ? "text-zinc-600" : "cursor-pointer", className)} onClick={onClick}>
      <div className={clsx("flex", !disabled && "duration-100 hover:translate-x-1")}>{children}</div>
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
