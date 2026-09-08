import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { Cursor } from './Cursor'

const originalMatchMedia = window.matchMedia

/** Puntatore preciso e movimento non ridotto: le condizioni in cui vive. */
function useFinePointer() {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('hover: hover'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

function useCoarsePointer() {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

function movePointer(x: number, y: number, target?: Element) {
  const event = new MouseEvent('pointermove', {
    clientX: x,
    clientY: y,
    bubbles: true,
  })
  ;(target ?? window).dispatchEvent(event)
}

const cursor = () => document.querySelector<HTMLElement>('.cursor')
const dot = () => document.querySelector<HTMLElement>('.cursor__dot')
const ring = () => document.querySelector<HTMLElement>('.cursor__ring')

beforeEach(useFinePointer)

afterEach(() => {
  window.matchMedia = originalMatchMedia
  document.documentElement.classList.remove('has-custom-cursor')
})

describe('Cursor', () => {
  it('nasconde la freccia di sistema solo mentre è montato', () => {
    const view = render(<Cursor />)
    expect(document.documentElement).toHaveClass('has-custom-cursor')

    view.unmount()
    expect(document.documentElement).not.toHaveClass('has-custom-cursor')
  })

  it('tiene il punto esattamente sul puntatore e l’anello indietro', async () => {
    render(<Cursor />)
    movePointer(400, 300)

    await waitFor(() =>
      expect(dot()?.style.transform).toContain('translate3d(400px, 300px, 0)'),
    )
    // L'anello insegue: non è ancora arrivato dove sta il punto.
    expect(ring()?.style.transform).not.toBe(dot()?.style.transform)
  })

  it('continua a seguire su movimenti successivi', async () => {
    render(<Cursor />)

    movePointer(200, 200)
    await waitFor(() =>
      expect(dot()?.style.transform).toContain('translate3d(200px, 200px, 0)'),
    )

    movePointer(900, 640)
    await waitFor(() =>
      expect(dot()?.style.transform).toContain('translate3d(900px, 640px, 0)'),
    )
  })

  it('mostra la manina sugli elementi cliccabili e non altrove', async () => {
    const link = document.createElement('a')
    link.href = '#progetti'
    document.body.append(link)
    const plain = document.createElement('p')
    document.body.append(plain)

    render(<Cursor />)

    movePointer(10, 10, link)
    await waitFor(() => expect(cursor()).toHaveAttribute('data-active', 'true'))

    movePointer(20, 20, plain)
    await waitFor(() => expect(cursor()).toHaveAttribute('data-active', 'false'))

    link.remove()
    plain.remove()
  })

  it('senza puntatore preciso resta il cursore di sistema', () => {
    useCoarsePointer()
    render(<Cursor />)

    expect(cursor()).toBeNull()
    expect(document.documentElement).not.toHaveClass('has-custom-cursor')
  })
})
