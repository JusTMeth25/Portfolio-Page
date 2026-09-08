import type { ProjectDetails as Details } from '../data/projects'

type ProjectDetailsProps = {
  id: string
  details: Details
  hidden: boolean
}

/** Pannello espandibile con le informazioni verificate del progetto. */
export function ProjectDetails({ id, details, hidden }: ProjectDetailsProps) {
  return (
    <div className="project-card__details" id={id} hidden={hidden}>
      <p className="project-card__overview">{details.overview}</p>

      <h4 className="project-card__details-title">Funzionalità</h4>
      <ul className="project-card__list">
        {details.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      {details.notes && details.notes.length > 0 && (
        <>
          <h4 className="project-card__details-title">Note</h4>
          <ul className="project-card__list project-card__list--muted">
            {details.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
