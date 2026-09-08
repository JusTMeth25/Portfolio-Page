import { useEffect, useRef } from 'react'

import { useMediaQuery } from '../../hooks/useMediaQuery'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { subscribeToTicker } from '../../lib/ticker'
import './cursor.css'

/** Elementi su cui compare la manina. */
const INTERACTIVE =
  'a, button, [role="button"], input, select, textarea, summary, label[for]'

/**
 * Cursore del sito: sostituisce del tutto la freccia di sistema.
 *
 * Tre pezzi, con tracciamenti diversi:
 * - il **punto** sta esattamente sul puntatore, così mirare resta preciso;
 * - l'**anello** insegue con un ritardo morbido, ed è la parte che dà caratterr;
 * - la **manina** prende il posto degli altri due sugli elementi cliccabili.
 *
 * La freccia di sistema viene nascosta solo quando questo componente è montato
 * davvero (`html.has-custom-cursor`): su touch, senza puntatore preciso o con
 * `prefers-reduced-motion` non viene montato e il cursore resta quello del
 * sistema operativo. Se lo script non parte, la classe non viene mai aggiunta
 * e la pagina resta usabile con il cursore normale.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const handRef = useRef<HTMLSpanElement>(null)

  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduced = usePrefersReducedMotion()
  const enabled = finePointer && !reduced

  // La freccia di sistema sparisce solo se il cursore custom è di scena.
  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.classList.add('has-custom-cursor')
    return () => root.classList.remove('has-custom-cursor')
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const container = rootRef.current
    const ring = ringRef.current
    const dot = dotRef.current
    const hand = handRef.current
    if (!container || !ring || !dot || !hand) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const trailing = { ...target }
    let visible = false

    function step() {
      // L'anello arriva con un attimo di ritardo; punto e manina no.
      trailing.x += (target.x - trailing.x) * 0.2
      trailing.y += (target.y - trailing.y) * 0.2
      ring!.style.transform = `translate3d(${trailing.x}px, ${trailing.y}px, 0) translate(-50%, -50%)`
      dot!.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
      // La manina ha il punto sensibile sulla punta del dito, non al centro.
      hand!.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-38%, -8%)`
    }

    function onMove(event: PointerEvent) {
      target.x = event.clientX
      target.y = event.clientY
      if (!visible) {
        visible = true
        container!.setAttribute('data-visible', 'true')
      }
      const interactive = (event.target as Element | null)?.closest?.(INTERACTIVE)
      container!.setAttribute('data-active', interactive ? 'true' : 'false')
    }

    function onLeave() {
      visible = false
      container!.setAttribute('data-visible', 'false')
    }

    // Il click dà un ritorno immediato, senza aspettare il fotogramma.
    function onDown() {
      container!.setAttribute('data-pressed', 'true')
    }
    function onUp() {
      container!.setAttribute('data-pressed', 'false')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    const unsubscribe = subscribeToTicker(step)

    return () => {
      unsubscribe()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={rootRef} className="cursor" aria-hidden="true">
      <span ref={ringRef} className="cursor__ring" />
      <span ref={dotRef} className="cursor__dot" />
      <span ref={handRef} className="cursor__hand">
        {/*
          Manina "seleziona collegamento": indice teso, le altre dita chiuse.
          Due tracciati sullo stesso profilo: prima un alone chiaro, poi la
          mano ciano con contorno scuro. Così si legge sia sul fondo scuro sia
          sui pulsanti ciano, dove una mano ciano sparirebbe.
        */}
        <svg viewBox="0 0 22 28" width="21" height="27" focusable="false">
          <defs>
            <path
              id="lm-hand"
              d="M6.4 16.5V4.2a2 2 0 0 1 4 0V11a1.75 1.75 0 0 1 3.5 0v1.4a1.65 1.65 0 0 1 3.3 0v1.2a1.5 1.5 0 0 1 3 0V20c0 4-2.6 6.6-6.6 6.6h-2.2c-2.4 0-3.7-.9-4.8-2.8L2.1 19.2a1.9 1.9 0 0 1 3.1-2.2z"
            />
          </defs>
          <use href="#lm-hand" fill="none" stroke="#f3f2ed" strokeWidth="4" strokeLinejoin="round" />
          <use href="#lm-hand" fill="currentColor" stroke="#06222a" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  )
}
