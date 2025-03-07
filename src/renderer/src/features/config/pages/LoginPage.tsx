import { useTranslation } from "react-i18next"
import { useState } from "react"
import { PiFloppyDiskBackDuotone, PiXCircleDuotone } from "react-icons/pi"
import { useNavigate } from "react-router-dom"

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
  FormInputPassword,
  FormFieldGroup
} from "@renderer/components/ui/FormComponents"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"

function LoginPage(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const navigate = useNavigate()

  const { configDispatch } = useConfigContext()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twofacode, setTwofacode] = useState("")

  const [loggingIn, setLoggingIn] = useState(false)

  async function handleLogin(): Promise<void> {
    setLoggingIn(true)
    addNotification(t("features.config.loggingin"), "info")

    // Thanks a lot to https://github.com/scgm0 for teaching me how to login using the Vintage Story Game Account
    // If you're reading this, make sure to check out MVL https://github.com/scgm0/MVL

    const preLogin = await window.api.netManager.postUrl("https://auth3.vintagestory.at/v2/gamelogin", { email, password })

    if (preLogin["valid"] == 0) {
      const reason = preLogin["reason"]

      if (reason == "requiretotpcode") {
        const fullLogin = await window.api.netManager.postUrl("https://auth3.vintagestory.at/v2/gamelogin", { email, password, preLoginToken: preLogin["prelogintoken"], twofacode })

        if (fullLogin["valid"] == 0 && fullLogin["reason"] == "wrongtotpcode") return addNotification(t("features.config.wrongtwofa"), "error")

        saveLogin(fullLogin)
      } else if (reason == "invalidemailorpassword") {
        addNotification(t("features.config.invalidEmailPass"), "error")
      }
    } else {
      saveLogin(preLogin)
    }
  }

  async function saveLogin(data: object): Promise<void> {
    const newAccount: AccountType = {
      email: email,
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

    addNotification(t("features.config.loggedin", { user: newAccount.playerName }), "success")
    setLoggingIn(false)
    navigate("/")
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
                <FormFieldGroup>
                  <FormInputText
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                    }}
                    placeholder={t("generic.email")}
                    readOnly={loggingIn}
                  />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("generic.password")} />
              </FormHead>

              <FormBody>
                <FormFieldGroup>
                  <FormInputPassword
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                    }}
                    placeholder={t("generic.password")}
                    readOnly={loggingIn}
                  />
                </FormFieldGroup>
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
                    readOnly={loggingIn}
                  />
                  <FormFieldDescription content={t("features.config.onlyIfEnabledTwoFA")} />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>
        </FromWrapper>

        <ButtonsWrapper className="text-lg">
          <FormLinkButton to="/" title={t("generic.goBack")} type="error" className="p-2">
            <PiXCircleDuotone />
          </FormLinkButton>
          <FormButton onClick={handleLogin} title={t("generic.add")} type="success" className="p-2">
            <PiFloppyDiskBackDuotone />
          </FormButton>
        </ButtonsWrapper>
      </div>
    </ScrollableContainer>
  )
}

export default LoginPage
