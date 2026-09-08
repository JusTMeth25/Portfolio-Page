import { useEffect, useRef, useState, type RefObject } from 'react'

type UseRevealOptions = {
  /** Quanta parte dell'elemento deve essere visibile, 0…1. */
  amount?: number
  /** Margine sul fondo del viewport: negativo = scatta un po' più tardi. */
  rootMargin?: string
}

type UseRevealResult<T extends HTMLElement> = {
  ref: RefObject<T | null>
  visible: boolean
}

/**
 * "L'elemento è entrato nel viewport almeno una volta?"
 *
 * Il reveal è guidato **solo** dall'IntersectionObserver: nessun timer di
 * sicurezza generalizzato, altrimenti dopo qualche secondo tutta la pagina
 * risulterebbe già rivelata e scorrendo non si vedrebbe più nulla apparire.
 *
 * L'unico caso in cui si mostra tutto subito è quando l'API non esiste: lì il
 * contenuto non deve certo restare invisibile.
 */
export function useReveal<T extends HTMLElement>({
  amount = 0.15,
  rootMargin = '0px 0px -10% 0px',
}: UseRevealOptions = {}): UseRevealResult<T> {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    if (visible) return
    const node = ref.current
    if (!node) return
    // Il caso "API assente" è già coperto dallo stato iniziale.

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: amount, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [visible, amount, rootMargin])

  return { ref, visible }
}
