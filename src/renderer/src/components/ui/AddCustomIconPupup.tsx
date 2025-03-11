import { Dispatch, SetStateAction, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { useTranslation } from "react-i18next"
import { PiFloppyDiskBackDuotone, PiPlusCircleDuotone, PiXCircleDuotone } from "react-icons/pi"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"

import PopupDialogPanel from "./PopupDialogPanel"
import { ButtonsWrapper, FormBody, FormButton, FormFieldGroup, FormGroupWrapper, FormHead, FormInputText, FormLabel, FromGroup, FromWrapper } from "./FormComponents"

export function AddCustomIconPupup({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { configDispatch } = useConfigContext()

  const [id, setId] = useState<string | undefined>(undefined)
  const [file, setFile] = useState<string | undefined>(undefined)
  const [name, setName] = useState<string>("")

  return (
    <PopupDialogPanel title={t("generic.addIcon")} isOpen={open} close={() => setOpen(false)} bgDark={false}>
      <FromWrapper className="w-[500px]">
        <FormGroupWrapper bgDark={false}>
          <FromGroup className="items-center">
            <FormHead>
              <FormLabel content={t("generic.icon")} />
            </FormHead>

            <FormBody>
              <FormFieldGroup alignment="x" className="items-center">
                <FormButton
                  title={t("generic.selectIcon")}
                  onClick={async (e) => {
                    e.stopPropagation()
                    const path = await window.api.utils.selectFolderDialog({ type: "file", extensions: ["png"] })
                    if (path && path.length > 0 && path[0].length > 0) {
                      const id = uuidv4()
                      const filePath = await window.api.pathsManager.copyToIcons(path[0], id)

                      if (!filePath.status) return addNotification(t("notifications.body.coulndtCopyIcon"), "error")
                      setFile(filePath.file)
                      setId(id)
                    } else {
                      addNotification(t("notifications.body.noFileSelected"), "error")
                    }
                  }}
                  className="w-14 h-14 p-1 shrink-0"
                >
                  {file ? <img src={`icons:${file}`} alt={t("generic.icon")} /> : <PiPlusCircleDuotone className="text-3xl text-zinc-400/25 group-hover:scale-95 duration-200" />}
                </FormButton>
                <FormInputText value={name} onChange={(e) => setName(e.target.value)} placeholder={t("generic.iconName")} className="w-full" />
              </FormFieldGroup>
            </FormBody>
          </FromGroup>
        </FormGroupWrapper>

        <ButtonsWrapper className="text-lg" bgDark={false}>
          <FormButton onClick={() => setOpen(false)} title={t("generic.goBack")} type="error" className="p-2">
            <PiXCircleDuotone />
          </FormButton>
          <FormButton
            onClick={(e) => {
              e.stopPropagation()
              if (!file || !name || name.length < 1 || !id || id.length < 1) return addNotification(t("notifications.body.missingFields"), "error")

              configDispatch({ type: CONFIG_ACTIONS.ADD_CUSTOM_ICON, payload: { id: id, icon: file, name: name, custom: true } })
              setId(undefined)
              setFile(undefined)
              setName("")
              setOpen(false)
            }}
            title={t("generic.add")}
            type="success"
            className="p-2"
          >
            <PiFloppyDiskBackDuotone />
          </FormButton>
        </ButtonsWrapper>
      </FromWrapper>
    </PopupDialogPanel>
  )
}
