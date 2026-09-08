import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PointerRing } from './PointerRing'

const originalMatchMedia = window.matchMedia

/** Puntatore preciso e movimento non ridotto: le condizioni in cui l'anello vive. */
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

function movePointer(x: number, y: number) {
  window.dispatchEvent(
    new MouseEvent('pointermove', { clientX: x, clientY: y, bubbles: true }),
  )
}

function ring() {
  return document.querySelector<HTMLDivElement>('.pointer-ring')
}

beforeEach(useFinePointer)

afterEach(() => {
  window.matchMedia = originalMatchMedia
})

describe('PointerRing', () => {
  it('continua a inseguire il puntatore anche dopo molti fotogrammi', async () => {
    render(<PointerRing />)
    expect(ring()).not.toBeNull()

    movePointer(120, 140)
    await waitFor(
      () => expect(ring()?.style.transform).toMatch(/translate3d\(\d/),
      { timeout: 2000 },
    )
    const first = ring()?.style.transform

    // Secondo spostamento, lontano: la trasformazione deve cambiare ancora.
    // Qui si rompeva: il ciclo che muove l'anello veniva spento e il pallino
    // restava fermo sullo schermo.
    movePointer(900, 620)
    await waitFor(
      () => expect(ring()?.style.transform).not.toBe(first),
      { timeout: 2000 },
    )

    const second = ring()?.style.transform
    movePointer(200, 180)
    await waitFor(
      () => expect(ring()?.style.transform).not.toBe(second),
      { timeout: 2000 },
    )
  })

  it('si mostra al primo movimento e si nasconde quando il puntatore esce', async () => {
    render(<PointerRing />)

    movePointer(300, 300)
    await waitFor(() => expect(ring()).toHaveAttribute('data-visible', 'true'))

    document.dispatchEvent(new MouseEvent('pointerleave', { bubbles: false }))
    await waitFor(() => expect(ring()).toHaveAttribute('data-visible', 'false'))
  })

  it('non viene montato senza puntatore preciso', () => {
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

    render(<PointerRing />)
    expect(ring()).toBeNull()
  })
})
