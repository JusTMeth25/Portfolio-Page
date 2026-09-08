/**
 * Motore della sequenza d'apertura, su canvas 2D.
 *
 * Canvas 2D e non WebGL per un motivo preciso: l'intro è la prima cosa che si
 * vede, e caricare Three.js prima del primo fotogramma costerebbe ~880 kB.
 * Qui il costo è zero: nessuna dipendenza, nessun asset.
 *
 * La scena è una sola: un disco in vinile che si apre da una linea di luce,
 * gira, viene raggiunto dalla puntina e infine passa oltre la camera.
 */

export const INTRO_DURATION_MS = 3400

const CYAN = '34, 211, 238'
const BLUE = '33, 150, 243'
const PAPER = '243, 242, 237'

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/** Progresso di una fase, 0…1, a partire dal progresso globale. */
function phase(progress: number, start: number, end: number) {
  return clamp01((progress - start) / (end - start))
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const easeInCubic = (t: number) => t ** 3
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t))
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2

type Particle = {
  angle: number
  distance: number
  speed: number
  size: number
  life: number
}

export type IntroScene = {
  /** Disegna il fotogramma corrispondente al tempo trascorso, in ms. */
  render: (elapsed: number) => void
  resize: () => void
  /** Progresso 0…1 dell'ultimo fotogramma disegnato. */
  progress: () => number
}

