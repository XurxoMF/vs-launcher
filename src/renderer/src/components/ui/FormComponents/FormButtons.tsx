import { Button as HButton } from "@headlessui/react"
import clsx from "clsx"
import { Link } from "react-router-dom"

const COLOR_BY_TYPE = {
  normal: "text-zinc-200",
  error: "text-red-700",
  warn: "text-yellow-400",
  success: "text-lime-600"
}

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
 * @param {string} props.type - "normal" || "error" || "warn" || "success"
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormButton({
  children,
  className,
  onClick,
  title,
  disabled,
  type
}: {
  children: React.ReactNode
  className?: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  title: string
  disabled?: boolean
  type?: "normal" | "error" | "warn" | "success"
}): JSX.Element {
  return (
    <HButton
      disabled={disabled}
      onClick={onClick}
      title={!disabled ? title : ""}
      className={clsx(
        "flex items-center justify-center gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 enabled:shadow-sm enabled:shadow-zinc-950/50 enabled:hover:shadow-none enabled:cursor-pointer disabled:opacity-50",
        type && COLOR_BY_TYPE[type],
        className
      )}
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
 * @param {string} props.type - "normal" || "error" || "warn" || "success"
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormLinkButton({
  children,
  className,
  to,
  title,
  type
}: {
  children: React.ReactNode
  className?: string
  to: string
  title: string
  type?: "normal" | "error" | "warn" | "success"
}): JSX.Element {
  return (
    <Link
      to={to}
      title={title}
      className={clsx(
        "flex items-center justify-center gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none cursor-pointer",
        type && COLOR_BY_TYPE[type],
        className
      )}
    >
      {children}
    </Link>
  )
}
