import { useI18n } from '../i18n/useI18n'
import { Reveal } from './effects/Reveal'
import { SectionIntro } from './effects/SectionIntro'
import { SpotlightCard } from './effects/SpotlightCard'
import './skills.css'

/** Titoli dei progetti collegati a un gruppo di competenze. */
function relatedTitles(
  ids: readonly string[] | undefined,
  projects: { id: string; title: string }[],
): string[] {
  if (!ids) return []
  return ids
    .map((id) => projects.find((project) => project.id === id)?.title)
    .filter((title): title is string => Boolean(title))
}

export function Skills() {
  const { profile, projects } = useI18n()
  const { skills, ui } = profile

  return (
    <section className="section" id="competenze" aria-labelledby="competenze-title">
      <div className="container">
        <SectionIntro
          id="competenze-title"
          eyebrow={skills.eyebrow}
          title={skills.title}
          aside={<p>{skills.note}</p>}
        />

        <ul className="skills-grid">
          {skills.groups.map((group, index) => {
            const related = relatedTitles(group.relatedProjectIds, projects)
            return (
              <Reveal
                as="li"
                key={group.id}
                variant="rise"
                delay={index * 0.08}
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
                        {ui.usedIn} <span>{related.join(', ')}</span>
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
