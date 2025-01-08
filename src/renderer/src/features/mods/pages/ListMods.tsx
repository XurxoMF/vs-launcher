// import { useState, useEffect } from "react"
// import axios from "axios"
import { useTranslation } from "react-i18next"

function ListMods(): JSX.Element {
  const { t } = useTranslation()

  // const [modList, setModList] = useState([])

  // useEffect(() => {
  //   ;(async (): Promise<void> => {
  //     try {
  //       const res = await axios("/moddbapi/mods")
  //       setModList(res.data["mods"])
  //     } catch (err) {
  //       window.api.utils.logMessage("error", `[component] [ModsList] Error fetching mods: ${err}`)
  //     }
  //   })()
  // }, [])

  return (
    <>
      {/* <h1 className="text-3xl text-center font-bold">Mods list</h1> */}

      <div className="w-full h-full flex flex-col items-center justify-center gap-4 select-none">
        <h1 className="text-4xl">{t("features.generic.notImplemented")}</h1>
        <p className="text-xl">{t("features.generic.notImplementedDesc")}</p>
      </div>
    </>
  )
}

export default ListMods
