/**
 * Al ricaricamento la pagina riparte dalla hero.
 *
 * Di suo il browser rimette lo scroll dov'era (`history.scrollRestoration` vale
 * `'auto'`): su un sito a pagina unica significa ritrovarsi a metà pagina dopo
 * un refresh, senza capire perché. Con `'manual'` il ripristino non avviene e
 * si riparte dall'inizio.
 *
 * Le ancore continuano a funzionare: `#progetti` non è un ripristino di
 * posizione ma una navigazione, e il browser la gestisce comunque. Per questo
 * si riporta in cima solo quando nell'indirizzo non c'è un'ancora.
 */
export function startAtTop(): void {
  if (typeof window === 'undefined') return

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }

  if (window.location.hash) return

  window.scrollTo(0, 0)
  // Il ripristino del browser può arrivare dopo l'esecuzione di questo modulo:
  // una seconda passata a caricamento completato chiude il caso.
  window.addEventListener(
    'load',
    () => {
      if (!window.location.hash) window.scrollTo(0, 0)
    },
    { once: true },
  )
}
