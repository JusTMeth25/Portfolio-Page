import { useCallback, useSyncExternalStore } from 'react'

/**
 * Media query reattiva. `serverSnapshot` è il valore usato quando
 * `window.matchMedia` non è disponibile (test in jsdom, prerender).
 */
export function useMediaQuery(query: string, serverSnapshot = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return serverSnapshot
    return window.matchMedia(query).matches
  }, [query, serverSnapshot])

  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot)
}
