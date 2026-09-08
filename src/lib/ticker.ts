/**
 * Un solo `requestAnimationFrame` per tutti gli effetti della pagina.
 *
 * Prima ogni effetto (sfondo, equalizzatore, anello del puntatore) apriva il
 * proprio loop: tre callback per fotogramma, tre punti in cui perdere frame.
 * Qui c'è un unico loop condiviso, che si ferma da solo quando non ha iscritti
 * o quando la scheda passa in background, e riprende con il tempo "congelato",
 * così nulla salta in avanti.
 *
 * Il ciclo è pensato per non potersi bloccare: un iscritto che solleva
 * un'eccezione non interrompe il fotogramma successivo, e un battito di
 * controllo lo fa ripartire se per qualsiasi motivo la catena si spezza.
 */

type Subscriber = (time: number, delta: number) => void

/** 0 = tutto acceso, 1 = modalità risparmio (la pagina fatica). */
export type QualityLevel = 0 | 1

const subscribers = new Set<Subscriber>()
const qualityListeners = new Set<(level: QualityLevel) => void>()

let quality: QualityLevel = 0
const sample = { time: 0, frames: 0, slowSeconds: 0 }

/**
 * Sorveglianza dei fotogrammi: se per due secondi di fila la pagina resta
 * sotto i 50 fps, passa in modalità risparmio e lo comunica agli effetti, che
 * si alleggeriscono. Non si torna indietro da soli: meglio stabile che
 * altalenante.
 */
function watchFrameRate(delta: number) {
  if (quality === 1) return
  sample.time += delta
  sample.frames += 1
  if (sample.time < 1000) return

  const fps = (sample.frames / sample.time) * 1000
  sample.time = 0
  sample.frames = 0

  if (fps < 50) {
    sample.slowSeconds += 1
    if (sample.slowSeconds >= 2) {
      quality = 1
      for (const listener of qualityListeners) listener(quality)
    }
  } else {
    sample.slowSeconds = 0
  }
}

/** Livello corrente, per chi si iscrive a effetto già avviato. */
export function getQuality(): QualityLevel {
  return quality
}

/** Notifica i cambi di livello. Restituisce la disiscrizione. */
export function subscribeToQuality(
  listener: (level: QualityLevel) => void,
): () => void {
  qualityListeners.add(listener)
  return () => qualityListeners.delete(listener)
}

let frame = 0
let running = false
let lastTime = 0
/** Tempo virtuale: non avanza mentre il loop è fermo. */
let clock = 0

/** Istante dell'ultimo fotogramma eseguito, per il battito di controllo. */
let lastBeat = 0

function loop(now: number) {
  const delta = lastTime === 0 ? 16.7 : Math.min(now - lastTime, 50)
  lastTime = now
  clock += delta
  lastBeat = Date.now()

  watchFrameRate(delta)

  for (const subscriber of subscribers) {
    // Un iscritto che solleva un'eccezione non deve fermare il loop: senza
    // questo, un errore in un singolo effetto congelava tutta la pagina,
    // perché il fotogramma successivo non veniva più richiesto.
    try {
      subscriber(clock, delta)
    } catch (error) {
      console.error('Effetto interrotto, il ciclo prosegue:', error)
    }
  }

  frame = requestAnimationFrame(loop)
}

function start() {
  if (running || subscribers.size === 0) return
  if (typeof document !== 'undefined' && document.hidden) return
  running = true
  lastTime = 0
  lastBeat = Date.now()
  frame = requestAnimationFrame(loop)
}

function stop() {
  if (!running) return
  running = false
  cancelAnimationFrame(frame)
}

function onVisibilityChange() {
  if (document.hidden) stop()
  else start()
}

/**
 * Battito di controllo.
 *
 * `visibilitychange` è il segnale giusto per "scheda non visibile", ma non
 * copre tutto: se per qualsiasi motivo la catena di `requestAnimationFrame` si
 * interrompe mentre la pagina è visibile e ci sono iscritti, qui la si fa
 * ripartire. Costa un controllo ogni due secondi.
 */
function heartbeat() {
  if (typeof document === 'undefined') return
  if (document.hidden || subscribers.size === 0) return
  if (!running) {
    start()
    return
  }
  if (Date.now() - lastBeat > 1000) {
    running = false
    cancelAnimationFrame(frame)
    start()
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', onVisibilityChange)
  // Niente `blur`/`focus`: si attivano anche aprendo i DevTools o cliccando
  // la barra degli indirizzi, e il `focus` di ritorno non è garantito — era
  // un modo per restare fermi per sempre. La visibilità basta.
  window.addEventListener('pageshow', start)
  window.setInterval(heartbeat, 2000)
}

/** Iscrive una callback al loop condiviso. Restituisce la disiscrizione. */
export function subscribeToTicker(subscriber: Subscriber): () => void {
  subscribers.add(subscriber)
  start()
  return () => {
    subscribers.delete(subscriber)
    if (subscribers.size === 0) stop()
  }
}
