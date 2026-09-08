import { useCallback, useRef, type ReactNode } from 'react'

import { useMediaQuery } from '../../hooks/useMediaQuery'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import './spotlight-card.css'

type SpotlightCardProps = {
  children: ReactNode
  className?: string
  /** Inclinazione massima in gradi; 0 disattiva il tilt. */
  tilt?: number
}

/**
 * Card con spotlight ciano che segue il puntatore e tilt minimo.
 *
 * L'effetto scrive direttamente su custom property CSS in un
 * `requestAnimationFrame`: nessun setState a ogni movimento del mouse.
 * Si attiva solo con puntatore preciso e movimento non ridotto.
 */
export function SpotlightCard({
  children,
  className,
  tilt = 3,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduced = usePrefersReducedMotion()
  const enabled = finePointer && !reduced

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        node.style.setProperty('--spot-x', `${x}px`)
        node.style.setProperty('--spot-y', `${y}px`)
        if (tilt > 0) {
          const rx = ((y / rect.height) * 2 - 1) * -tilt
          const ry = ((x / rect.width) * 2 - 1) * tilt
          node.style.setProperty('--tilt-x', `${rx.toFixed(2)}deg`)
          node.style.setProperty('--tilt-y', `${ry.toFixed(2)}deg`)
        }
      })
    },
    [enabled, tilt],
  )

  const handleLeave = useCallback(() => {
    cancelAnimationFrame(frame.current)
    const node = ref.current
    if (!node) return
    node.style.setProperty('--tilt-x', '0deg')
    node.style.setProperty('--tilt-y', '0deg')
    node.style.removeProperty('--spot-opacity')
  }, [])

  const handleEnter = useCallback(() => {
    if (!enabled) return
    ref.current?.style.setProperty('--spot-opacity', '1')
  }, [enabled])

  return (
    <div
      ref={ref}
      className={['spotlight-card', className].filter(Boolean).join(' ')}
      data-interactive={enabled ? 'true' : 'false'}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <span className="spotlight-card__glow" aria-hidden="true" />
      <div className="spotlight-card__content">{children}</div>
    </div>
  )
}
