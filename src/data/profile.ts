/**
 * Tipi dei contenuti del portfolio e registro delle lingue.
 *
 * I testi veri stanno in `src/data/locales/<lingua>.ts`: uno stesso oggetto,
 * una traduzione per file. Qui c'è solo la forma che devono rispettare.
 */

import { en } from './locales/en'
import { it } from './locales/it'

export type Language = 'it' | 'en'

export type ContactLink = {
  id: string
  label: string
  value: string
  href: string
  kind: 'email' | 'github' | 'linkedin'
}

/** Tipo di tappa: cambia solo l'etichetta, non il significato. */
export type TimelineKind = 'formazione' | 'lavoro'

export type TimelineEntry = {
  id: string
  period: string
  role: string
  organization: string
  place?: string
  description: string
  kind: TimelineKind
  current?: boolean
}

export type Interest = {
  id: string
  label: string
  note: string
  /** Tinta dell'etichetta: mappata sui token in styles/tokens.css. */
  accent: 'cyan' | 'amber' | 'magenta' | 'violet'
}

export type SkillGroup = {
  id: string
  title: string
  items: string[]
  /** id dei progetti (src/data/projects.ts) in cui il gruppo è visibile. */
  relatedProjectIds?: string[]
}

export type Profile = typeof it

/** Tutte le traduzioni disponibili. */
export const profiles: Record<Language, Profile> = { it, en }

/** Lingua di partenza, quando non c'è una scelta salvata. */
export const DEFAULT_LANGUAGE: Language = 'it'
