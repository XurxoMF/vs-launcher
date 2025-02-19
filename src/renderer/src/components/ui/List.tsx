import clsx from "clsx"

/**
 * List external wrapper.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function ListWrapper({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("mx-auto flex flex-col", className)}>{children}</div>
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
  return <ul className={clsx("w-full flex flex-col gap-2", className)}>{children}</ul>
}

/**
 * List item. An li html element with styles.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {() => void} [props.onClick] - The function to be called when the item is clicked.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function Listitem({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }): JSX.Element {
  return (
    <ul onClick={onClick} className={clsx("w-full rounded bg-zinc-950/50 hover:bg-vs/25 duration-200 cursor-pointer group overflow-hidden group shadow shadow-zinc-950 hover:shadow-none", className)}>
      {children}
    </ul>
  )
}
