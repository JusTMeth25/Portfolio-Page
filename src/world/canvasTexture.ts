/**
 * Texture disegnate con il canvas 2D: è così che testi, grafici e dashboard
 * finiscono dentro la scena Three.js, senza font 3D né librerie extra.
 */

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

export const COLORS = {
  bg: '#080e13',
  surface: '#101920',
  surface2: '#142029',
  text: '#f3f2ed',
  muted: '#a7bac9',
  mutedStrong: '#c4d3de',
  cyan: '#22d3ee',
  blue: '#2196f3',
  ink: '#06222a',
  border: '#2a414f',
  borderSoft: '#1d2f3a',
  amber: '#f0b429',
  magenta: '#f472b6',
  violet: '#a78bfa',
} as const

export const SANS = '"Inter Variable", Inter, system-ui, "Segoe UI", sans-serif'
export const MONO = 'ui-monospace, "Cascadia Mono", "JetBrains Mono", Consolas, monospace'

export type Draw = (context: CanvasRenderingContext2D, width: number, height: number) => void

export function createCanvasTexture(
  width: number,
  height: number,
  draw: Draw,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  paint(texture, draw)
  return texture
}

function paint(texture: THREE.CanvasTexture, draw: Draw) {
  const canvas = texture.image as HTMLCanvasElement
  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, canvas.width, canvas.height)
  draw(context, canvas.width, canvas.height)
  texture.needsUpdate = true
}

/**
 * Texture React-friendly: si ridisegna quando cambiano le dipendenze (es. la
 * lingua) e una volta ancora quando il font Inter è pronto, altrimenti il primo
 * disegno userebbe il font di sistema.
 */
export function useCanvasTexture(
  width: number,
  height: number,
  draw: Draw,
  deps: unknown[],
): THREE.CanvasTexture {
  // Le dipendenze arrivano da chi chiama, come in useEffect: la chiave le
  // riassume in un valore solo, così useMemo resta con un array letterale.
  const key = depsKey(deps)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const texture = useMemo(() => createCanvasTexture(width, height, draw), [width, height, key])

  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) paint(texture, draw)
    })
    return () => {
      cancelled = true
      texture.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture])

  return texture
}

/**
 * Chiave testuale delle dipendenze: cambia solo quando cambia il loro
 * contenuto. Sono testi e piccoli elenchi, quindi serializzarli costa poco.
 */
function depsKey(deps: unknown[]): string {
  return deps.map((value) => (typeof value === 'object' ? JSON.stringify(value) : String(value))).join('|')
}

/* -------------------------------------------------------------- disegno */

export function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + r, y)
  context.arcTo(x + width, y, x + width, y + height, r)
  context.arcTo(x + width, y + height, x, y + height, r)
  context.arcTo(x, y + height, x, y, r)
  context.arcTo(x, y, x + width, y, r)
  context.closePath()
}

/** Fondo "vetro scuro" comune a tutti i pannelli. */
export function panelBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: { accent?: string; radius?: number; alpha?: number } = {},
): void {
  const { accent = COLORS.cyan, radius = 36, alpha = 0.86 } = options
  const inset = 4
  roundRect(context, inset, inset, width - inset * 2, height - inset * 2, radius)
  const gradient = context.createLinearGradient(0, 0, width * 0.4, height)
  gradient.addColorStop(0, `rgba(20, 32, 41, ${alpha})`)
  gradient.addColorStop(1, `rgba(8, 14, 19, ${alpha})`)
  context.fillStyle = gradient
  context.fill()
  context.lineWidth = 3
  context.strokeStyle = COLORS.border
  context.stroke()

  // Filo di luce in alto, come il riflesso su un vetro.
  context.save()
  context.clip()
  const shine = context.createLinearGradient(0, 0, width, 0)
  shine.addColorStop(0, 'rgba(34, 211, 238, 0)')
  shine.addColorStop(0.5, accent)
  shine.addColorStop(1, 'rgba(34, 211, 238, 0)')
  context.fillStyle = shine
  context.globalAlpha = 0.8
  context.fillRect(0, inset, width, 4)
  context.restore()
}

/** Testo a capo automatico; restituisce la y sotto l'ultima riga. */
export function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = Infinity,
): number {
  const words = text.split(/\s+/)
  let line = ''
  let lines = 0
  for (let index = 0; index < words.length; index += 1) {
    const candidate = line ? `${line} ${words[index]}` : words[index]!
    if (context.measureText(candidate).width > maxWidth && line) {
      if (lines === maxLines - 1) {
        context.fillText(`${line}…`, x, y)
        return y + lineHeight
      }
      context.fillText(line, x, y)
      line = words[index]!
      y += lineHeight
      lines += 1
    } else {
      line = candidate
    }
  }
  if (line) {
    context.fillText(line, x, y)
    y += lineHeight
  }
  return y
}

/** Etichetta in monospazio, maiuscola, con spaziatura larga. */
export function eyebrow(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string = COLORS.cyan,
): void {
  context.font = `600 ${size}px ${MONO}`
  context.fillStyle = color
  context.textBaseline = 'alphabetic'
  // letterSpacing esiste nei browser moderni: dove manca resta il default.
  ;(context as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${Math.round(size * 0.16)}px`
  context.fillText(text.toUpperCase(), x, y)
  ;(context as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0px'
}

/** Chip arrotondato con testo, come i tag delle card. */
export function chip(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string = COLORS.cyan,
): number {
  context.font = `600 ${size}px ${MONO}`
  const padX = size * 0.7
  const width = context.measureText(text).width + padX * 2
  const height = size * 1.9
  roundRect(context, x, y, width, height, height / 2)
  context.fillStyle = 'rgba(34, 211, 238, 0.08)'
  context.fill()
  context.lineWidth = 2
  context.strokeStyle = color
  context.globalAlpha = 0.6
  context.stroke()
  context.globalAlpha = 1
  context.fillStyle = COLORS.mutedStrong
  context.textBaseline = 'middle'
  context.fillText(text, x + padX, y + height / 2 + 1)
  context.textBaseline = 'alphabetic'
  return x + width
}

/** Alone radiale morbido, per sprite luminosi. */
export function createGlowTexture(color = '34, 211, 238'): THREE.CanvasTexture {
  return createCanvasTexture(128, 128, (context, width) => {
    const gradient = context.createRadialGradient(width / 2, width / 2, 0, width / 2, width / 2, width / 2)
    gradient.addColorStop(0, `rgba(${color}, 1)`)
    gradient.addColorStop(0.25, `rgba(${color}, 0.45)`)
    gradient.addColorStop(1, `rgba(${color}, 0)`)
    context.fillStyle = gradient
    context.fillRect(0, 0, width, width)
  })
}
