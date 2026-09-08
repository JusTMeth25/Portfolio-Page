import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { Navbar } from '../components/Navbar'
import { renderWithI18n } from '../test/render'

beforeEach(() => {
  window.localStorage.clear()
})

describe('selettore di lingua', () => {
  it('parte in italiano e passa all’inglese', async () => {
    const user = userEvent.setup()
    renderWithI18n(<Navbar />, { language: 'it' })

    expect(screen.getByRole('link', { name: 'Progetti' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('it')

    await user.click(screen.getByRole('button', { name: /passa all’inglese/i }))

    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })

  it('ricorda la scelta e aggiorna il titolo della pagina', async () => {
    const user = userEvent.setup()
    renderWithI18n(<Navbar />, { language: 'it' })

    await user.click(screen.getByRole('button', { name: /passa all’inglese/i }))

    expect(window.localStorage.getItem('lm-lingua')).toBe('en')
    expect(document.title).toMatch(/Lorenzo Melis/)
  })

  it('scarica il CV italiano in italiano e quello inglese in inglese', async () => {
    const user = userEvent.setup()
    renderWithI18n(<Navbar />, { language: 'it' })

    // Il CV compare due volte: nell'header e nel menu mobile.
    const [italian] = screen.getAllByRole('link', { name: /scarica cv/i })
    expect(italian).toHaveAttribute(
      'href',
      expect.stringContaining('lorenzo-melis-cv-it.pdf'),
    )
    expect(italian).toHaveAttribute('download', 'Lorenzo-Melis-CV-IT.pdf')

    await user.click(screen.getByRole('button', { name: /passa all’inglese/i }))

    const [english] = screen.getAllByRole('link', { name: /download cv/i })
    expect(english).toHaveAttribute(
      'href',
      expect.stringContaining('lorenzo-melis-cv-en.pdf'),
    )
    expect(english).toHaveAttribute('download', 'Lorenzo-Melis-CV-EN.pdf')
  })
})
