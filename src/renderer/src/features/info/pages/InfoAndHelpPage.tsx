import { useEffect, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { PiDiscordLogoDuotone, PiCoinsDuotone, PiInfoDuotone, PiCodeDuotone, PiUsersThreeDuotone, PiGithubLogoDuotone } from "react-icons/pi"

import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import { FormButton } from "@renderer/components/ui/FormComponents"
import { NormalButton } from "@renderer/components/ui/Buttons"
import DropdownSection from "@renderer/components/ui/DropdownSection"

function InfoAndHelpPage(): JSX.Element {
  const { t } = useTranslation()

  const [vslVersion, setVslVersion] = useState("")
  const [os, setOs] = useState("")
  const [logsFolder, setLogsFolder] = useState("")

  useEffect(() => {
    ;(async (): Promise<void> => {
      setVslVersion(await window.api.utils.getAppVersion())
      setOs(await window.api.utils.getOs())
      setLogsFolder(await window.api.pathsManager.formatPath([await window.api.pathsManager.getCurrentUserDataPath(), "VSLauncher", "Logs"]))
    })()
  }, [])

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center items-center gap-4">
        <div className="w-[50rem] flex flex-col justify-center gap-6">
          <h1 className="text-center text-4xl font-bold">{t("features.infoAndHelp.title")}</h1>

          <div className="w-full shrink-0 flex flex-wrap items-center justify-center gap-2">
            <SocialButtons icon={<PiGithubLogoDuotone />} to="https://github.com/XurxoMF/vs-launcher/issues" text={t("generic.issues")} />
            <SocialButtons icon={<PiInfoDuotone />} to="https://vsldocs.xurxomf.xyz/" text={t("generic.guides")} />
            <SocialButtons icon={<PiDiscordLogoDuotone />} to="https://discord.gg/RtWpYBRRUz" text={t("generic.discord")} />
            <SocialButtons icon={<PiCoinsDuotone />} to="https://ko-fi.com/xurxomf" text={t("generic.donate")} />
            <SocialButtons icon={<PiUsersThreeDuotone />} to="https://vsldocs.xurxomf.xyz/important-info/contributors" text={t("generic.contributors")} />
            <SocialButtons icon={<PiCodeDuotone />} to="https://github.com/XurxoMF/vs-launcher" text={t("generic.source")} />
          </div>

          <DropdownSection title={t("features.infoAndHelp.debugInfoTitle")} startOpen={false}>
            <p>{t("featurs.infoAndHelp.debugInfoDesc")}</p>

            <div className="select-all p-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 enabled:shadow-sm enabled:shadow-zinc-950/50 enabled:hover:shadow-none enabled:cursor-pointer disabled:opacity-50">
              <p>VS Launcher Version - v{vslVersion}</p>
              <p>OS Type - {os}</p>
            </div>

            <p className="flex gap-1 items-center flex-wrap">
              <Trans
                i18nKey="features.infoAndHelp.includeLogs"
                components={{
                  folderlink: (
                    <NormalButton title={t("features.infoAndHelp.logsFolderTitle")} onClick={() => window.api.pathsManager.openPathOnFileExplorer(logsFolder)} className="text-vsl">
                      {t("features.infoAndHelp.thisFolder")}
                    </NormalButton>
                  )
                }}
              />
            </p>
          </DropdownSection>

          <span className="flex gap-1 items-center flex-wrap justify-center animate-pulse">
            <Trans
              i18nKey="generic.tryMVL"
              components={{
                link: (
                  <NormalButton title="MVL" onClick={() => window.api.utils.openOnBrowser("https://mods.vintagestory.at/mvl")} className="text-vsl">
                    MVL
                  </NormalButton>
                )
              }}
            />
          </span>
        </div>
      </div>
    </ScrollableContainer>
  )
}

function SocialButtons({ icon, to, text }: { icon: JSX.Element; to: string; text: string }): JSX.Element {
  return (
    <FormButton
      title={text}
      onClick={() => window.api.utils.openOnBrowser(to)}
      className={
        "text-lg backdrop-blur-xs border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none flex items-center justify-center gap-1 rounded-sm cursor-pointer px-1 duration-200"
      }
    >
      {icon}
      <span>{text}</span>
    </FormButton>
  )
}

export default InfoAndHelpPage
