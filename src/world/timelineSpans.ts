import type { TimelineEntry } from '../data/profile'

/**
 * Inizio e fine di ogni tappa in anni decimali (2019.33 = maggio 2019), per il
 * diagramma di Gantt. Uguali in tutte le lingue, quindi stanno qui e non nei
 * file di traduzione. Una tappa nuova senza voce qui viene letta dagli anni
 * scritti nel periodo, così il grafico non si rompe.
 */
const SPANS: Record<string, readonly [number, number]> = {
  elis: [2018, 2019],
  cybertech: [2019 + 4 / 12, 2025],
  mercatorum: [2023, 2026],
  protiviti: [2025, 2026 + 4 / 12],
  epicode: [2026 + 4 / 12, 2026 + 10 / 12],
}

export function timelineSpan(entry: TimelineEntry): { start: number; end: number } {
  const known = SPANS[entry.id]
  if (known) return { start: known[0], end: known[1] }
  const years = (entry.period.match(/\d{4}/g) ?? []).map(Number)
  const start = years[0] ?? new Date().getFullYear()
  const end = years[1] ?? (entry.current ? new Date().getFullYear() + 0.5 : start + 1)
  return { start, end: Math.max(end, start + 0.25) }
}
