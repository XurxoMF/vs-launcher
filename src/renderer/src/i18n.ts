import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enUS from "@renderer/locales/en-US.json"
import esES from "@renderer/locales/es-ES.json"
import ruRU from "@renderer/locales/ru-RU.json"
import zhCN from "@renderer/locales/zh-CN.json"
import frFR from "@renderer/locales/fr-FR.json"
import cs from "@renderer/locales/cs.json"
import deDE from "@renderer/locales/de-DE.json"
import ptPT from "@renderer/locales/pt-PT.json"

i18n.use(initReactI18next).init({
  resources: {
    "en-US": { translation: enUS, name: "English", credits: "by XuroMF" },
    "es-ES": { translation: esES, name: "Español", credits: "by XuroMF" },
    "ru-RU": { translation: ruRU, name: "Русский", credits: "by megabezdelnik" },
    "zh-CN": { translation: zhCN, name: "简体中文", credits: "by liuyujielol" },
    "fr-FR": { translation: frFR, name: "Français", credits: "by LorIlcs" },
    cs: { translation: cs, name: "Čeština", credits: "by DejFidOFF" },
    "de-DE": { translation: deDE, name: "Deutsch", credits: "by Brady_The" },
    "pt-PT": { translation: ptPT, name: "Português", credits: "by bruno-cabrita" }
  },
  lng: "en-US",
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false
  }
})

export default i18n
