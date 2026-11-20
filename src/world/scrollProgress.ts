/**
 * Avanzamento lungo il solco, letto dallo scroll della pagina.
 *
 * Ogni stazione è una sezione HTML alta più di uno schermo. Finché la sezione
 * copre tutto il viewport la telecamera resta ferma sulla stazione (il testo è
 * "sticky" e si legge con calma); nell'ultimo schermo della sezione la
 * telecamera vola verso la stazione successiva.
 *
 * Il risultato è un numero continuo: 0 = hero, 1 = progetti, 2.5 = a metà
 * strada fra profilo e percorso, e così via.
 */

let sections: HTMLElement[] = []

/** Registrate da `WorldSite`, nell'ordine del solco. */
export function registerSections(list: HTMLElement[]): void {
  sections = list
}

export function readProgress(): number {
  if (sections.length === 0 || typeof window === 'undefined') return 0
  const viewport = window.innerHeight
  const y = window.scrollY
  const last = sections.length - 1

  for (let index = last; index >= 0; index -= 1) {
    const section = sections[index]!
    const top = section.getBoundingClientRect().top + y
    if (y + 1 < top && index > 0) continue
    if (index === last) return last
    const height = section.offsetHeight
    const hold = Math.max(0, height - viewport)
    const local = y - top
    if (local <= hold) return index
    return index + Math.min(1, (local - hold) / Math.max(1, viewport))
  }
  return 0
}

/** Quanto è "a fuoco" la stazione `index` (1 = ferma lì, 0 = lontana). */
export function focusOf(progress: number, index: number): number {
  return Math.max(0, 1 - Math.abs(progress - index) * 1.8)
}
