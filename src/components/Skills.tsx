import { profile } from '../data/profile'
import { projects } from '../data/projects'
import { Reveal } from './effects/Reveal'
import { SpotlightCard } from './effects/SpotlightCard'
import './skills.css'

const { skills } = profile

/** Titoli dei progetti collegati a un gruppo di competenze. */
function relatedTitles(ids: readonly string[] | undefined): string[] {
  if (!ids) return []
  return ids
    .map((id) => projects.find((project) => project.id === id)?.title)
    .filter((title): title is string => Boolean(title))
}

export function Skills() {
  return (
    <section className="section" id="competenze" aria-labelledby="competenze-title">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">{skills.eyebrow}</p>
            <h2 className="section-title" id="competenze-title">
              {skills.title}
            </h2>
          </div>
          <p className="timeline__intro">{skills.note}</p>
        </div>

        <ul className="skills-grid">
          {skills.groups.map((group, index) => {
            const related = relatedTitles(group.relatedProjectIds)
            return (
              <Reveal
                as="li"
                key={group.id}
                delay={index * 0.05}
                className="skills-grid__item"
              >
                <SpotlightCard tilt={0}>
                  <div className="skills-card">
                    <h3 className="skills-card__title">{group.title}</h3>
                    <ul className="skills-card__items">
                      {group.items.map((item) => (
                        <li key={item} className="skills-card__item mono">
                          {item}
                        </li>
                      ))}
                    </ul>
                    {related.length > 0 && (
                      <p className="skills-card__related">
                        Usate in: <span>{related.join(', ')}</span>
                      </p>
                    )}
                  </div>
                </SpotlightCard>
              </Reveal>
            )
          })}
        </ul>

        <Reveal className="certifications">
          <h3 className="certifications__title">{skills.certifications.title}</h3>
          <ul className="certifications__list">
            {skills.certifications.items.map((item) => (
              <li key={item} className="certifications__item mono">
                {item}
              </li>
            ))}
          </ul>
          <p className="certifications__note">{skills.certifications.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
