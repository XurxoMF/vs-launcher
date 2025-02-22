import { Button as HButton } from "@headlessui/react"
import clsx from "clsx"
import { Link } from "react-router-dom"

/**
 * Button with no background.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} props.className - Additional class names for styling.
 * @param {() => void} props.onClick - The function to be called when the button is clicked.
 * @param {string} props.title - The title and content of the button.
 * @param {boolean} props.disabled - If the button is dissabled or not.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function NormalButton({
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
    <HButton disabled={disabled} onClick={onClick} title={title} className={clsx("flex items-center justify-center rounded-sm disabled:opacity-50 cursor-pointer", className)}>
      {children}
    </HButton>
  )
}

/**
 * Link to a page with the same styles as the Button.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} props.className - Additional class names for styling.
 * @param {string} props.to - Route to the page.
 * @param {string} props.title - The title and content of the button.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function LinkButton({ children, className, to, title }: { children: React.ReactNode; className?: string; to: string; title: string }): JSX.Element {
  return (
    <Link to={to} title={title} className={clsx("flex items-center justify-center rounded-sm cursor-pointer", className)}>
      {children}
    </Link>
  )
}
