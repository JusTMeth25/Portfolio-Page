import { ArrowUpRight } from 'lucide-react'

import { getFeaturedProjects } from '../data/projects'
import { useI18n } from '../i18n/useI18n'
import { Reveal } from './effects/Reveal'
import { SectionIntro } from './effects/SectionIntro'
import { ProjectCard } from './ProjectCard'
import './projects-section.css'

export function ProjectsSection() {
  const { profile, projects } = useI18n()
  const section = profile.projectsSection
  const featured = getFeaturedProjects(projects)

  return (
    <section className="section" id="progetti" aria-labelledby="progetti-title">
      <div className="container">
        <SectionIntro
          id="progetti-title"
          eyebrow={section.eyebrow}
          title={section.title}
          aside={
            <a
              className="link"
              href={
                profile.contact.links.find((item) => item.kind === 'github')?.href
              }
              target="_blank"
              rel="noreferrer noopener"
            >
              {section.linkLabel}
              <ArrowUpRight className="icon" aria-hidden="true" />
            </a>
          }
        />

        {featured.length === 0 ? (
          <p className="lede">{profile.ui.emptyProjects}</p>
        ) : (
          <ul className="projects-grid">
            {featured.map((project, index) => (
              <Reveal
                as="li"
                key={project.id}
                variant="rise"
                delay={index * 0.12}
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
