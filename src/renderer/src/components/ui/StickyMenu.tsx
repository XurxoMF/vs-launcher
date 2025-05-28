import { MutableRefObject, ReactNode, useEffect, useState } from "react"
import clsx from "clsx"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { PiArrowClockwiseDuotone, PiArrowFatLineLeftDuotone, PiArrowFatLinesUpDuotone } from "react-icons/pi"

import { SlashSeparator } from "@renderer/components/ui/ListSeparators"
import { FormButton, FormLinkButton } from "@renderer/components/ui/FormComponents"
import { FiLoader } from "react-icons/fi"

/**
 * Sticky container. Must include a StickyMenuGroupWrapper.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {MutableRefObject<HTMLDivElement | null>} [props.scrollRef] - A ref with the scrollable container.
 * @param {string} [props.className] - The class lists to apply.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function StickyMenuWrapper({ children, scrollRef, className }: { children: ReactNode; scrollRef: MutableRefObject<HTMLDivElement | null>; className?: string }): JSX.Element {
  const [scrTop, setScrTop] = useState(0)

  const handleScroll = (): void => {
    if (!scrollRef.current) return
    const { scrollTop } = scrollRef.current
    setScrTop(scrollTop)
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", handleScroll)
    }

    return (): void => {
      if (scrollRef.current) scrollRef.current.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="sticky top-0 z-50 w-full flex items-center justify-center">
      <div
        className={clsx(
          "relative w-full flex flex-col gap-2 rounded-sm border border-zinc-400/5 shadow-sm shadow-zinc-950/50 p-1 duration-200",
          "before:absolute before:left-0 before:top-0 before:w-full before:h-full before:backdrop-blur-xs",
          scrTop > 20 ? "bg-zinc-800" : "bg-zinc-950/15",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Wrapper for the sticky menu groups. Must include a StickyMenuGroup.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {"between" | "centered"} [props.type] - The alignment type of the container.
 * @param {string} [props.className] - The class lists to apply.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function StickyMenuGroupWrapper({ children, type = "between", className }: { children: ReactNode; type?: "between" | "centered"; className?: string }): JSX.Element {
  return <div className={clsx("relative w-full flex flex-row flex-wrap items-center gap-2", type === "between" ? "justify-between" : "justify-center", className)}>{children}</div>
}

/**
 * Group for the sticky menu. Any elements can be added inside.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - The class lists to apply.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function StickyMenuGroup({ children, className }: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("flex flex-row flex-wrap items-center justify-center gap-2", className)}>{children}</div>
}

type StickyMenuBreadcrumbType = {
  name: string
  to: string
}

/**
 * Not too much to say, just that, breadcrumbs.
 *
 * @param {object} props - The component props.
 * @param {StickyMenuBreadcrumbType[]} props.breadcrumbs - The sections of the breadcrumbs.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function StickyMenuBreadcrumbs({ breadcrumbs }: { breadcrumbs: StickyMenuBreadcrumbType[] }): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="flex flex-row flex-wrap items-center justify-center text-sm">
      {breadcrumbs.map((breadcrumb, index) => (
        <span key={breadcrumb.name + breadcrumb.to} className="flex items-center">
          {index === 0 ? (
            <Link
              to="/"
              title={`${t("generic.goBackTo")} ${t("breadcrumbs.home")}`}
              className="px-1 rounded-sm duration-200 hover:backdrop-blur-xs hover:bg-zinc-950/50 border border-transparent hover:border-zinc-400/5"
            >
              <SlashSeparator />
            </Link>
          ) : (
            <span className="px-1">
              <SlashSeparator />
            </span>
          )}

          <Link
            to={breadcrumb.to}
            title={`${t("generic.goBackTo")} ${breadcrumb.name}`}
            className="px-1 rounded-sm duration-200 hover:backdrop-blur-xs hover:bg-zinc-950/50 border border-transparent hover:border-zinc-400/5"
          >
            {breadcrumb.name}
          </Link>
        </span>
      ))}
    </div>
  )
}

/**
 * A go back button to use on the sticky menu.
 *
 * @param {object} props - The component props.
 * @param {string} props.to - Route to redirect to.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function GoBackButton({ to }: { to: string }): JSX.Element {
  const { t } = useTranslation()

  return (
    <FormLinkButton title={t("generic.goBack")} to={to} className="w-8 h-8 text-lg">
      <PiArrowFatLineLeftDuotone />
    </FormLinkButton>
  )
}

/**
 * A button that scrolls up to top anutomatically.
 *
 * @param {object} props - The component props.
 * @param {() => void | Promise<void>} [props.onClick] - The function to execute when clicking the button.
 * @param {boolean} [props.reloading] - Whether the page is realoading or not.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function ReloadButton({ onClick, reloading = false }: { onClick: () => void | Promise<void>; reloading?: boolean }): JSX.Element {
  const { t } = useTranslation()

  return (
    <FormButton title={reloading ? t("generic.reloading") : t("generic.reload")} onClick={onClick} className="w-8 h-8 text-lg">
      {reloading ? <FiLoader className="animate-spin" /> : <PiArrowClockwiseDuotone />}
    </FormButton>
  )
}

/**
 * A button that scrolls up to top anutomatically.
 *
 * @param {object} props - The component props.
 * @param {MutableRefObject<HTMLDivElement | null>} [props.scrollRef] - A ref with the scrollable container.
 * @returns {JSX.Element} A JSX element wrapping the children with specified styles.
 */
export function GoToTopButton({ scrollRef }: { scrollRef: MutableRefObject<HTMLDivElement | null> }): JSX.Element {
  const { t } = useTranslation()

  return (
    <StickyMenuGroup>
      <FormButton
        title={t("generic.goToTop")}
        onClick={(e) => {
          e.stopPropagation()
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        }}
        className="w-8 h-8 text-xl"
      >
        <PiArrowFatLinesUpDuotone />
      </FormButton>
    </StickyMenuGroup>
  )
}
