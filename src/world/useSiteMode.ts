import { useCallback, useState } from 'react'

import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export type SiteMode = 'world' | 'classic'

const STORAGE_KEY = 'lm-modalita'

/** WebGL disponibile? Senza, resta il sito classico. */
export function detectWebGL(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function savedMode(): SiteMode | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'world' || value === 'classic' ? value : null
  } catch {
    return null
  }
}

/**
 * Versione del sito da mostrare.
 *
 * - Mondo 3D di default, se WebGL c'è.
 * - Sito classico se WebGL manca, se il contesto si perde o se il sistema
 *   chiede meno animazioni (il volo della telecamera è movimento puro).
 * - Una scelta esplicita dal pulsante in navbar vince sul default e resta
 *   ricordata, anche con le animazioni ridotte.
 */
export function useSiteMode() {
  const [supported] = useState(detectWebGL)
  const reduced = usePrefersReducedMotion()
  const [choice, setChoice] = useState<SiteMode | null>(savedMode)
  const [broken, setBroken] = useState(false)

  const fallback: SiteMode = reduced ? 'classic' : 'world'
  const mode: SiteMode = !supported || broken ? 'classic' : (choice ?? fallback)

  const toggle = useCallback(() => {
    const next: SiteMode = mode === 'world' ? 'classic' : 'world'
    setChoice(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Al massimo la scelta non viene ricordata.
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [mode])

  const markBroken = useCallback(() => setBroken(true), [])

  return { mode, supported: supported && !broken, toggle, markBroken }
}
