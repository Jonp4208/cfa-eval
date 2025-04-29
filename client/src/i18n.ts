import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      // Disable automatic language detection since we're handling it in TranslationContext
      order: [], 
      // Alternatively, if you want to keep detection but prevent conflicts:
      // order: ['localStorage', 'navigator'],
      // caches: ['localStorage']
    }
  })

export default i18n 
