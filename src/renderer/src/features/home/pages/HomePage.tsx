import { useTranslation } from "react-i18next"

function HomePage(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="relative h-screen bg-image-1 overflow-hidden bg-image-vs bg-center bg-cover">
      <div className="w-full h-full flex flex-col items-center justify-around p-4 pt-8 bg-zinc-900/60">
        <div className="w-full text-center flex flex-col items-center gap-2 text-lg">
          <h1 className="text-4xl font-bold">{t("features.home.title")}</h1>
          <p>{t("features.home.description")}</p>
        </div>
        <iframe
          src="https://www.youtube.com/embed/C5v8NaRVIyk?si=rSRDgrOXKYBWu-7W"
          title="Promotional Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="max-w-full max-h-full h-1/2 aspect-video rounded-md shadow-md shadow-zinc-900"
        ></iframe>
      </div>
    </div>
  )
}

export default HomePage
