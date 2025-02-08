import { useState, useEffect } from "react"
import axios from "axios"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"

function ModInfo(): JSX.Element {
  const { t } = useTranslation()

  const { modid } = useParams()

  const [mod, setMod] = useState([])

  useEffect(() => {
    ;(async (): Promise<void> => {
      try {
        const res = await axios(`/moddbapi/mod/${modid}`)
        setMod(res.data["mod"])
      } catch (err) {
        window.api.utils.logMessage("error", `[component] [ModInfo] Error fetching mods: ${err}`)
      }
    })()
  }, [])

  return (
    <>
      <h1 className="text-3xl text-center font-bold select-none">{t("features.mods.modTitle")}</h1>

      <div className="w-full h-full flex flex-col items-center justify-center gap-4 select-none">
        <p>{mod["name"]}</p>
      </div>
    </>
  )
}

export default ModInfo
