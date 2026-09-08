import { ChevronDown, ExternalLink, FolderGit2 } from 'lucide-react'
import { useId, useState } from 'react'

import type { Project } from '../data/projects'
import { useI18n } from '../i18n/useI18n'
import { asset } from '../lib/asset'
import { SpotlightCard } from './effects/SpotlightCard'
import { ProjectDetails } from './ProjectDetails'
import './project-card.css'

type ProjectCardProps = {
  project: Project
  /** L'immagine della prima scheda non viene caricata in lazy. */
  eager?: boolean
}

export function ProjectCard({ project, eager = false }: ProjectCardProps) {
  const { ui } = useI18n().profile
  const [open, setOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const detailsId = useId()
  const titleId = useId()

  return (
    <SpotlightCard className="project-card">
      <div className="project-card__media">
        {imageFailed ? (
          <div className="project-card__placeholder" aria-hidden="true">
            <span className="mono">{project.title}</span>
          </div>
        ) : (
          <img
            src={asset(project.image)}
            alt={project.imageAlt}
            width={project.imageWidth}
            height={project.imageHeight}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )}
        <span className="project-card__kind mono">
          {project.imageKind === 'screenshot' ? ui.screenshot : ui.illustration}
        </span>
      </div>

      <div className="project-card__body">
        <p className="project-card__label mono">{project.label}</p>
        <h3 className="project-card__title" id={titleId}>
          {project.title}
        </h3>
        <p className="project-card__description">{project.description}</p>

        <ul className="project-card__tags" aria-label={ui.technologies}>
          {project.tags.map((tag) => (
            <li key={tag} className="project-card__tag mono">
              {tag}
            </li>
          ))}
        </ul>

        <div className="project-card__actions">
          <a
            className="btn btn--small"
            href={project.repositoryUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FolderGit2 className="icon" aria-hidden="true" />
            {ui.repository}
            <span className="visually-hidden">
              {ui.of} {project.title}
            </span>
          </a>

          {project.demoUrl && (
            <a
              className="btn btn--small"
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              <ExternalLink className="icon" aria-hidden="true" />
              {ui.liveDemo}
              <span className="visually-hidden">
                {ui.of} {project.title}
              </span>
            </a>
          )}

          {project.details && (
            <button
              type="button"
              className="btn btn--small project-card__toggle"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? ui.closeDetails : ui.details}
              <span className="visually-hidden">
                {ui.of} {project.title}
              </span>
              <ChevronDown className="icon project-card__chevron" aria-hidden="true" />
            </button>
          )}
        </div>

        {project.details && (
          <ProjectDetails
            id={detailsId}
            details={project.details}
            hidden={!open}
          />
        )}
      </div>
    </SpotlightCard>
  )
}
