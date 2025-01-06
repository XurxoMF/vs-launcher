import { useTranslation } from "react-i18next"

import { FormButton } from "@renderer/components/ui/FormComponents"

import { useTaskContext } from "@renderer/contexts/TaskManagerContext"

function HomePage(): JSX.Element {
  const { t } = useTranslation()

  const { startCompress } = useTaskContext()

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

        {/* For testing purposes only, will be removed */}
        <FormButton
          onClick={() => {
            startCompress("test name", "test description", "/home/xurxomf/.config/VSLGameVersions/1.19.6/assets", "/home/xurxomf/Descargas/test.zip", (status, error) => {
              if (status) return console.log("Compression finished successfully")
              return console.log("Compression failed", error)
            })
          }}
          title="Compress test"
        />
      </div>
    </div>
  )
}

export default HomePage
