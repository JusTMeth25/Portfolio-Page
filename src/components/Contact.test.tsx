import { fireEvent, screen } from '@testing-library/react'
import { renderWithI18n as render } from '../test/render'
import { afterEach, describe, expect, it } from 'vitest'

import { Contact } from './Contact'

const originalClipboard = Object.getOwnPropertyDescriptor(
  window.Navigator.prototype,
  'clipboard',
)

function setClipboard(value: unknown) {
  Object.defineProperty(window.Navigator.prototype, 'clipboard', {
    configurable: true,
    get: () => value,
  })
}

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(window.Navigator.prototype, 'clipboard', originalClipboard)
  } else {
    Reflect.deleteProperty(window.Navigator.prototype, 'clipboard')
  }
})

describe('Contact', () => {
  it('mostra il fallback quando la Clipboard API non è disponibile', async () => {
    setClipboard(undefined)
    render(<Contact />)

    fireEvent.click(screen.getByRole('button', { name: /copia email/i }))

    expect(
      await screen.findByText(/copia manualmente: lorenzo\.melis@yahoo\.it/i),
    ).toBeInTheDocument()
  })

  it('conferma la copia quando la Clipboard API funziona', async () => {
    const written: string[] = []
    setClipboard({ writeText: (text: string) => (written.push(text), Promise.resolve()) })
    render(<Contact />)

    fireEvent.click(screen.getByRole('button', { name: /copia email/i }))

    expect(
      await screen.findByRole('button', { name: /email copiata/i }),
    ).toBeInTheDocument()
    expect(written).toEqual(['lorenzo.melis@yahoo.it'])
  })

  it('non mostra moduli di invio: solo link reali', () => {
    render(<Contact />)
    expect(document.querySelector('form')).toBeNull()
    expect(screen.getByRole('link', { name: /email/i })).toHaveAttribute(
      'href',
      'mailto:lorenzo.melis@yahoo.it',
    )
  })
})
