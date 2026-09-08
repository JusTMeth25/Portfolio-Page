import { useI18n } from '../i18n/useI18n'
import { Reveal } from './effects/Reveal'
import { ProfileCard } from './ProfileCard'
import './about.css'

export function About() {
  const { profile } = useI18n()
  const { about } = profile

  return (
    <section className="section" id="profilo" aria-labelledby="profilo-title">
      <div className="container about">
        <Reveal className="about__media">
          <ProfileCard />
        </Reveal>

        <Reveal className="about__content" delay={0.06}>
          <p className="eyebrow">{about.eyebrow}</p>
          <h2 className="about__title" id="profilo-title">
            {about.title}
          </h2>

          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="about__paragraph">
              {paragraph}
            </p>
          ))}

          <dl className="about__facts">
            {about.facts.map((fact) => (
              <div key={fact.label} className="about__fact">
                <dt className="mono">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
