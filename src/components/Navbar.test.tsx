import { screen } from '@testing-library/react'
import { renderWithI18n as render } from '../test/render'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Navbar } from './Navbar'

describe('Navbar', () => {
  it('apre il menu mobile, lo chiude con Escape e dopo una selezione', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const toggle = screen.getByRole('button', { name: /apri il menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(
      screen.getByRole('button', { name: /chiudi il menu/i }),
    ).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /apri il menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    await user.click(screen.getByRole('button', { name: /apri il menu/i }))
    await user.click(screen.getByRole('link', { name: 'Progetti' }))
    expect(screen.getByRole('button', { name: /apri il menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('il pulsante del menu controlla la lista dei link', () => {
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: /apri il menu/i })
    const controlled = toggle.getAttribute('aria-controls')
    expect(controlled).toBeTruthy()
    expect(document.getElementById(controlled as string)).not.toBeNull()
  })
})
