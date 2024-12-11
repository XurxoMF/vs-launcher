import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enUS from "@assets/lang/en-US.json"
import esES from "@assets/lang/es-ES.json"
import ruRU from "@assets/lang/ru-RU.json"

i18n.use(initReactI18next).init({
  resources: {
    "en-US": { translation: enUS, name: "English" },
    "es-ES": { translation: esES, name: "Español" },
    "ru-RU": { translation: ruRU, name: "Русский" }
  },
  lng: "en-US",
  fallbackLng: "es-ES",
  interpolation: {
    escapeValue: false
  }
})

export default i18n
