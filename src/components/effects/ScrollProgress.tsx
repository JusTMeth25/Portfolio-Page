import { motion, useScroll, useSpring } from 'motion/react'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import './scroll-progress.css'

/**
 * Filo ciano sotto la navbar che segue l'avanzamento nella pagina.
 * È decorativo (`aria-hidden`): la stessa informazione è già data dalla
 * scrollbar del browser.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduced = usePrefersReducedMotion()
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
      aria-hidden="true"
    />
  )
}
