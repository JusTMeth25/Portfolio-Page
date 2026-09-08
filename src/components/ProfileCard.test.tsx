import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithI18n } from '../test/render'
import { ProfileCard } from './ProfileCard'

describe('ProfileCard', () => {
  it('parte dalla foto e si gira sulla versione illustrata', async () => {
    const user = userEvent.setup()
    renderWithI18n(<ProfileCard />, { language: 'it' })

    const card = screen.getByRole('button', { name: /versione illustrata/i })
    expect(card).toHaveAttribute('aria-pressed', 'false')
    expect(card).toHaveAttribute('data-flipped', 'false')

    await user.click(card)

    const flipped = screen.getByRole('button', { name: /gira: foto/i })
    expect(flipped).toHaveAttribute('aria-pressed', 'true')
    expect(flipped).toHaveAttribute('data-flipped', 'true')
  })

  it('si gira anche da tastiera', async () => {
    const user = userEvent.setup()
    renderWithI18n(<ProfileCard />, { language: 'it' })

    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')

    await user.keyboard(' ')
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('tiene entrambe le immagini nel DOM, con le rispettive descrizioni', () => {
    renderWithI18n(<ProfileCard />, { language: 'it' })

    expect(screen.getByAltText(/foto di lorenzo melis/i)).toBeInTheDocument()
    expect(screen.getByAltText(/avatar illustrato/i)).toBeInTheDocument()
  })

  it('usa i testi inglesi quando il sito è in inglese', () => {
    renderWithI18n(<ProfileCard />, { language: 'en' })

    expect(
      screen.getByRole('button', { name: /illustrated version/i }),
    ).toBeInTheDocument()
    expect(screen.getByAltText(/photo of lorenzo melis/i)).toBeInTheDocument()
  })
})
