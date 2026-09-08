import '@testing-library/jest-dom/vitest'

// jsdom non implementa matchMedia: le media query dei nostri hook devono
// comunque restituire un valore stabile durante i test.
if (!window.matchMedia) {
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

if (!window.IntersectionObserver) {
  class MockIntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly scrollMargin = ''
    readonly thresholds: ReadonlyArray<number> = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  window.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof window.IntersectionObserver
}

// jsdom non implementa il canvas 2D. Restituendo `null` esercitiamo il ramo di
// guardia dei componenti che disegnano, senza il rumore di "Not implemented".
HTMLCanvasElement.prototype.getContext = (() =>
  null) as unknown as HTMLCanvasElement['getContext']
