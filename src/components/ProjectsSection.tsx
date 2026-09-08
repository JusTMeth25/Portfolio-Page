import { ArrowUpRight } from 'lucide-react'

import { getFeaturedProjects } from '../data/projects'
import { profile } from '../data/profile'
import { Reveal } from './effects/Reveal'
import { SectionIntro } from './effects/SectionIntro'
import { ProjectCard } from './ProjectCard'
import './projects-section.css'

const SECTION = {
  eyebrow: '01 / SELECTED WORK',
  title: 'Progetti in primo piano',
  linkLabel: 'Vedi GitHub',
}

export function ProjectsSection() {
  const featured = getFeaturedProjects()

  return (
    <section className="section" id="progetti" aria-labelledby="progetti-title">
      <div className="container">
        <SectionIntro
          id="progetti-title"
          eyebrow={SECTION.eyebrow}
          title={SECTION.title}
          aside={
            <a
              className="link"
              href={
                profile.contact.links.find((item) => item.kind === 'github')?.href
              }
              target="_blank"
              rel="noreferrer noopener"
            >
              {SECTION.linkLabel}
              <ArrowUpRight className="icon" aria-hidden="true" />
            </a>
          }
        />

        {featured.length === 0 ? (
          <p className="lede">Nessun progetto in evidenza al momento.</p>
        ) : (
          <ul className="projects-grid">
            {featured.map((project, index) => (
              <Reveal
                as="li"
                key={project.id}
                delay={index * 0.08}
                className="projects-grid__item"
              >
                <ProjectCard project={project} eager={index === 0} />
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
