import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { Intro } from './Intro'

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  setReducedMotion(false)
})

afterEach(() => {
  document.body.style.overflow = ''
})

describe('Intro', () => {
  it('compare a ogni caricamento e blocca lo scroll', () => {
    const first = render(<Intro />)
    expect(screen.getByRole('button', { name: /salta intro/i })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    first.unmount()

    // Nessuna memoria fra un caricamento e l'altro: si rivede sempre.
    render(<Intro />)
    expect(screen.getByRole('button', { name: /salta intro/i })).toBeInTheDocument()
  })

  it('espone la scena come immagine descritta', () => {
    render(<Intro />)
    expect(
      screen.getByRole('img', { name: /disco in vinile/i }),
    ).toBeInTheDocument()
  })

  it('si chiude con il pulsante e ripristina lo scroll', async () => {
    render(<Intro />)
    fireEvent.click(screen.getByRole('button', { name: /salta intro/i }))

    // Lo scroll torna disponibile subito; il velo esce con l'animazione.
    expect(document.body.style.overflow).not.toBe('hidden')
    await waitFor(
      () => expect(screen.queryByRole('button', { name: /salta intro/i })).toBeNull(),
      { timeout: 3000 },
    )
  })

  it('si chiude con un tasto qualsiasi', async () => {
    render(<Intro />)
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(
      () => expect(screen.queryByRole('button', { name: /salta intro/i })).toBeNull(),
      { timeout: 3000 },
    )
  })

  it('non compare con prefers-reduced-motion: reduce', () => {
    setReducedMotion(true)
    render(<Intro />)
    expect(screen.queryByRole('button', { name: /salta intro/i })).toBeNull()
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})
