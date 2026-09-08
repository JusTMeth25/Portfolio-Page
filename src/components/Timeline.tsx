import { profile } from '../data/profile'
import { Reveal } from './effects/Reveal'
import { SectionIntro } from './effects/SectionIntro'
import './timeline.css'

const { timeline } = profile

export function Timeline() {
  return (
    <section className="section" id="percorso" aria-labelledby="percorso-title">
      <div className="container">
        <SectionIntro
          id="percorso-title"
          eyebrow={timeline.eyebrow}
          title={timeline.title}
          aside={<p>{timeline.intro}</p>}
        />

        <ol className="timeline">
          {timeline.entries.map((entry, index) => (
            <Reveal as="li" key={entry.id} delay={index * 0.05} className="timeline__item">
              <div className="timeline__marker" aria-hidden="true" />
              <div className="timeline__content">
                <p className="timeline__period mono">
                  {entry.period}
                  {entry.current && (
                    <span className="timeline__badge">In corso</span>
                  )}
                </p>
                <h3 className="timeline__role">{entry.role}</h3>
                <p className="timeline__org">
                  {entry.organization}
                  {entry.place ? ` — ${entry.place}` : ''}
                  <span className="timeline__kind mono">{entry.kind}</span>
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
