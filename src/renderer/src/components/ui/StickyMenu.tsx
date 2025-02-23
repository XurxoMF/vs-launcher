import { MutableRefObject, ReactNode, useEffect, useState } from "react"
import clsx from "clsx"

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
          "relative rounded-sm border border-zinc-400/5 shadow-sm shadow-zinc-950/50 p-1 duration-200",
          "before:absolute before:left-0 before:top-0 before:w-full before:h-full before:backdrop-blur-xs",
          scrTop > 20 ? "bg-zinc-800" : "bg-zinc-950/25",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function StickyMenuGroup({ children, className }: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("relative flex items-center justify-center gap-2", className)}>{children}</div>
}
