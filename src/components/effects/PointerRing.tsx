import { useEffect, useRef } from 'react'

import { useMediaQuery } from '../../hooks/useMediaQuery'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import './pointer-ring.css'

/**
 * Anello che insegue il puntatore, come la puntina su un disco.
 *
 * Si attiva solo con puntatore preciso e movimento non ridotto: su touch e con
 * `prefers-reduced-motion` non viene nemmeno montato. Non sostituisce il
 * cursore di sistema (che resta visibile) e non intercetta i click.
 */
export function PointerRing() {
  const ringRef = useRef<HTMLDivElement>(null)
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduced = usePrefersReducedMotion()
  const enabled = finePointer && !reduced

  useEffect(() => {
    if (!enabled) return
    const ring = ringRef.current
    if (!ring) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const current = { ...target }
    let frame = 0
    let visible = false

    function step() {
      if (!ring) return
      current.x += (target.x - current.x) * 0.16
      current.y += (target.y - current.y) * 0.16
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`
      frame = window.requestAnimationFrame(step)
    }

    function onMove(event: PointerEvent) {
      target.x = event.clientX
      target.y = event.clientY
      if (!visible) {
        visible = true
        ring?.setAttribute('data-visible', 'true')
      }
      // L'anello si allarga sugli elementi interattivi.
      const interactive = (event.target as Element | null)?.closest?.(
        'a, button, [role="button"], input, summary',
      )
      ring?.setAttribute('data-active', interactive ? 'true' : 'false')
    }

    function onLeave() {
      visible = false
      ring?.setAttribute('data-visible', 'false')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    frame = window.requestAnimationFrame(step)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return <div ref={ringRef} className="pointer-ring" aria-hidden="true" />
}
