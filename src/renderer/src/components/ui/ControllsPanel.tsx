import { PiArrowLeftFill } from "react-icons/pi"
import { useTranslation } from "react-i18next"
import { LinkButton, NormalButton } from "./Buttons"

function ControllsPanel({ goBackTo }: { goBackTo: string }): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="w-full flex justify-between px-8 text-zinc-400">
      <div className="flex gap-4 items-center">
        <LinkButton to={goBackTo} title={t("generic.goBack")}>
          <PiArrowLeftFill />
        </LinkButton>
        <NormalButton
          title={t("generic.reload")}
          onClick={(e) => {
            e.stopPropagation()
            window.location.reload()
          }}
        >
          {t("generic.reload")}
        </NormalButton>
      </div>
    </div>
  )
}

export default ControllsPanel
