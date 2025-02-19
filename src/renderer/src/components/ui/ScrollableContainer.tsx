import clsx from "clsx"

function ScrollableContainer({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={clsx("w-full h-full p-4 pt-8 overflow-y-scroll", className)}>{children}</div>
}

export default ScrollableContainer
