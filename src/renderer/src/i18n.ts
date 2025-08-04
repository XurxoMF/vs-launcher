import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enUS from "@renderer/locales/en-US.json"
import esES from "@renderer/locales/es-ES.json"
import ruRU from "@renderer/locales/ru-RU.json"
import zhCN from "@renderer/locales/zh-CN.json"
import frFR from "@renderer/locales/fr-FR.json"
import deDE from "@renderer/locales/de-DE.json"
import ptPT from "@renderer/locales/pt-PT.json"
import nlNL from "@renderer/locales/nl-NL.json"
import plPL from "@renderer/locales/pl-PL.json"
import itIT from "@renderer/locales/it-IT.json"
import huHU from "@renderer/locales/hu-HU.json"
import ukUA from "@renderer/locales/uk-UA.json"

i18n.use(initReactI18next).init({
  resources: {
    "en-US": { translation: enUS, name: "English", credits: "by XurxoMF" },
    "es-ES": { translation: esES, name: "Español (España)", credits: "by XurxoMF" },
    "ru-RU": { translation: ruRU, name: "Русский", credits: "by megabezdelnik" },
    "zh-CN": { translation: zhCN, name: "简体中文", credits: "by liuyujielol" },
    "fr-FR": { translation: frFR, name: "Français", credits: "by LorIlcs" },
    "de-DE": { translation: deDE, name: "Deutsch", credits: "by Brady_The" },
    "pt-PT": { translation: ptPT, name: "Português", credits: "by Bruno Cabrita" },
    "nl-NL": { translation: nlNL, name: "Dutch (Netherlands)", credits: "by Dennisjeee" },
    "pl-PL": { translation: plPL, name: "Polski", credits: "by Runo Hawk, Zsuatem" },
    "it-IT": { translation: itIT, name: "Italiano", credits: "by Pingoda" },
    "hu-HU": { trasnlation: huHU, name: "Magyar", credits: "by dobisan" },
    "uk-UA": { translation: ukUA, name: "Українська", credits: "by rXelelo" }
  },
  lng: "en-US",
  fallbackLng: "en-US"
})

export default i18n
