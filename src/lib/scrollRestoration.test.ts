import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { startAtTop } from './scrollRestoration'

const originalHash = window.location.hash

beforeEach(() => {
  window.history.scrollRestoration = 'auto'
  window.location.hash = ''
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  window.location.hash = originalHash
})

describe('startAtTop', () => {
  it('disattiva il ripristino dello scroll del browser', () => {
    startAtTop()
    expect(window.history.scrollRestoration).toBe('manual')
  })

  it('riporta in cima quando non c’è un’ancora', () => {
    startAtTop()
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('lascia stare lo scroll se l’indirizzo ha un’ancora', () => {
    window.location.hash = '#progetti'
    startAtTop()
    // Il ripristino resta disattivato, ma la posizione la decide l'ancora.
    expect(window.history.scrollRestoration).toBe('manual')
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})
