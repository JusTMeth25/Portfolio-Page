/**
 * Risolve un percorso relativo a `public/` rispetto alla base path di Vite.
 *
 * `import.meta.env.BASE_URL` vale "/" per il user site e "/NOME-REPO/" per il
 * project site di GitHub Pages: usando sempre questa funzione gli asset
 * funzionano in entrambi i casi, senza percorsi assoluti dalla root.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
