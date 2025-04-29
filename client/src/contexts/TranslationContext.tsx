import React, { createContext, useContext, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { settingsService } from '@/lib/services/settings'
import enTranslations from '@/lib/translations/en'
import esTranslations from '@/lib/translations/es'

type Language = 'en' | 'es'
type TranslationsType = typeof enTranslations

interface TranslationContextType {
  language: Language
  translations: TranslationsType
  setLanguage: (lang: Language) => void
  t: (key: string, defaultValue?: string, params?: Record<string, any>) => string
}

const LANGUAGE_STORAGE_KEY = 'app_language_preference'

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize language from localStorage or default to 'en'
  const getInitialLanguage = (): Language => {
    // First check localStorage
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage === 'en' || savedLanguage === 'es') {
      return savedLanguage as Language;
    }
    
    // Then check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) {
      return 'es';
    }
    
    // Default to English
    return 'en';
  }

  const [language, setLanguageState] = useState<Language>(getInitialLanguage())
  const [translations, setTranslations] = useState<TranslationsType>(
    language === 'en' ? enTranslations : esTranslations
  )

  // Fetch user's language preference from settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
    onSuccess: (data) => {
      if (data.language && (data.language === 'en' || data.language === 'es')) {
        // Only update if different from current language to avoid unnecessary re-renders
        if (data.language !== language) {
          setLanguageState(data.language)
          localStorage.setItem(LANGUAGE_STORAGE_KEY, data.language)
        }
      }
    }
  })

  // Update translations when language changes
  useEffect(() => {
    setTranslations(language === 'en' ? enTranslations : esTranslations)
  }, [language])

  // Function to get a translation by key path with variable interpolation
  const t = (keyPath: string, defaultValue?: string, params?: Record<string, any>): string => {
    const keys = keyPath.split('.')
    let result: any = translations
    
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key]
      } else {
        // Fallback to English if translation not found
        let fallback: any = enTranslations
        for (const k of keys) {
          if (fallback && fallback[k]) {
            fallback = fallback[k]
          } else {
            return defaultValue || keyPath // Return default value or key path if no translation found
          }
        }
        return fallback
      }
    }
    
    // Handle variable interpolation
    if (params && typeof result === 'string') {
      return result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return params[key] !== undefined ? String(params[key]) : match
      })
    }
    
    return result
  }

  // Update language in settings when it changes
  const handleSetLanguage = async (lang: Language) => {
    setLanguageState(lang)
    // Save to localStorage immediately
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    
    try {
      // Also update in backend settings
      await settingsService.updateSettings({ language: lang })
    } catch (error) {
      console.error('Failed to update language setting:', error)
      // Even if the API call fails, we keep the local preference
    }
  }

  return (
    <TranslationContext.Provider value={{ language, translations, setLanguage: handleSetLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
} 
