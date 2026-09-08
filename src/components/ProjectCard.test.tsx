import { fireEvent, screen } from '@testing-library/react'
import { renderWithI18n as render } from '../test/render'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { Project } from '../data/projects'
import { ProjectCard } from './ProjectCard'

const project: Project = {
  id: 'demo',
  title: 'Progetto Demo',
  label: 'EPICODE · TEST',
  description: 'Descrizione breve.',
  tags: ['React'],
  repositoryUrl: 'https://github.com/JusTMeth25/demo',
  image: 'images/projects/demo.jpg',
  imageAlt: 'copertina',
  imageKind: 'illustration',
  imageWidth: 1200,
  imageHeight: 750,
  featured: true,
  order: 1,
  details: {
    overview: 'Panoramica del progetto.',
    features: ['Funzione uno'],
  },
}

describe('ProjectCard', () => {
  it('mostra Demo live solo quando esiste un URL verificato', () => {
    const { rerender } = render(<ProjectCard project={project} />)
    expect(screen.queryByRole('link', { name: /demo live/i })).toBeNull()

    rerender(
      <ProjectCard project={{ ...project, demoUrl: 'https://example.invalid/' }} />,
    )
    expect(screen.getByRole('link', { name: /demo live/i })).toBeInTheDocument()
  })

  it('apre e chiude il pannello dei dettagli', async () => {
    const user = userEvent.setup()
    render(<ProjectCard project={project} />)

    const toggle = screen.getByRole('button', { name: /dettagli/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Panoramica del progetto.')).not.toBeVisible()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Panoramica del progetto.')).toBeVisible()

    await user.click(screen.getByRole('button', { name: /chiudi dettagli/i }))
    expect(screen.queryByText('Panoramica del progetto.')).not.toBeVisible()
  })

  it('sostituisce l’immagine mancante con un fallback decoroso', () => {
    render(<ProjectCard project={project} />)
    fireEvent.error(screen.getByAltText('copertina'))
    expect(screen.queryByAltText('copertina')).toBeNull()
  })
})
