import React from "react"
import clsx from "clsx"

const ScrollableContainer = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(({ children, className }, ref) => {
  return (
    <div ref={ref} className={clsx("w-full h-full p-4 pt-8 overflow-y-scroll", className)}>
      {children}
    </div>
  )
})

ScrollableContainer.displayName = "ScrollableContainer"

export default ScrollableContainer
