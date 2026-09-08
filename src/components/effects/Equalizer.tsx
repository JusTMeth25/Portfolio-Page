import { useEffect, useRef } from 'react'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { subscribeToTicker } from '../../lib/ticker'
import './equalizer.css'

type EqualizerProps = {
  bars?: number
  /** Testo alternativo per chi non vede la decorazione. */
  label?: string
}

/**
 * Barre da equalizzatore sempre in movimento: onda lenta di base, più una
 * gobba che segue il puntatore (le barre vicine al cursore si alzano).
 *
 * Le altezze si scrivono in `scaleY` dentro un `requestAnimationFrame`:
 * nessun re-render di React durante il movimento del mouse.
 * Con `prefers-reduced-motion` le barre restano ferme su un profilo statico.
 */
export function Equalizer({ bars = 22, label }: EqualizerProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const items = Array.from(list.children) as HTMLElement[]

    if (reduced) {
      items.forEach((item, index) => {
        const height = 0.35 + Math.abs(Math.sin(index * 0.7)) * 0.45
        item.style.transform = `scaleY(${height.toFixed(3)})`
      })
      return
    }

    // Posizione orizzontale del puntatore rispetto alle barre, 0…1.
    let pointer = 0.5
    let pointerStrength = 0
    // Fuori dal viewport non si disegna: le barre in fondo alla pagina non
    // devono costare fotogrammi mentre si guarda la hero.
    let onScreen = true
    let lastFrame = -Infinity

    function step(time: number) {
      if (!onScreen) return
      // ~40 fps: sono barre, non un gioco.
      if (time - lastFrame < 25) return
      lastFrame = time
      const t = time * 0.0016
      items.forEach((item, index) => {
        const ratio = items.length > 1 ? index / (items.length - 1) : 0
        // Onda di base: due sinusoidi sfasate, così non sembra un metronomo.
        const wave =
          0.42 +
          Math.sin(t + index * 0.55) * 0.16 +
          Math.sin(t * 0.63 + index * 0.21) * 0.1
        // Gobba gaussiana centrata sul puntatore.
        const distance = Math.abs(ratio - pointer)
        const bump = Math.exp(-(distance * distance) / 0.012) * pointerStrength
        const height = Math.min(1, Math.max(0.16, wave + bump * 0.55))
        item.style.transform = `scaleY(${height.toFixed(3)})`
      })
      pointerStrength += (0 - pointerStrength) * 0.02
    }

    function onPointerMove(event: PointerEvent) {
      const rect = list?.getBoundingClientRect()
      if (!rect || rect.width === 0) return
      pointer = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      // Più il puntatore è vicino in verticale, più le barre reagiscono.
      const dy = Math.abs(event.clientY - (rect.top + rect.height / 2))
      pointerStrength = Math.max(0, 1 - dy / 320)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    const unsubscribe = subscribeToTicker(step)

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              onScreen = Boolean(entry?.isIntersecting)
            },
            { rootMargin: '120px' },
          )
    if (observer && list) observer.observe(list)

    return () => {
      unsubscribe()
      observer?.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [reduced, bars])

  return (
    <ul
      ref={listRef}
      className="equalizer"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {Array.from({ length: bars }, (_, index) => (
        <li key={index} className="equalizer__bar" />
      ))}
    </ul>
  )
}
