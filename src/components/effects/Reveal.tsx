import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useReveal } from '../../hooks/useReveal'

/** Come entra l'elemento. */
export type RevealVariant = 'up' | 'rise' | 'left' | 'zoom'

type RevealProps = {
  children: ReactNode
  /** Ritardo in secondi, per scalare gli elementi di una griglia. */
  delay?: number
  as?: 'div' | 'li' | 'section'
  className?: string
  variant?: RevealVariant
}

const VARIANTS: Record<RevealVariant, Variants> = {
  // Traslazione breve: per blocchi di testo.
  up: {
    hidden: { opacity: 0, y: 26 },
    shown: { opacity: 1, y: 0 },
  },
  // Salita più marcata con una punta di prospettiva: per le schede.
  rise: {
    hidden: { opacity: 0, y: 64, scale: 0.965, rotateX: 6 },
    shown: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
  },
  // Ingresso laterale: per gli elementi di una timeline.
  left: {
    hidden: { opacity: 0, x: -36 },
    shown: { opacity: 1, x: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.9 },
    shown: { opacity: 1, scale: 1 },
  },
}

/**
 * Reveal all'ingresso nel viewport, una volta sola.
 *
 * Con `prefers-reduced-motion: reduce` il contenuto viene reso senza alcun
 * wrapper animato: compare subito, dove deve stare.
 */
export function Reveal({
  children,
  delay = 0,
  as = 'div',
  className,
  variant = 'up',
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLElement>()
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    const Plain = as
    return (
      <Plain ref={ref as never} className={className}>
        {children}
      </Plain>
    )
  }

  const Component = motion[as]

  return (
    <Component
      ref={ref as never}
      className={className}
      variants={VARIANTS[variant]}
      initial="hidden"
      animate={visible ? 'shown' : 'hidden'}
      transition={{
        duration: variant === 'rise' ? 0.75 : 0.6,
        delay,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      style={variant === 'rise' ? { transformPerspective: 900 } : undefined}
    >
      {children}
    </Component>
  )
}
