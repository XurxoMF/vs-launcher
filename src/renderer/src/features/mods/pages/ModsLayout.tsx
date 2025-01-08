import { Outlet } from "react-router-dom"

function ModsLayout(): JSX.Element {
  return (
    <div className="w-full h-full pt-6 overflow-y-scroll">
      <div className="w-full min-h-full flex flex-col justify-center gap-6 p-4">
        <Outlet />
      </div>
    </div>
  )
}

export default ModsLayout
