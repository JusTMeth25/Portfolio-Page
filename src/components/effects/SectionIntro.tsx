import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import './section-intro.css'

type SectionIntroProps = {
  eyebrow: string
  title: string
  id: string
  /** Testo di spalla, a destra del titolo. */
  aside?: ReactNode
  /** Contenuto extra sotto il titolo (link di sezione, CTA...). */
  action?: ReactNode
}

/** Rete di sicurezza: se l'osservatore non scatta, il testo compare comunque. */
const FAILSAFE_MS = 1500

/**
 * Testata di sezione con ingresso a tendina: ogni riga del titolo sale da
 * dietro una maschera, mentre una linea si allarga da sinistra.
 *
 * Il testo è sempre nel DOM e sempre leggibile dagli screen reader: la
 * maschera è puro `overflow: hidden`, non `visibility` o `opacity: 0`
 * permanenti. Con `prefers-reduced-motion` non c'è alcun movimento.
 */
export function SectionIntro({
  eyebrow,
  title,
  id,
  aside,
  action,
}: SectionIntroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -18% 0px' })
  const reduced = usePrefersReducedMotion()
  const [failsafe, setFailsafe] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setFailsafe(true), FAILSAFE_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const visible = inView || failsafe
  const words = title.split(' ')

  if (reduced) {
    return (
      <div className="section-intro" ref={ref}>
        <div className="section-intro__main">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title" id={id}>
            {title}
          </h2>
          {action}
        </div>
        {aside && <div className="section-intro__aside">{aside}</div>}
      </div>
    )
  }

  return (
    <div className="section-intro" ref={ref}>
      <div className="section-intro__main">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, x: -12 }}
          animate={visible ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {eyebrow}
        </motion.p>

        <motion.span
          className="section-intro__rule"
          initial={{ scaleX: 0 }}
          animate={visible ? { scaleX: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 0.61, 0.36, 1] }}
          aria-hidden="true"
        />

        <h2 className="section-title" id={id}>
          {words.map((word, index) => (
            <span className="section-intro__mask" key={`${word}-${index}`}>
              <motion.span
                className="section-intro__word"
                initial={{ y: '110%' }}
                animate={visible ? { y: '0%' } : undefined}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + index * 0.06,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h2>

        {action && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={visible ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {action}
          </motion.div>
        )}
      </div>

      {aside && (
        <motion.div
          className="section-intro__aside"
          initial={{ opacity: 0, y: 14 }}
          animate={visible ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.22 }}
        >
          {aside}
        </motion.div>
      )}
    </div>
  )
}
