import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

import { useI18n } from '../i18n/useI18n'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { Reveal } from './effects/Reveal'
import { SectionIntro } from './effects/SectionIntro'
import './timeline.css'

export function Timeline() {
  const { profile } = useI18n()
  const { timeline, ui } = profile
  const listRef = useRef<HTMLOListElement>(null)
  const reduced = usePrefersReducedMotion()

  // La linea verticale si disegna man mano che la sezione attraversa lo
  // schermo: è il filo che tiene insieme le tappe.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 85%', 'end 60%'],
  })

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section className="section" id="percorso" aria-labelledby="percorso-title">
      <div className="container">
        <SectionIntro
          id="percorso-title"
          eyebrow={timeline.eyebrow}
          title={timeline.title}
          aside={<p>{timeline.intro}</p>}
        />

        <ol className="timeline" ref={listRef}>
          <motion.span
            className="timeline__line"
            style={reduced ? undefined : { scaleY: lineScale }}
            data-static={reduced ? 'true' : 'false'}
            aria-hidden="true"
          />

          {timeline.entries.map((entry, index) => (
            <Reveal
              as="li"
              key={entry.id}
              variant="left"
              delay={index * 0.04}
              className="timeline__item"
            >
              <div className="timeline__marker" aria-hidden="true" />
              <div className="timeline__content">
                <p className="timeline__period mono">
                  {entry.period}
                  {entry.current && (
                    <span className="timeline__badge">{ui.inProgress}</span>
                  )}
                </p>
                <h3 className="timeline__role">{entry.role}</h3>
                <p className="timeline__org">
                  {entry.organization}
                  {entry.place ? ` — ${entry.place}` : ''}
                  <span className="timeline__kind mono">
                    {ui.timelineKind[entry.kind]}
                  </span>
                </p>
                <p className="timeline__description">{entry.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
