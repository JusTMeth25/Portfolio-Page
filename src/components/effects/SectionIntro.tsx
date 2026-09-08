import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useReveal } from '../../hooks/useReveal'
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

/**
 * Testata di sezione con ingresso a tendina: ogni riga del titolo sale da
 * dietro una maschera, mentre una linea si allarga da sinistra.
 *
 * Il testo è sempre nel DOM e sempre leggibile dagli screen reader: la
 * maschera è puro `overflow: hidden`, non `visibility` o `opacity: 0`
 * permanenti. Con `prefers-reduced-motion` non c'è alcun movimento.
 *
 * L'ingresso è guidato solo dallo scroll: nessun timer che riveli in anticipo
 * le sezioni ancora lontane.
 */
export function SectionIntro({
  eyebrow,
  title,
  id,
  aside,
  action,
}: SectionIntroProps) {
  const { ref, visible } = useReveal<HTMLDivElement>({
    amount: 0.2,
    rootMargin: '0px 0px -12% 0px',
  })
  const reduced = usePrefersReducedMotion()
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
