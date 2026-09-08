import { profile } from '../data/profile'
import { Equalizer } from './effects/Equalizer'
import { Reveal } from './effects/Reveal'
import { SectionIntro } from './effects/SectionIntro'
import './interests.css'

const { interests } = profile

export function Interests() {
  return (
    <section
      className="section"
      id="colonna-sonora"
      aria-labelledby="colonna-sonora-title"
    >
      <div className="container">
        <SectionIntro
          id="colonna-sonora-title"
          eyebrow={interests.eyebrow}
          title={interests.title}
          aside={<p>{interests.text}</p>}
        />

        <ul className="interests">
          {interests.items.map((item, index) => (
            <Reveal
              as="li"
              key={item.id}
              delay={index * 0.06}
              className="interests__item"
            >
              <article className="record" data-accent={item.accent}>
                <div className="record__disc" aria-hidden="true">
                  <span className="record__label" />
                </div>
                <div className="record__text">
                  <h3 className="record__title">{item.label}</h3>
                  <p className="record__note">{item.note}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal className="interests__eq">
          <Equalizer bars={26} />
          <p className="interests__eq-note mono">
            {interests.items.map((item) => item.label).join(' · ')}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
