import { useTranslation } from "react-i18next"
import { FiExternalLink } from "react-icons/fi"
import { PiArrowRightDuotone, PiCheckCircleDuotone } from "react-icons/pi"

import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"
import { FormButton } from "@renderer/components/ui/FormComponents"
import { NormalButton } from "@renderer/components/ui/Buttons"

function ModChangeSummaryPopup({
  isOpen,
  close,
  title,
  entries
}: {
  isOpen: boolean
  close: () => void
  title: string
  entries: ModChangeSummaryEntry[]
}): JSX.Element {
  const { t } = useTranslation()

  return (
    <PopupDialogPanel title={title} isOpen={isOpen} close={close} fixedWidth={false}>
      <>
        <TableWrapper className="w-[44rem]">
          <TableHead>
            <TableHeadRow>
              <TableCell className="w-5/12">{t("generic.name")}</TableCell>
              <TableCell className="w-5/12">{t("generic.version")}</TableCell>
              <TableCell className="w-2/12 text-center">{t("generic.actions")}</TableCell>
            </TableHeadRow>
          </TableHead>
          <TableBody className="max-h-[20rem]">
            {entries.map((entry) => (
              <TableBodyRow key={entry.modid}>
                <TableCell className="w-5/12 overflow-hidden whitespace-nowrap text-ellipsis">{entry.name}</TableCell>
                <TableCell className="w-5/12">
                  <span className="flex items-center gap-1 text-sm">
                    <span className="text-zinc-400">{entry.fromVersion ? `v${entry.fromVersion}` : t("features.mods.summaryNew")}</span>
                    <PiArrowRightDuotone className="text-zinc-500 shrink-0" />
                    <span className={entry.toVersion ? "text-green-400" : "text-red-400"}>{entry.toVersion ? `v${entry.toVersion}` : t("features.mods.summaryFailed")}</span>
                  </span>
                </TableCell>
                <TableCell className="w-2/12 flex justify-center">
                  {entry.assetid && (
                    <NormalButton
                      className="p-1"
                      title={t("features.mods.openOnTheModDB")}
                      onClick={() => window.api.utils.openOnBrowser(`https://mods.vintagestory.at/show/mod/${entry.assetid}`)}
                    >
                      <FiExternalLink />
                    </NormalButton>
                  )}
                </TableCell>
              </TableBodyRow>
            ))}
          </TableBody>
        </TableWrapper>

        <div className="flex justify-center">
          <FormButton title={t("features.mods.summaryClose")} className="p-1 px-4 h-8" onClick={close} type="normal">
            <PiCheckCircleDuotone className="text-xl" />
            <p>{t("features.mods.summaryClose")}</p>
          </FormButton>
        </div>
      </>
    </PopupDialogPanel>
  )
}

export default ModChangeSummaryPopup
