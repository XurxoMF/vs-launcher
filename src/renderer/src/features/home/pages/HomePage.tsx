import { useTranslation } from "react-i18next"

function HomePage(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">{t("features.home.title")}</h1>
      <p className="text-lg">{t("features.home.description")}</p>
      <iframe
        src="https://www.youtube.com/embed/C5v8NaRVIyk?si=rSRDgrOXKYBWu-7W"
        title="Promotional Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="max-w-full max-h-full h-1/2 aspect-video rounded-md shadow-md shadow-zinc-950 m-6"
      ></iframe>
    </div>
  )
}

export default HomePage
