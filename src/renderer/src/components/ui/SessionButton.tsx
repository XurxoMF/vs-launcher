import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PiFloppyDiskBackDuotone, PiUserDuotone, PiXCircleDuotone } from "react-icons/pi"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { CONFIG_ACTIONS, useConfigContext } from "@renderer/features/config/contexts/ConfigContext"

import {
  ButtonsWrapper,
  FormBody,
  FormButton,
  FormFieldDescription,
  FormFieldGroup,
  FormFieldGroupWithDescription,
  FormGroupWrapper,
  FormHead,
  FormInputPassword,
  FormInputText,
  FormLabel,
  FromGroup,
  FromWrapper
} from "@renderer/components/ui/FormComponents"
import PopupDialogPanel from "@renderer/components/ui/PopupDialogPanel"

function SessionButton(): JSX.Element {
  const { t } = useTranslation()
  const { config, configDispatch } = useConfigContext()
  const { addNotification } = useNotificationsContext()

  // Log In states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twofacode, setTwofacode] = useState("")

  const [loggingIn, setLoggingIn] = useState(false)
  const [logInOpen, setLogInOpen] = useState<boolean>(false)

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

        await saveLogin(fullLogin)
      } else if (reason == "invalidemailorpassword") {
        addNotification(t("features.config.invalidEmailPass"), "error")
      }
    } else {
      await saveLogin(preLogin)
    }

    setLoggingIn(false)
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

    configDispatch({ type: CONFIG_ACTIONS.SET_ACCOUNT, payload: newAccount })

    addNotification(t("features.config.loggedin", { user: newAccount.playerName }), "success")
    setLoggingIn(false)
    setLogInOpen(false)
  }

  return (
    <>
      <FormButton
        onClick={(e) => {
          if (!config.account) {
            setLogInOpen(true)
          } else {
            e.stopPropagation()
            configDispatch({ type: CONFIG_ACTIONS.SET_ACCOUNT, payload: null })
            addNotification(t("features.config.loggedout"), "success")
          }
        }}
        title={!config.account ? t("features.config.loginTitle") : t("features.config.logoutTitle")}
        className="w-full h-8"
      >
        <PiUserDuotone />

        <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">{!config.account ? t("features.config.loginTitle") : config.account.playerName}</p>
      </FormButton>

      <PopupDialogPanel title={t("features.config.loginTitle")} isOpen={logInOpen} close={() => setLogInOpen(false)}>
        <FromWrapper className="w-full">
          <FormGroupWrapper bgDark={false}>
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

          <ButtonsWrapper className="text-lg" bgDark={false}>
            <FormButton onClick={() => setLogInOpen(false)} title={t("generic.goBack")} type="error" className="p-2">
              <PiXCircleDuotone />
            </FormButton>
            <FormButton onClick={handleLogin} title={t("generic.add")} type="success" className="p-2">
              <PiFloppyDiskBackDuotone />
            </FormButton>
          </ButtonsWrapper>
        </FromWrapper>
      </PopupDialogPanel>
    </>
  )
}

export default SessionButton
