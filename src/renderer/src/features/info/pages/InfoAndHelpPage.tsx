import { Trans, useTranslation } from "react-i18next"
import { PiGithubLogoFill, PiDiscordLogoDuotone, PiCoinsDuotone, PiInfoDuotone, PiCodeDuotone } from "react-icons/pi"

import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import { FormButton } from "@renderer/components/ui/FormComponents"
import { NormalButton } from "@renderer/components/ui/Buttons"
import DropdownSection from "@renderer/components/ui/DropdownSection"

function InfoAndHelpPage(): JSX.Element {
  const { t } = useTranslation()

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center items-center gap-4">
        <div className="w-[50rem] flex flex-col justify-center gap-6">
          <h1 className="text-center text-4xl font-bold">{t("features.infoAndHelp.title")}</h1>

          <div className="w-full shrink-0 flex flex-nowrap items-center justify-center gap-2">
            <SocialButtons icon={<PiCodeDuotone />} to="https://github.com/XurxoMF/vs-launcher" text={t("generic.source")} />
            <SocialButtons icon={<PiGithubLogoFill />} to="https://github.com/XurxoMF/vs-launcher/issues" text={t("generic.issues")} />
            <SocialButtons icon={<PiInfoDuotone />} to="https://vsldocs.xurxomf.xyz/" text={t("generic.guides")} />
            <SocialButtons icon={<PiDiscordLogoDuotone />} to="https://discord.gg/RtWpYBRRUz" text={t("generic.discord")} />
            <SocialButtons icon={<PiCoinsDuotone />} to="https://ko-fi.com/xurxomf" text={t("generic.donate")} />
          </div>

          <DropdownSection title={t("generic.contributors")}>
            <DropdownSection title={t("features.infoAndHelp.codeContributorsTitle")}>
              <Contributors
                users={[
                  { name: "XurxoMF", link: "https://github.com/XurxoMF", desc: t("features.infoAndHelp.contribOwnerAndMainDevDesc") },
                  { name: "scgm0", link: "https://github.com/scgm0", desc: t("features.infoAndHelp.contribReverseEngeneerLogingDesc") },
                  { name: "Tipsy The Cat", link: "https://github.com/TipsyTheCat", desc: t("features.infoAndHelp.contribBackupsCompressionDesc") }
                ]}
              />
            </DropdownSection>

            <DropdownSection title={t("features.infoAndHelp.translatorsTitle")}>
              <DropdownSection title={t("features.localization.es-ES")}>
                <Contributors users={[{ name: "XurxoMF", link: "https://github.com/XurxoMF" }]} />
              </DropdownSection>
            </DropdownSection>
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

function Contributors({ users }: { users: { name: string; link: string; desc?: string }[] }): JSX.Element {
  return (
    <div>
      {users.map((user) => (
        <p key={user.name + user.desc} className="flex gap-1 items-center flex-wrap">
          <a href={user.link} className="text-vsl">
            {user.name}
          </a>
          {user.desc && (
            <>
              <span>-</span>
              {user.desc}
            </>
          )}
        </p>
      ))}
    </div>
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
