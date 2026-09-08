import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithI18n } from '../test/render'
import { ProjectsSection } from './ProjectsSection'

describe('ProjectsSection', () => {
  it('apre i dettagli solo della scheda cliccata', async () => {
    const user = userEvent.setup()
    renderWithI18n(<ProjectsSection />)

    const toggles = screen.getAllByRole('button', { name: /dettagli/i })
    expect(toggles.length).toBeGreaterThan(1)

    await user.click(toggles[1])

    const expanded = screen
      .getAllByRole('button', { name: /dettagli/i })
      .map((button) => button.getAttribute('aria-expanded'))

    expect(expanded).toEqual(['false', 'true', 'false'])
  })

  it('richiude solo la scheda che era aperta', async () => {
    const user = userEvent.setup()
    renderWithI18n(<ProjectsSection />)

    const [first] = screen.getAllByRole('button', { name: /dettagli/i })
    await user.click(first)
    expect(
      screen.getAllByRole('button', { name: /dettagli/i })[0],
    ).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getAllByRole('button', { name: /dettagli/i })[0])
    expect(
      screen
        .getAllByRole('button', { name: /dettagli/i })
        .map((button) => button.getAttribute('aria-expanded')),
    ).toEqual(['false', 'false', 'false'])
  })
})
