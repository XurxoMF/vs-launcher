import clsx from "clsx"

import DropdownSection from "@renderer/components/ui/DropdownSection"

/**
 * Form external wrapper.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FromWrapper({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("mx-auto flex flex-col gap-4 items-center justify-center", className)}>{children}</div>
}

/**
 * A FormGroup must contain a FormHead and a FormBody.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {"x" | "y"} [props.alignment] - Alignment of the children. Can be "x" or "y".
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FromGroup({ children, className, alignment = "x" }: { children: React.ReactNode; className?: string; alignment?: "x" | "y" }): JSX.Element {
  return <div className={clsx("w-full flex gap-2", alignment === "y" && "flex-col", className)}>{children}</div>
}

/**
 * A FormGroupWrapper must contain at least one FormGroup.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} props.title - The title of the FormGroupWrapper
 * @param {string} [props.className] - Additional class names for styling.
 * @param {boolean} [props.bgDark] - Add or not the darker background.
 * @param {boolean} [props.startOpen] - True to show it open by default and false to show it closed by default.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormGroupWrapper({
  children,
  title,
  className,
  bgDark = true,
  startOpen = true
}: {
  children: React.ReactNode
  title?: string
  className?: string
  bgDark?: boolean
  startOpen?: boolean
}): JSX.Element {
  return (
    <DropdownSection title={title} className={className} bgDark={bgDark} startOpen={startOpen}>
      {children}
    </DropdownSection>
  )
}

/**
 * Must be used within a FormGrup before a FormBody. Must contain a FormLabel.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormHead({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("relative w-1/5 flex flex-col gap-2 shrink-0", className)}>{children}</div>
}

/**
 * Must be used within a FormGrup after a FormHead. can contain anything.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormBody({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("relative w-4/5 flex flex-col gap-2", className)}>{children}</div>
}

/**
 * Title for this FormGroup.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {string} props.content - The content of the label.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormLabel({ className, content }: { className?: string; content: string }): JSX.Element {
  return (
    <div className={clsx("w-full h-8 flex gap-1 items-center flex-wrap justify-end text-right", className)}>
      <p className="whitespace-nowrap overflow-hidden text-ellipsis" title={content}>
        {content}
      </p>
    </div>
  )
}

/**
 * A FormFieldGroup will align vertically or horizontally the childrens.
 * You can use it all the times you want.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {"x" | "y"} [props.alignment] - Alignment of the children. Can be "x" or "y".
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormFieldGroup({ children, className, alignment = "y" }: { children: React.ReactNode; className?: string; alignment?: "x" | "y" }): JSX.Element {
  return <div className={clsx("flex gap-2", alignment === "y" && "flex-col", className)}>{children}</div>
}

/**
 * Used to wrap a anything with a FormDescription.
 * This will align them vertically with a little gap.
 *
 * You can use it with a FormFieldGroup and a FormFieldDescription.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {"x" | "y"} [props.alignment] - Alignment of the children. Can be "x" or "y".
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormFieldGroupWithDescription({ children, className, alignment = "y" }: { children: React.ReactNode; className?: string; alignment?: "x" | "y" }): JSX.Element {
  return <div className={clsx("flex gap-1", alignment === "y" ? "flex-col" : "items-center", className)}>{children}</div>
}

/**
 * Form description. Small font and gray color.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {JSX.Element | string} props.content - The content of the button. Use ONLY with text, t() or <Trans />
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function FormFieldDescription({ className, content }: { className?: string; content: JSX.Element | string }): JSX.Element {
  return <p className={clsx("flex gap-1 items-center flex-wrap justify-start text-xs text-zinc-400 pl-1", className)}>{content}</p>
}
