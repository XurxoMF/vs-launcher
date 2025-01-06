import { Button } from "@headlessui/react"
import clsx from "clsx"
import { Link } from "react-router-dom"

/**
 * A ButtonsWrapper must contain a FormButton or a FormLinkButton.
 * Used to group more than one Buttons. Not needed if only using one Button.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function ButtonsWrapper({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("flex gap-4 justify-center items-center", className)}>{children}</div>
}

/**
 * Button that fits the content width with h-8.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {() => void} props.onClick - The function to be called when the button is clicked.
 * @param {string} props.title - The title and content of the button.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormButton({ className, onClick, title }: { className?: string; onClick: () => void; title: string }): JSX.Element {
  return (
    <Button onClick={onClick} title={title} className={clsx("w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded", className)}>
      <p className="px-2 py-1">{title}</p>
    </Button>
  )
}

/**
 * Link to a page with the same styles as the FormButton.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {string} props.to - Route to the page.
 * @param {string} props.title - The title and content of the button.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormLinkButton({ className, to, title }: { className?: string; to: string; title: string }): JSX.Element {
  return (
    <Link to={to} title={title} className={clsx("w-fit h-8 bg-zinc-850 shadow shadow-zinc-900 hover:shadow-none flex items-center justify-center rounded", className)}>
      <p className="px-2 py-1">{title}</p>
    </Link>
  )
}
