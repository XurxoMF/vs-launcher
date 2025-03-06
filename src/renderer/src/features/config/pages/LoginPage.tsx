import { useTranslation } from "react-i18next"
import { useState } from "react"
import { PiFloppyDiskBackDuotone, PiXCircleDuotone } from "react-icons/pi"

import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"
import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

import {
  FormBody,
  FormHead,
  FormLabel,
  FromGroup,
  FromWrapper,
  FormGroupWrapper,
  FormFieldGroupWithDescription,
  FormInputText,
  FormFieldDescription,
  ButtonsWrapper,
  FormLinkButton,
  FormButton,
  FormInputPassword
} from "@renderer/components/ui/FormComponents"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"

function LoginPage(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()

  const { configDispatch } = useConfigContext()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twofacode, setTwofacode] = useState("")

  async function handleLogin(): Promise<void> {
    addNotification(`Logging in`, "info")

    // Thanks a lot to https://github.com/scgm0 for teaching me how to loging using the Vintage Story Game Account
    // If you're reading this, make sure to check out MVL https://github.com/scgm0/MVL

    const preLogin = await window.api.netManager.postUrl("https://auth3.vintagestory.at/v2/gamelogin", { email, password })

    if (preLogin["valid"] == 0) {
      const reason = preLogin["reason"]

      if (reason == "requiretotpcode") {
        const fullLogin = await window.api.netManager.postUrl("https://auth3.vintagestory.at/v2/gamelogin", { email, password, preLoginToken: preLogin["prelogintoken"], twofacode })

        if (fullLogin["valid"] == 0 && fullLogin["reason"] == "wrongtotpcode") return addNotification("Wrong 2FA Code", "error")

        saveLogin(fullLogin)
      } else if (reason == "invalidemailorpassword") {
        addNotification(`Invalid mail or password`, "error")
      }
    } else {
      const fullLogin = await window.api.netManager.postUrl("https://auth3.vintagestory.at/v2/gamelogin", { email, password, preLoginToken: preLogin["prelogintoken"], twofacode })

      saveLogin(fullLogin)
    }
  }

  async function saveLogin(data: object): Promise<void> {
    const newAccount: AccountType = {
      email: email,
      password: password,
      playerName: data["playername"],
      playerUid: data["uid"],
      playerEntitlements: data["entitlements"],
      sessionKey: data["sessionkey"],
      sessionSignature: data["sessionsignature"],
      mptoken: data["mptoken"],
      hostGameServer: data["hasgameserver"]
    }

    configDispatch({
      type: CONFIG_ACTIONS.SET_ACCOUNT,
      payload: newAccount
    })

    addNotification(`Logged in as ${newAccount.playerName}`, "success")
  }

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-4">
        <h1 className="text-3xl text-center font-bold">{t("features.config.loginTitle")}</h1>

        <FromWrapper className="max-w-[800px] w-full">
          <FormGroupWrapper>
            <FromGroup>
              <FormHead>
                <FormLabel content={t("generic.email")} />
              </FormHead>

              <FormBody>
                <FormFieldGroupWithDescription>
                  <FormInputText
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                    }}
                    placeholder={t("generic.email")}
                    minLength={1}
                    maxLength={100}
                  />
                  <FormFieldDescription content={t("generic.minMaxLength", { min: 1, max: 100 })} />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("generic.password")} />
              </FormHead>

              <FormBody>
                <FormFieldGroupWithDescription>
                  <FormInputPassword
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                    }}
                    placeholder={t("generic.password")}
                    minLength={1}
                    maxLength={100}
                  />
                  <FormFieldDescription content={t("generic.minMaxLength", { min: 1, max: 100 })} />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("generic.twofacode")} />
              </FormHead>

              <FormBody>
                <FormFieldGroupWithDescription>
                  <FormInputText
                    value={twofacode}
                    onChange={(e) => {
                      setTwofacode(e.target.value)
                    }}
                    placeholder={t("generic.twofacode")}
                    minLength={6}
                    maxLength={6}
                  />
                  <FormFieldDescription content={t("generic.minMaxLength", { min: 1, max: 100 })} />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>
        </FromWrapper>

        <ButtonsWrapper className="text-lg">
          <FormLinkButton to="/" title={t("generic.goBack")} className="p-2">
            <PiXCircleDuotone />
          </FormLinkButton>
          <FormButton onClick={handleLogin} title={t("generic.add")} className="p-2">
            <PiFloppyDiskBackDuotone />
          </FormButton>
        </ButtonsWrapper>
      </div>
    </ScrollableContainer>
  )
}

export default LoginPage
