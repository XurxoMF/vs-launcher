import { useTranslation } from "react-i18next"
import { PiPlayCircleDuotone } from "react-icons/pi"

const VIDEO_ID = "mgvzBB_--xM"

function HomePage(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">{t("features.home.title")}</h1>

      <p className="text-lg">{t("features.home.description")}</p>

      <button
        className="relative max-w-full max-h-full h-1/2 aspect-video rounded-md shadow-md shadow-zinc-950/50 m-6 overflow-hidden group cursor-pointer"
        title={t("features.home.watchTrailer")}
        onClick={() => window.api.utils.openOnBrowser(`https://www.youtube.com/watch?v=${VIDEO_ID}`)}
      >
        <img
          src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
          alt={t("features.home.watchTrailer")}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/30 group-hover:bg-zinc-950/50 duration-200">
          <PiPlayCircleDuotone className="text-7xl text-white/80 group-hover:text-white group-hover:scale-110 duration-200" />
        </div>
      </button>
    </div>
  )
}

export default HomePage
