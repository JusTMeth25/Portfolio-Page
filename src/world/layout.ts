/**
 * Geometria del mondo 3D.
 *
 * Il mondo è un grande disco in vinile. Le sezioni del sito sono "stazioni"
 * appoggiate lungo il solco, che corre a spirale dal bordo esterno verso
 * l'etichetta centrale, come la puntina su un disco vero: si parte dalla hero
 * sul bordo e si arriva ai contatti sull'etichetta.
 *
 * Qui c'è solo matematica pura (niente React, niente WebGL), così le pose della
 * telecamera sono calcolate una volta sola e restano facili da ritoccare.
 */

import * as THREE from 'three'

/** Id delle sezioni, nello stesso ordine del solco. Coincidono con le ancore. */
export const STATION_IDS = [
  'hero',
  'progetti',
  'profilo',
  'percorso',
  'competenze',
  'colonna-sonora',
  'contatti',
] as const

export type StationId = (typeof STATION_IDS)[number]

export const STATION_COUNT = STATION_IDS.length
const SEGMENTS = STATION_COUNT - 1

/** Raggio del disco su cui poggia tutto. */
export const DISC_RADIUS = 58
/** Raggio dell'etichetta centrale. */
export const LABEL_RADIUS = 9

/**
 * Coordinate polari delle stazioni: angolo in gradi e raggio. Fra una stazione
 * e l'altra angolo e raggio crescono/calano in modo lineare: ne esce una
 * spirale che stringe verso il centro.
 */
const STATION_POLAR: ReadonlyArray<readonly [number, number]> = [
  [0, 50],
  [62, 44],
  [128, 38],
  [198, 31],
  [272, 24],
  [350, 16],
  [430, 0],
]

const DEG = Math.PI / 180

/** Punto del solco per `s` in [0, 1]. y = 0 è la superficie del disco. */
export function spiralPoint(s: number, target = new THREE.Vector3()): THREE.Vector3 {
  const clamped = THREE.MathUtils.clamp(s, 0, 1)
  const scaled = clamped * SEGMENTS
  const index = Math.min(Math.floor(scaled), SEGMENTS - 1)
  const local = scaled - index
  const [a0, r0] = STATION_POLAR[index]!
  const [a1, r1] = STATION_POLAR[index + 1]!
  const angle = (a0 + (a1 - a0) * local) * DEG
  const radius = r0 + (r1 - r0) * local
  return target.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
}

/** Il solco come curva di Three.js, per la TubeGeometry. */
export class GrooveCurve extends THREE.Curve<THREE.Vector3> {
  // Il costruttore di Curve è protetto: qui lo si rende pubblico.
  public constructor() {
    super()
  }

  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return spiralPoint(t, target)
  }
}

/** Valore di `s` sul solco per la stazione `index`. */
export function stationS(index: number): number {
  return index / SEGMENTS
}

export type StationFrame = {
  /** Punto sul solco sotto la stazione. */
  anchor: THREE.Vector3
  /** Centro dei pannelli della stazione. */
  center: THREE.Vector3
  /** Verso cui guardano i pannelli (e da cui arriva la telecamera). */
  normal: THREE.Vector3
  /** Rotazione Y da dare al gruppo della stazione. */
  yaw: number
}

const UP = new THREE.Vector3(0, 1, 0)
const PANEL_HEIGHT = 4.4

function buildFrames(): StationFrame[] {
  return STATION_IDS.map((_, index) => {
    const anchor = spiralPoint(stationS(index))
    let normal: THREE.Vector3
    if (anchor.lengthSq() > 1) {
      normal = anchor.clone().normalize()
    } else {
      // Al centro il raggio non ha direzione: si guarda verso la stazione
      // precedente, da dove arriva la telecamera.
      normal = spiralPoint(stationS(index - 1)).sub(anchor).setY(0).normalize()
    }
    const center = anchor.clone().addScaledVector(UP, PANEL_HEIGHT)
    return {
      anchor,
      center,
      normal,
      yaw: Math.atan2(normal.x, normal.z),
    }
  })
}

export const STATION_FRAMES = buildFrames()

export type CameraPose = { position: THREE.Vector3; target: THREE.Vector3 }

/**
 * Pose della telecamera per ogni stazione.
 *
 * Su desktop il testo sta in un pannello a sinistra: la telecamera guarda un
 * punto spostato a sinistra, così il 3D occupa la metà destra dello schermo.
 * Su schermi stretti il testo sta in basso: la telecamera si allontana e
 * guarda un po' più in basso, così il 3D sale nella metà alta.
 */
export function buildPoses(compact: boolean, scale = 1): CameraPose[] {
  return STATION_FRAMES.map((frame, index) => {
    const forward = frame.normal.clone().negate()
    const right = new THREE.Vector3().crossVectors(forward, UP).normalize()

    if (index === 0) {
      // Hero: vista dall'alto e da fuori, si vede tutto il disco con il solco.
      const position = frame.normal
        .clone()
        .multiplyScalar(compact ? 96 : 82)
        .add(new THREE.Vector3(0, compact ? 52 : 36, 0))
        .addScaledVector(right, compact ? 0 : -6)
      const target = frame.normal
        .clone()
        .multiplyScalar(compact ? 6 : 14)
        .addScaledVector(right, compact ? 0 : -16)
        .add(new THREE.Vector3(0, compact ? -14 : -2, 0))
      return { position, target }
    }

    const distance = compact ? 15.5 : 13.5
    const position = frame.center
      .clone()
      .addScaledVector(frame.normal, distance)
      .addScaledVector(UP, compact ? 2.4 : 1.4)
    const target = frame.center.clone()
    if (compact) target.addScaledVector(UP, -3.3)
    else target.addScaledVector(right, -3.1 * scale)
    return { position, target }
  })
}

/** Rallenta all'inizio e alla fine: il volo parte e atterra morbido. */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/**
 * Posa della telecamera per un avanzamento continuo (es. 2.4 = fra la stazione
 * 2 e la 3). Durante il volo la telecamera si alza ad arco sopra il disco.
 */
export function poseAt(
  poses: CameraPose[],
  progress: number,
  out: CameraPose,
): CameraPose {
  const clamped = THREE.MathUtils.clamp(progress, 0, poses.length - 1)
  const index = Math.min(Math.floor(clamped), poses.length - 2)
  const local = easeInOut(clamped - index)
  const from = poses[index]!
  const to = poses[index + 1]!
  out.position.lerpVectors(from.position, to.position, local)
  out.target.lerpVectors(from.target, to.target, local)
  out.position.y += Math.sin(Math.PI * local) * 9
  return out
}

/** Posizione "eased" sul solco, per la puntina luminosa. */
export function grooveAt(progress: number): number {
  const clamped = THREE.MathUtils.clamp(progress, 0, SEGMENTS)
  const index = Math.min(Math.floor(clamped), SEGMENTS - 1)
  return (index + easeInOut(clamped - index)) / SEGMENTS
}
