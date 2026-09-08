import { useEffect, useRef } from 'react'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { getQuality, subscribeToQuality, subscribeToTicker } from '../../lib/ticker'
import './ambient-grooves.css'

type AmbientGroovesProps = {
  /** Finché è `false` la scena resta ferma: durante l'intro non serve. */
  active?: boolean
}

/** Un fotogramma ogni ~33 ms: lo sfondo non ha bisogno di 60 fps. */
const FRAME_INTERVAL_MS = 33

/**
 * Risoluzione del buffer rispetto alla pagina.
 *
 * È un alone sfocato con qualche linea al 3% di opacità: disegnarlo a piena
 * risoluzione significa riempire l'intero schermo a ogni fotogramma, ed è la
 * voce di costo più alta della pagina. A 0,45× il buffer ha ~5 volte meno
 * pixel, il browser lo riscala e a occhio non cambia nulla.
 */
const BUFFER_SCALE = 0.45

/**
 * Sfondo persistente: solchi di vinile concentrici che ruotano lentamente e
 * si spostano verso il puntatore, più un pulviscolo che deriva in alto.
 *
 * Attenzione al costo: è un canvas a tutto schermo, quindi disegna a 30 fps,
 * riusa il gradiente finché il centro non cambia davvero e si appoggia al
 * ticker condiviso (che si ferma da solo con la tab in background).
 * Con `prefers-reduced-motion` disegna un unico fotogramma statico.
 */
export function AmbientGrooves({ active = true }: AmbientGroovesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return

    let width = 0
    let height = 0
    let lastFrame = -Infinity
    // In modalità risparmio si scende a ~15 fps: resta vivo, costa la metà.
    let interval = getQuality() === 1 ? FRAME_INTERVAL_MS * 2 : FRAME_INTERVAL_MS

    // Centro dei solchi: `target` insegue il puntatore, `current` lo raggiunge
    // con un lerp morbido (niente scatti).
    const target = { x: 0.5, y: 0.42 }
    const current = { x: 0.5, y: 0.42 }

    // Il gradiente si ricrea solo quando il centro si sposta davvero.
    let glow: CanvasGradient | null = null
    let glowKey = ''

    const dust = Array.from({ length: 22 }, (_, index) => ({
      x: ((index * 37) % 100) / 100,
      y: ((index * 61) % 100) / 100,
      radius: 0.6 + ((index * 7) % 10) / 8,
      speed: 0.00006 + ((index * 13) % 9) / 160000,
      drift: ((index % 5) - 2) / 26000,
    }))

    function resize() {
      if (!canvas || !context) return
      // Si disegna in coordinate CSS; è il buffer a essere più piccolo.
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.max(1, Math.round(width * BUFFER_SCALE))
      canvas.height = Math.max(1, Math.round(height * BUFFER_SCALE))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(BUFFER_SCALE, 0, 0, BUFFER_SCALE, 0, 0)
      glow = null
    }

    function draw(time: number) {
      if (!context) return
      const cx = current.x * width
      const cy = current.y * height
      const angle = reduced ? 0 : time * 0.000045
      const shortest = Math.min(width, height)
      const rings = width < 720 ? 14 : 22
      const gap = shortest / 12

      context.clearRect(0, 0, width, height)

      // Alone che segue il puntatore, ricalcolato solo quando serve.
      const key = `${Math.round(cx / 12)}:${Math.round(cy / 12)}`
      if (!glow || key !== glowKey) {
        glow = context.createRadialGradient(cx, cy, 0, cx, cy, shortest * 0.9)
        glow.addColorStop(0, 'rgba(34, 211, 238, 0.055)')
        glow.addColorStop(0.45, 'rgba(33, 150, 243, 0.022)')
        glow.addColorStop(1, 'rgba(8, 14, 19, 0)')
        glowKey = key
      }
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      // Solchi: ellissi concentriche, schiacciate come un disco visto di sbieco.
      context.save()
      context.translate(cx, cy)
      context.rotate(angle)
      context.lineWidth = 1
      for (let index = 1; index <= rings; index += 1) {
        const radius = index * gap * 0.58
        const fade = 1 - index / (rings + 3)
        // Un solco ogni cinque è più marcato: dà ritmo, come le tracce di un LP.
        const accent = index % 5 === 0
        context.strokeStyle = accent
          ? `rgba(34, 211, 238, ${(0.055 * fade).toFixed(4)})`
          : `rgba(167, 186, 201, ${(0.028 * fade).toFixed(4)})`
        context.beginPath()
        context.ellipse(0, 0, radius, radius * 0.46, 0, 0, Math.PI * 2)
        context.stroke()
      }
      context.restore()

      // Pulviscolo.
      context.fillStyle = 'rgba(196, 211, 222, 0.16)'
      for (const particle of dust) {
        const px = (particle.x + (current.x - 0.5) * 0.04) * width
        const py = particle.y * height
        context.beginPath()
        context.arc(px, py, particle.radius, 0, Math.PI * 2)
        context.fill()
      }
    }

    function step(time: number) {
      current.x += (target.x - current.x) * 0.05
      current.y += (target.y - current.y) * 0.05
      for (const particle of dust) {
        particle.y -= particle.speed
        particle.x += particle.drift
        if (particle.y < -0.02) particle.y = 1.02
        if (particle.x < -0.02) particle.x = 1.02
        if (particle.x > 1.02) particle.x = -0.02
      }
      if (time - lastFrame < interval) return
      lastFrame = time
      draw(time)
    }

    function onPointerMove(event: PointerEvent) {
      target.x = event.clientX / window.innerWidth
      target.y = event.clientY / window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    if (reduced || !active) {
      draw(0)
      return () => window.removeEventListener('resize', resize)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    const unsubscribe = subscribeToTicker(step)
    const unsubscribeQuality = subscribeToQuality((level) => {
      interval = level === 1 ? FRAME_INTERVAL_MS * 2 : FRAME_INTERVAL_MS
    })

    return () => {
      unsubscribe()
      unsubscribeQuality()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [reduced, active])

  return <canvas ref={canvasRef} className="ambient-grooves" aria-hidden="true" />
}
