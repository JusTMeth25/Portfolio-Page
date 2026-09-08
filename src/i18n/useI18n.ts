import { useContext } from 'react'

import { LanguageContext, type LanguageContextValue } from './LanguageProvider'

/**
 * Lingua corrente, testi tradotti e progetti già nella lingua giusta.
 *
 * Va usato dentro `<LanguageProvider>`: se manca è un errore di montaggio, non
 * una condizione da gestire a runtime, quindi si solleva subito.
 */
export function useI18n(): LanguageContextValue {
  const value = useContext(LanguageContext)
  if (!value) {
    throw new Error('useI18n richiede <LanguageProvider> più in alto nell’albero')
  }
  return value
}
