import { useState, useEffect } from "react"
import axios from "axios"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { PiDownloadFill, PiStarFill, PiChatCenteredDotsFill } from "react-icons/pi"

function ListMods(): JSX.Element {
  const { t } = useTranslation()

  const [modList, setModList] = useState([])

  useEffect(() => {
    ;(async (): Promise<void> => {
      try {
        const res = await axios("/moddbapi/mods")
        setModList(res.data["mods"])
      } catch (err) {
        window.api.utils.logMessage("error", `[component] [ListMods] Error fetching mod: ${err}`)
      }
    })()
  }, [])

  return (
    <>
      <h1 className="text-3xl text-center font-bold select-none">{t("features.mods.listTitle")}</h1>

      <div className="w-full h-full flex justify-center gap-4 flex-wrap select-none">
        {modList.map((mod) => (
          <div key={mod["modid"]} className="group w-60 h-48 relative">
            <Link
              to={`/mods/${mod["modid"]}`}
              className="w-full h-full flex flex-col rounded bg-zinc-800 shadow shadow-zinc-900 group-hover:shadow-lg group-hover:shadow-zinc-900 absolute group-hover:h-56 group-hover:-translate-y-4 z-0 group-hover:z-20 duration-100 overflow-hidden"
            >
              <img
                src={mod["logo"] ? `/moddbfiles/${mod["logo"]}` : "/moddbfiles/web/img/mod-default.png"}
                alt={mod["name"]}
                className="h-32 aspect-video object-cover object-center bg-zinc-850 rounded"
              />
              <div className="w-full h-16 group-hover:h-32 duration-100 px-2 py-1">
                <div className="w-full h-full text-center relative">
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap relative">{mod["name"]}</p>
                  <p className="text-sm text-zinc-500 line-clamp-2 opacity-0 group-hover:opacity-100 duration-100 delay-0 group-hover:delay-100 relative">{mod["summary"]}</p>
                  <div className="w-full text-sm text-zinc-500 flex justify-around absolute bottom-0">
                    <p className="flex items-center gap-1">
                      <PiDownloadFill />
                      <span>{mod["downloads"]}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <PiStarFill />
                      <span>{mod["follows"]}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <PiChatCenteredDotsFill />
                      <span>{mod["comments"]}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

export default ListMods