export function createIntroScene(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
): IntroScene {
  let width = 0
  let height = 0
  let lastProgress = 0

  const particles: Particle[] = Array.from({ length: 90 }, (_, index) => ({
    angle: (index / 90) * Math.PI * 2 + Math.random() * 0.4,
    distance: 0.04 + Math.random() * 0.06,
    speed: 0.35 + Math.random() * 1.15,
    size: 0.6 + Math.random() * 1.9,
    life: 0.55 + Math.random() * 0.45,
  }))

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  /** Solchi del disco: ellissi concentriche con un accento ogni cinque. */
  function drawGrooves(radius: number, squash: number, alpha: number) {
    const rings = 46
    context.lineWidth = 1
    for (let index = 1; index <= rings; index += 1) {
      const ratio = index / rings
      const r = radius * (0.3 + ratio * 0.7)
      const accent = index % 5 === 0
      const fade = (1 - ratio * 0.55) * alpha
      context.strokeStyle = accent
        ? `rgba(${CYAN}, ${(0.3 * fade).toFixed(4)})`
        : `rgba(${PAPER}, ${(0.09 * fade).toFixed(4)})`
      context.beginPath()
      context.ellipse(0, 0, r, r * squash, 0, 0, Math.PI * 2)
      context.stroke()
    }
  }

  /**
   * Due orbite inclinate attorno al disco: sono la parte "volumetrica" della
   * scena, quella che dà profondità al fotogramma.
   */
  function drawOrbits(radius: number, angle: number, alpha: number) {
    const orbits = [
      { scale: 1.34, squash: 0.72, tilt: angle * 0.5, color: CYAN, opacity: 0.4 },
      { scale: 1.16, squash: 0.28, tilt: -angle * 0.32, color: BLUE, opacity: 0.32 },
    ]
    for (const orbit of orbits) {
      context.save()
      context.rotate(orbit.tilt)
      const r = radius * orbit.scale
      const gradient = context.createLinearGradient(-r, 0, r, 0)
      gradient.addColorStop(0, `rgba(${orbit.color}, 0)`)
      gradient.addColorStop(
        0.5,
        `rgba(${orbit.color}, ${(orbit.opacity * alpha).toFixed(4)})`,
      )
      gradient.addColorStop(1, `rgba(${orbit.color}, 0)`)
      context.strokeStyle = gradient
      context.lineWidth = 1.4
      context.beginPath()
      context.ellipse(0, 0, r, r * orbit.squash, 0, 0, Math.PI * 2)
      context.stroke()
      context.restore()
    }
  }

  /** Riflesso che scorre lungo il bordo del disco, come una luce radente. */
  function drawRim(
    radius: number,
    squash: number,
    angle: number,
    alpha: number,
  ) {
    const sweep = Math.PI * 0.55
    const start = angle % (Math.PI * 2)
    const midX = Math.cos(start + sweep / 2) * radius
    const midY = Math.sin(start + sweep / 2) * radius * squash
    const gradient = context.createRadialGradient(midX, midY, 0, midX, midY, radius)
    gradient.addColorStop(0, `rgba(${PAPER}, ${(0.8 * alpha).toFixed(4)})`)
    gradient.addColorStop(0.4, `rgba(${CYAN}, ${(0.45 * alpha).toFixed(4)})`)
    gradient.addColorStop(1, `rgba(${CYAN}, 0)`)
    context.strokeStyle = gradient
    context.lineWidth = 2.4
    context.beginPath()
    context.ellipse(0, 0, radius, radius * squash, 0, start, start + sweep)
    context.stroke()
  }

  function render(elapsed: number) {
    const progress = clamp01(elapsed / INTRO_DURATION_MS)
    lastProgress = progress

    const cx = width / 2
    const cy = height / 2
    const base = Math.min(width, height)

    context.clearRect(0, 0, width, height)

    // Fondo: il vuoto si schiarisce appena attorno al disco.
    const backdrop = context.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      base * 0.95,
    )
    const warmth = phase(progress, 0.05, 0.6)
    backdrop.addColorStop(0, `rgba(${CYAN}, ${(0.07 * warmth).toFixed(4)})`)
    backdrop.addColorStop(0.5, `rgba(${BLUE}, ${(0.03 * warmth).toFixed(4)})`)
    backdrop.addColorStop(1, 'rgba(8, 14, 19, 0)')
    context.fillStyle = backdrop
    context.fillRect(0, 0, width, height)

    // --- Fase 1: la fessura di luce ---------------------------------------
    const seam = phase(progress, 0, 0.2)
    if (seam < 1) {
      const seamWidth = base * 0.62 * easeOutExpo(seam)
      const seamAlpha = seam < 0.85 ? 1 : 1 - (seam - 0.85) / 0.15
      context.save()
      context.shadowBlur = 26
      context.shadowColor = `rgba(${CYAN}, 0.9)`
      context.fillStyle = `rgba(${PAPER}, ${(0.9 * seamAlpha).toFixed(4)})`
      context.fillRect(cx - seamWidth / 2, cy - 1, seamWidth, 2)
      context.restore()
    }

    // --- Fase 2: il disco si apre e si avvicina ---------------------------
    const open = phase(progress, 0.1, 0.52)
    const dolly = phase(progress, 0.7, 1)
    // La scala esplode alla fine: il disco supera la camera.
    const scale = (0.42 + easeOutCubic(open) * 0.58) * (1 + easeInCubic(dolly) * 7)
    const radius = base * 0.34 * scale
    // Apertura prospettica: da linea (squash 0) a disco inclinato.
    const squash = 0.06 + easeInOutCubic(open) * 0.5
    const discAlpha = 1 - phase(progress, 0.95, 1)

    if (open > 0 && discAlpha > 0) {
      context.save()
      context.translate(cx, cy)
      context.globalAlpha = discAlpha

      // Spessore del disco: una seconda ellisse sotto, per dare volume.
      context.fillStyle = 'rgba(4, 8, 11, 0.95)'
      context.beginPath()
      context.ellipse(
        0,
        radius * 0.028,
        radius,
        radius * squash,
        0,
        0,
        Math.PI * 2,
      )
      context.fill()

      // Corpo del disco.
      const body = context.createRadialGradient(
        -radius * 0.25,
        -radius * squash * 0.5,
        radius * 0.05,
        0,
        0,
        radius,
      )
      body.addColorStop(0, 'rgba(24, 36, 45, 1)')
      body.addColorStop(0.6, 'rgba(10, 16, 21, 1)')
      body.addColorStop(1, 'rgba(6, 10, 14, 1)')
      context.fillStyle = body
      context.beginPath()
      context.ellipse(0, 0, radius, radius * squash, 0, 0, Math.PI * 2)
      context.fill()

      // Rotazione: parte velocissima e rallenta, come un piatto che si avvia.
      const spin = easeOutExpo(clamp01(progress / 0.75)) * Math.PI * 7

      drawGrooves(radius, squash, 1)
      drawRim(radius, squash, spin, 1)
      drawOrbits(radius, spin, 1 - dolly)

      // Etichetta centrale con il foro del perno.
      const labelRadius = radius * 0.24
      context.fillStyle = `rgba(${CYAN}, 0.92)`
      context.beginPath()
      context.ellipse(
        0,
        0,
        labelRadius,
        labelRadius * squash,
        0,
        0,
        Math.PI * 2,
      )
      context.fill()
      context.fillStyle = 'rgba(6, 34, 42, 1)'
      context.beginPath()
      context.ellipse(
        0,
        0,
        labelRadius * 0.12,
        labelRadius * 0.12 * squash,
        0,
        0,
        Math.PI * 2,
      )
      context.fill()

      // Riferimento che orbita sul bordo: rende leggibile la rotazione.
      const markerAngle = spin
      context.fillStyle = `rgba(${PAPER}, 0.85)`
      context.beginPath()
      context.arc(
        Math.cos(markerAngle) * radius * 0.82,
        Math.sin(markerAngle) * radius * squash * 0.82,
        Math.max(1.5, radius * 0.008),
        0,
        Math.PI * 2,
      )
      context.fill()

      context.restore()
    }

    // --- Fase 3: la puntina scende sul solco esterno -----------------------
    const arm = phase(progress, 0.28, 0.6)
    const armAlpha = (1 - phase(progress, 0.68, 0.82)) * Math.min(1, arm * 3)
    if (armAlpha > 0) {
      // Raggio del disco prima del dolly: il braccio non insegue la camera.
      const discRadius = base * 0.34 * (0.42 + easeOutCubic(open) * 0.58)
      const pivotX = cx + discRadius * 1.28
      const pivotY = cy - discRadius * 0.92

      // Punto di appoggio sul bordo del disco, a ore 1.
      const landingAngle = -Math.PI / 3.4
      const landX = cx + Math.cos(landingAngle) * discRadius * 0.88
      const landY = cy + Math.sin(landingAngle) * discRadius * squash * 0.88

      const length = Math.hypot(landX - pivotX, landY - pivotY)
      const landedAngle = Math.atan2(landY - pivotY, landX - pivotX)
      // Parte sollevato e ruota fino alla posa finale: lunghezza costante.
      const angle = landedAngle - 0.5 + easeOutCubic(arm) * 0.5
      const tipX = pivotX + Math.cos(angle) * length
      const tipY = pivotY + Math.sin(angle) * length

      context.save()
      context.globalAlpha = armAlpha
      context.strokeStyle = `rgba(${PAPER}, 0.5)`
      context.lineWidth = Math.max(2, base * 0.0035)
      context.lineCap = 'round'
      context.beginPath()
      context.moveTo(pivotX, pivotY)
      context.lineTo(tipX, tipY)
      context.stroke()

      // Perno.
      context.fillStyle = 'rgba(16, 25, 32, 1)'
      context.strokeStyle = `rgba(${PAPER}, 0.35)`
      context.lineWidth = 1
      context.beginPath()
      context.arc(pivotX, pivotY, base * 0.014, 0, Math.PI * 2)
      context.fill()
      context.stroke()

      // Testina: si accende quando tocca il solco.
      const contact = easeOutCubic(arm)
      context.fillStyle = `rgba(${CYAN}, 1)`
      context.shadowBlur = 10 + 22 * contact
      context.shadowColor = `rgba(${CYAN}, ${(0.4 + 0.5 * contact).toFixed(3)})`
      context.beginPath()
      context.arc(tipX, tipY, base * 0.007, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }

    // --- Fase 4: polvere sollevata dalla puntina ---------------------------
    const burst = phase(progress, 0.34, 1)
    if (burst > 0) {
      context.save()
      context.translate(cx, cy)
      for (const particle of particles) {
        const life = clamp01(burst / particle.life)
        if (life <= 0) continue
        const distance =
          base * (particle.distance + easeOutCubic(life) * particle.speed)
        const x = Math.cos(particle.angle) * distance
        const y = Math.sin(particle.angle) * distance * 0.55
        const alpha = (1 - life) * 0.55
        context.fillStyle =
          particle.size > 1.6
            ? `rgba(${CYAN}, ${alpha.toFixed(4)})`
            : `rgba(${PAPER}, ${(alpha * 0.8).toFixed(4)})`
        context.beginPath()
        context.arc(x, y, particle.size, 0, Math.PI * 2)
        context.fill()
      }
      context.restore()
    }

    // --- Fase 5: si entra nel foro del perno -------------------------------
    // Il foro si allarga fino a coprire il fotogramma: la sensazione è di
    // attraversare il disco, non di guardarlo sparire.
    if (dolly > 0) {
      const hole = base * 0.34 * 0.24 * 0.12 * (1 + easeInCubic(dolly) * 260)
      const halo = hole * 1.25
      const ring = context.createRadialGradient(cx, cy, hole, cx, cy, halo)
      ring.addColorStop(0, `rgba(${CYAN}, ${(0.35 * (1 - dolly)).toFixed(4)})`)
      ring.addColorStop(1, `rgba(${CYAN}, 0)`)
      context.fillStyle = ring
      context.beginPath()
      context.ellipse(cx, cy, halo, halo * 0.62, 0, 0, Math.PI * 2)
      context.fill()

      context.fillStyle = 'rgba(8, 14, 19, 1)'
      context.beginPath()
      context.ellipse(cx, cy, hole, hole * 0.62, 0, 0, Math.PI * 2)
      context.fill()
    }

    // Bagliore finale: una sola campana di luminosità, mai un lampeggio.
    // È un bloom radiale, non un riempimento piatto: l'ultimo fotogramma
    // conserva una forma invece di diventare un rettangolo grigio.
    const flash = phase(progress, 0.84, 0.98)
    if (flash > 0 && flash < 1) {
      const intensity = Math.sin(flash * Math.PI) * 0.22
      const bloom = context.createRadialGradient(cx, cy, 0, cx, cy, base * 0.75)
      bloom.addColorStop(0, `rgba(${PAPER}, ${intensity.toFixed(4)})`)
      bloom.addColorStop(0.45, `rgba(${CYAN}, ${(intensity * 0.45).toFixed(4)})`)
      bloom.addColorStop(1, `rgba(${CYAN}, 0)`)
      context.fillStyle = bloom
      context.fillRect(0, 0, width, height)
    }
  }

  resize()

  return { render, resize, progress: () => lastProgress }
}
