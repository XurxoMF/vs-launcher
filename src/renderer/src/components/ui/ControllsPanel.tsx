import { PiArrowLeftFill } from "react-icons/pi"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@headlessui/react"

function ControllsPanel({ goBackTo }: { goBackTo: string }): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="w-full flex justify-between px-8 text-zinc-400">
      <div className="flex gap-4 items-center">
        <Link to={goBackTo} title={t("generic.goBack")}>
          <PiArrowLeftFill />
        </Link>
        <Button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            window.location.reload()
          }}
        >
          {t("generic.reload")}
        </Button>
      </div>
    </div>
  )
}

export default ControllsPanel
