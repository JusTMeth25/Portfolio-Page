import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

type RevealProps = {
  children: ReactNode
  /** Ritardo in secondi, per scalare gli elementi di una griglia. */
  delay?: number
  as?: 'div' | 'li' | 'section'
  className?: string
}

/** Rete di sicurezza: dopo questo tempo il contenuto compare comunque. */
const FAILSAFE_MS = 1500

/**
 * Reveal in ingresso: piccola traslazione + opacità, una sola volta.
 *
 * Con `prefers-reduced-motion: reduce` il contenuto compare subito, senza
 * spostamenti. Se l'IntersectionObserver non scatta (browser esotici, tab in
 * background al primo paint, strumenti di rendering) il timer di sicurezza
 * mostra comunque il contenuto: nessuna sezione può restare invisibile.
 */
export function Reveal({
  children,
  delay = 0,
  as = 'div',
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const reduced = usePrefersReducedMotion()
  const [failsafe, setFailsafe] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setFailsafe(true), FAILSAFE_MS)
    return () => window.clearTimeout(id)
  }, [])

  if (reduced) {
    const Plain = as
    return (
      <Plain ref={ref as never} className={className}>
        {children}
      </Plain>
    )
  }

  const Component = motion[as]
  const visible = inView || failsafe

  return (
    <Component
      ref={ref as never}
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={visible ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </Component>
  )
}
