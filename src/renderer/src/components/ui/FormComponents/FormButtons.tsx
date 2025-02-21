import { Button as HButton } from "@headlessui/react"
import clsx from "clsx"
import { Link } from "react-router-dom"

/**
 * A ButtonsWrapper must contain a FormButton or a FormLinkButton.
 * Used to group more than one Buttons. Not needed if only using one Button.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} props.className - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function ButtonsWrapper({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("flex gap-4 justify-center items-center", className)}>{children}</div>
}

/**
 * Regular button.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} props.className - Additional class names for styling.
 * @param {() => void} props.onClick - The function to be called when the button is clicked.
 * @param {string} props.title - The title and content of the button.
 * @param {boolean} props.disabled - If the button is dissabled or not.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormButton({
  children,
  className,
  onClick,
  title,
  disabled
}: {
  children: React.ReactNode
  className?: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  title: string
  disabled?: boolean
}): JSX.Element {
  return (
    <HButton
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={clsx("backdrop-blur-sm border border-zinc-400/5 bg-zinc-950/50 shadow shadow-zinc-950/50 hover:shadow-none flex items-center justify-center rounded disabled:opacity-50", className)}
    >
      {children}
    </HButton>
  )
}

/**
 * Link to a page with the same styles as the FormButton.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} props.className - Additional class names for styling.
 * @param {string} props.to - Route to the page.
 * @param {string} props.title - The title and content of the button.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormLinkButton({ children, className, to, title }: { children: React.ReactNode; className?: string; to: string; title: string }): JSX.Element {
  return (
    <Link
      to={to}
      title={title}
      className={clsx("backdrop-blur-sm border border-zinc-400/5 bg-zinc-950/50 shadow shadow-zinc-950/50 hover:shadow-none flex items-center justify-center rounded", className)}
    >
      {children}
    </Link>
  )
}
