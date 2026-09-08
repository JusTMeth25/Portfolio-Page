import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

import type { Language } from '../data/profile'
import { LanguageProvider } from '../i18n/LanguageProvider'

const STORAGE_KEY = 'lm-lingua'

/**
 * Monta un componente dentro il provider della lingua.
 *
 * I componenti leggono i testi dal contesto, quindi in test vanno avvolti come
 * nell'app. `language` scrive la preferenza prima del montaggio, che è lo
 * stesso percorso usato dal sito.
 */
export function renderWithI18n(
  ui: ReactElement,
  { language = 'it', ...options }: RenderOptions & { language?: Language } = {},
): RenderResult {
  window.localStorage.setItem(STORAGE_KEY, language)

  function Wrapper({ children }: { children: ReactNode }) {
    return <LanguageProvider>{children}</LanguageProvider>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
