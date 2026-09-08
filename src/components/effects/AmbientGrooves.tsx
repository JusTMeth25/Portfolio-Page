import { useEffect, useRef } from 'react'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import './ambient-grooves.css'

/**
 * Sfondo persistente: solchi di vinile concentrici che ruotano lentamente e
 * si spostano verso il puntatore, più un pulviscolo che deriva in alto.
 *
 * Vincoli rispettati:
 * - un solo `requestAnimationFrame`, nessun `setState` sul movimento del mouse;
 * - fermo quando la tab non è visibile o quando la finestra perde il focus;
 * - DPR limitato a 1.5 e numero di solchi ridotto sugli schermi piccoli;
 * - con `prefers-reduced-motion` disegna un unico fotogramma statico;
 * - `aria-hidden`: è decorazione pura, non produce rumore per gli screen reader.
 */
export function AmbientGrooves() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return

    let width = 0
    let height = 0
    let dpr = 1
    let frame = 0
    let running = true

    // Centro dei solchi: `target` insegue il puntatore, `current` lo raggiunge
    // con un lerp morbido (niente scatti).
    const target = { x: 0.5, y: 0.42 }
    const current = { x: 0.5, y: 0.42 }

    const dust = Array.from({ length: 26 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.6 + ((index * 7) % 10) / 8,
      speed: 0.00006 + ((index * 13) % 9) / 160000,
      drift: ((index % 5) - 2) / 26000,
    }))

    function resize() {
      if (!canvas || !context) return
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(time: number) {
      if (!context) return
      const cx = current.x * width
      const cy = current.y * height
      const angle = reduced ? 0 : time * 0.000045
      const shortest = Math.min(width, height)
      const rings = width < 720 ? 16 : 26
      const gap = shortest / 12

      context.clearRect(0, 0, width, height)

      // Alone che segue il puntatore: fa "respirare" il fondo.
      const glow = context.createRadialGradient(cx, cy, 0, cx, cy, shortest * 0.9)
      glow.addColorStop(0, 'rgba(34, 211, 238, 0.055)')
      glow.addColorStop(0.45, 'rgba(33, 150, 243, 0.022)')
      glow.addColorStop(1, 'rgba(8, 14, 19, 0)')
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      // Solchi: ellissi concentriche, schiacciate come un disco visto di sbieco.
      context.save()
      context.translate(cx, cy)
      context.rotate(angle)
      context.lineWidth = 1
      for (let index = 1; index <= rings; index += 1) {
        const radius = index * gap * 0.5
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
      if (!running) return
      current.x += (target.x - current.x) * 0.045
      current.y += (target.y - current.y) * 0.045
      for (const particle of dust) {
        particle.y -= particle.speed
        particle.x += particle.drift
        if (particle.y < -0.02) particle.y = 1.02
        if (particle.x < -0.02) particle.x = 1.02
        if (particle.x > 1.02) particle.x = -0.02
      }
      draw(time)
      frame = window.requestAnimationFrame(step)
    }

    function onPointerMove(event: PointerEvent) {
      target.x = event.clientX / window.innerWidth
      target.y = event.clientY / window.innerHeight
    }

    function start() {
      if (running) return
      running = true
      frame = window.requestAnimationFrame(step)
    }

    function stop() {
      running = false
      window.cancelAnimationFrame(frame)
    }

    function onVisibility() {
      if (document.hidden) stop()
      else start()
    }

    resize()
    window.addEventListener('resize', resize)

    if (reduced) {
      running = false
      draw(0)
    } else {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('visibilitychange', onVisibility)
      window.addEventListener('blur', stop)
      window.addEventListener('focus', start)
      frame = window.requestAnimationFrame(step)
    }

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', stop)
      window.removeEventListener('focus', start)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className="ambient-grooves" aria-hidden="true" />
}
