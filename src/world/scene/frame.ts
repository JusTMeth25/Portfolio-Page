import { useThree, type ThreeEvent } from '@react-three/fiber'
import { createContext, useContext, useEffect, useRef } from 'react'
import * as THREE from 'three'

import { focusOf } from '../scrollProgress'

/**
 * Stato condiviso del fotogramma, scritto dal `CameraRig` e letto da tutti gli
 * oggetti della scena. Un oggetto mutabile e non uno stato React: cambia 60
 * volte al secondo e non deve provocare render.
 */
export const worldClock = {
  /** Avanzamento continuo lungo le stazioni (0 = hero). */
  progress: 0,
}

/** Quanto è a fuoco la stazione, letto nel fotogramma corrente. */
export function stationFocus(index: number): number {
  return focusOf(worldClock.progress, index)
}

/** Avvicina `current` a `target` in modo indipendente dal frame rate. */
export function damp(current: number, target: number, lambda: number, delta: number): number {
  return THREE.MathUtils.damp(current, target, lambda, Math.min(delta, 0.1))
}

/** Generatore pseudo-casuale deterministico: stessa scena a ogni render. */
export function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/**
 * Fattore di scala dei contenuti: su viewport stretti tutto si rimpicciolisce
 * per restare nell'inquadratura. La stessa scala sposta anche le pose.
 */
export function useLayoutScale(compact: boolean): number {
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height))
  if (compact) return THREE.MathUtils.clamp(aspect * 1.25, 0.5, 0.95)
  return THREE.MathUtils.clamp(aspect / 1.78, 0.72, 1) * 0.9
}

/** Indice della stazione che contiene l'oggetto, fornito da `StationGroup`. */
export const StationContext = createContext<number | null>(null)

/** Soglia oltre la quale una stazione è "quella corrente". */
const ACTIVE_FOCUS = 0.5

function setCursor(element: HTMLElement | null, on: boolean) {
  if (!element) return
  element.style.cursor = on ? 'pointer' : ''
  if (on) element.dataset.cursor = 'pointer'
  else delete element.dataset.cursor
}

/**
 * Gestori per un oggetto 3D cliccabile: puntatore a manina (anche quello
 * personalizzato del sito, tramite `data-cursor`) e click.
 */
export function useInteractive(onSelect: () => void, onHover?: (hovered: boolean) => void) {
  const canvas = useRef<HTMLElement | null>(null)
  const station = useContext(StationContext)
  // Gli oggetti rispondono solo quando la loro stazione è quella corrente:
  // una stazione vicina, vista di sfuggita, non deve rubare click.
  const enabled = () => station === null || stationFocus(station) > ACTIVE_FOCUS

  useEffect(
    () => () => {
      setCursor(canvas.current, false)
    },
    [],
  )

  return {
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      if (!enabled()) return
      event.stopPropagation()
      canvas.current = event.nativeEvent.target as HTMLElement
      setCursor(canvas.current, true)
      onHover?.(true)
    },
    onPointerOut: () => {
      setCursor(canvas.current, false)
      onHover?.(false)
    },
    onClick: (event: ThreeEvent<MouseEvent>) => {
      if (!enabled()) return
      event.stopPropagation()
      onSelect()
    },
  }
}

/** TextureLoader che marca subito le immagini come sRGB. */
export class ColorTextureLoader extends THREE.TextureLoader {
  override load(
    url: string,
    onLoad?: (texture: THREE.Texture<HTMLImageElement>) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: unknown) => void,
  ): THREE.Texture<HTMLImageElement> {
    return super.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = 8
        onLoad?.(texture)
      },
      onProgress,
      onError,
    )
  }
}
