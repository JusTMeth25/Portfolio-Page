import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  DEFAULT_LANGUAGE,
  profiles,
  type Language,
  type Profile,
} from '../data/profile'
import { getProjects, type Project } from '../data/projects'

const STORAGE_KEY = 'lm-lingua'

export type LanguageContextValue = {
  language: Language
  profile: Profile
  projects: Project[]
  setLanguage: (language: Language) => void
  /** Passa all'altra lingua: sono due, non serve un menu. */
  toggleLanguage: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext<LanguageContextValue | null>(null)

function isLanguage(value: unknown): value is Language {
  return value === 'it' || value === 'en'
}

/** Lingua salvata, altrimenti quella del browser, altrimenti l'italiano. */
function initialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) return saved
  } catch {
    // Storage non disponibile: si prosegue con il rilevamento.
  }
  if (typeof navigator !== 'undefined' && navigator.language.startsWith('en')) {
    return 'en'
  }
  return DEFAULT_LANGUAGE
}

/**
 * Lingua corrente del sito.
 *
 * La scelta viene ricordata in `localStorage` e riflessa su `<html lang>`,
 * sul titolo e sulla meta description, così anche la scheda del browser e le
 * anteprime dei link restano coerenti.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Al massimo la scelta non viene ricordata.
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'it' ? 'en' : 'it')
  }, [language, setLanguage])

  useEffect(() => {
    const profile = profiles[language]
    document.documentElement.lang = language
    document.title = profile.seo.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', profile.seo.description)
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      profile: profiles[language],
      projects: getProjects(language),
      setLanguage,
      toggleLanguage,
    }),
    [language, setLanguage, toggleLanguage],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}
