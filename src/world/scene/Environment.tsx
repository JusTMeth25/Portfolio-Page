import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { COLORS, createCanvasTexture, createGlowTexture, MONO, SANS } from '../canvasTexture'
import {
  buildPoses,
  DISC_RADIUS,
  GrooveCurve,
  grooveAt,
  LABEL_RADIUS,
  poseAt,
  spiralPoint,
  STATION_FRAMES,
  type CameraPose,
} from '../layout'
import { readProgress } from '../scrollProgress'
import { damp, seeded, stationFocus, worldClock } from './frame'

/* ------------------------------------------------------------- telecamera */

type CameraRigProps = { compact: boolean; scale: number }

/**
 * Telecamera guidata dallo scroll: legge l'avanzamento, lo ammorbidisce e
 * calcola la posa fra le due stazioni vicine. Il puntatore aggiunge appena un
 * po' di parallasse, per far sentire la profondità.
 */
export function CameraRig({ compact, scale }: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const poses = useMemo(() => buildPoses(compact, scale), [compact, scale])
  const pose = useMemo<CameraPose>(
    () => ({ position: new THREE.Vector3(), target: new THREE.Vector3() }),
    [],
  )
  const parallax = useRef(new THREE.Vector2())
  const helpers = useMemo(
    () => ({ forward: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }),
    [],
  )

  // Al montaggio si parte dove si trova già la pagina, senza voli inutili.
  useEffect(() => {
    worldClock.progress = readProgress()
  }, [])

  useFrame((state, delta) => {
    const raw = readProgress()
    const gap = Math.abs(raw - worldClock.progress)
    // Un salto lungo (link della navbar) viaggia un po' più veloce.
    worldClock.progress = damp(worldClock.progress, raw, gap > 1.5 ? 3 : 4.2, delta)
    poseAt(poses, worldClock.progress, pose)

    parallax.current.x = damp(parallax.current.x, state.pointer.x, 3, delta)
    parallax.current.y = damp(parallax.current.y, state.pointer.y, 3, delta)
    const { forward, right, up } = helpers
    forward.subVectors(pose.target, pose.position).normalize()
    right.crossVectors(forward, up).normalize()

    camera.position
      .copy(pose.position)
      .addScaledVector(right, parallax.current.x * 0.7)
      .addScaledVector(up, parallax.current.y * 0.45)
    camera.lookAt(pose.target)
  })

  return null
}

/* -------------------------------------------------------------------- luci */

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#7fd8ff', '#05080b', 0.6]} />
      <directionalLight position={[40, 70, 30]} intensity={1.6} color="#e6f6ff" />
      <directionalLight position={[-50, 30, -40]} intensity={0.5} color={COLORS.blue} />
    </>
  )
}

/* ------------------------------------------------------------------ disco */

function drawDisc(context: CanvasRenderingContext2D, size: number) {
  const center = size / 2
  const outer = size / 2
  const label = (LABEL_RADIUS / DISC_RADIUS) * outer

  const base = context.createRadialGradient(center, center, label, center, center, outer)
  base.addColorStop(0, '#0d151b')
  base.addColorStop(1, '#05090c')
  context.fillStyle = base
  context.beginPath()
  context.arc(center, center, outer, 0, Math.PI * 2)
  context.fill()

  // Solchi: anelli sottili con luminosità leggermente variabile.
  for (let radius = label + 10; radius < outer - 6; radius += 3) {
    const shade = 18 + Math.round(Math.abs(Math.sin(radius * 0.37)) * 14)
    context.strokeStyle = `rgb(${shade}, ${shade + 8}, ${shade + 14})`
    context.globalAlpha = 0.55
    context.lineWidth = 1
    context.beginPath()
    context.arc(center, center, radius, 0, Math.PI * 2)
    context.stroke()
  }
  // Pause fra le tracce: anelli lisci più larghi.
  context.globalAlpha = 1
  for (const fraction of [0.36, 0.52, 0.67, 0.83]) {
    context.strokeStyle = '#03070a'
    context.lineWidth = 7
    context.beginPath()
    context.arc(center, center, outer * fraction, 0, Math.PI * 2)
    context.stroke()
  }

  // Etichetta centrale.
  const labelGradient = context.createLinearGradient(center - label, center - label, center + label, center + label)
  labelGradient.addColorStop(0, COLORS.cyan)
  labelGradient.addColorStop(1, COLORS.blue)
  context.fillStyle = labelGradient
  context.beginPath()
  context.arc(center, center, label, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = COLORS.ink
  context.textAlign = 'center'
  // Ogni riga deve stare dentro la corda del cerchio alla sua altezza,
  // altrimenti sull'etichetta tonda i bordi del testo vengono tagliati.
  const fitLine = (text: string, offset: number, size: number, weight: number, family: string) => {
    const y = center + label * offset
    const chord = 2 * Math.sqrt(Math.max(0, label * label - (label * offset) ** 2)) * 0.84
    let px = label * size
    context.font = `${weight} ${px}px ${family}`
    while (context.measureText(text).width > chord && px > 8) {
      px -= 1
      context.font = `${weight} ${px}px ${family}`
    }
    context.fillText(text, center, y)
  }
  fitLine('LORENZO MELIS', -0.38, 0.2, 800, SANS)
  fitLine('FULL-STACK DEVELOPER', 0.38, 0.11, 700, MONO)
  fitLine('SIDE A · 33⅓ RPM', 0.6, 0.09, 600, MONO)
  context.beginPath()
  context.arc(center, center, label * 0.06, 0, Math.PI * 2)
  context.fill()
  context.textAlign = 'start'
}

export function Turntable() {
  const disc = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => {
    const map = createCanvasTexture(2048, 2048, (context, size) => drawDisc(context, size))
    map.anisotropy = 8
    return map
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  // Un giro ogni ~2 minuti: abbastanza lento da non disturbare la lettura.
  useFrame((_, delta) => {
    if (disc.current) disc.current.rotation.z += Math.min(delta, 0.1) * 0.05
  })

  return (
    <group>
      <mesh ref={disc} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[DISC_RADIUS, 160]} />
        <meshStandardMaterial map={texture} roughness={0.38} metalness={0.4} />
      </mesh>
      {/* Il piatto sotto il disco. */}
      <mesh position-y={-1.3}>
        <cylinderGeometry args={[DISC_RADIUS + 3, DISC_RADIUS + 3.4, 2.4, 128]} />
        <meshStandardMaterial color="#0c1419" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <ringGeometry args={[DISC_RADIUS + 0.2, DISC_RADIUS + 0.6, 160]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.35} toneMapped={false} />
      </mesh>
      {/* Perno centrale. */}
      <mesh position-y={0.7}>
        <cylinderGeometry args={[0.35, 0.35, 1.4, 24]} />
        <meshStandardMaterial color="#c9d6df" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ solco */

const grooveVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const grooveFragment = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float s = vUv.x;
    float traveled = 1.0 - smoothstep(uProgress - 0.002, uProgress + 0.002, s);
    float head = exp(-pow((s - uProgress) * 140.0, 2.0));
    float pulse = 0.5 + 0.5 * sin(s * 520.0 - uTime * 4.0);
    vec3 dim = vec3(0.13, 0.59, 0.95) * (0.22 + 0.18 * pulse);
    vec3 lit = vec3(0.13, 0.83, 0.93) * (0.8 + 0.2 * pulse);
    vec3 color = mix(dim, lit, traveled) + vec3(head);
    float alpha = clamp(mix(0.5, 0.95, traveled) + head, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`

/** Il solco luminoso: la parte già percorsa è accesa, il resto aspetta. */
export function Groove() {
  const geometry = useMemo(() => new THREE.TubeGeometry(new GrooveCurve(), 900, 0.11, 8, false), [])
  const uniforms = useMemo(() => ({ uProgress: { value: 0 }, uTime: { value: 0 } }), [])
  const material = useRef<THREE.ShaderMaterial>(null)

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state) => {
    const shader = material.current
    if (!shader) return
    shader.uniforms.uProgress!.value = grooveAt(worldClock.progress)
    shader.uniforms.uTime!.value = state.clock.elapsedTime
  })

  return (
    <mesh geometry={geometry} position-y={0.08}>
      <shaderMaterial
        ref={material}
        vertexShader={grooveVertex}
        fragmentShader={grooveFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

/** La puntina: una luce che scorre nel solco insieme alla telecamera. */
export function Playhead() {
  const group = useRef<THREE.Group>(null)
  const glow = useMemo(() => createGlowTexture(), [])
  const point = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => () => glow.dispose(), [glow])

  useFrame(() => {
    if (!group.current) return
    spiralPoint(grooveAt(worldClock.progress), point)
    group.current.position.set(point.x, 0.45, point.z)
  })

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.24, 24, 16]} />
        <meshBasicMaterial color="#e9fdff" toneMapped={false} />
      </mesh>
      <sprite scale={3.6}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight color={COLORS.cyan} intensity={40} distance={22} decay={1.6} />
    </group>
  )
}

/** Braccio del giradischi, parcheggiato con la puntina all'inizio del solco. */
export function Tonearm() {
  const pivot = useMemo(() => {
    const angle = (-30 * Math.PI) / 180
    return new THREE.Vector3(Math.cos(angle) * 66, 0, Math.sin(angle) * 66)
  }, [])
  const needle = useMemo(() => spiralPoint(0), [])
  const length = pivot.distanceTo(needle)
  const yaw = Math.atan2(needle.x - pivot.x, needle.z - pivot.z)
  const metal = <meshStandardMaterial color="#c9d6df" roughness={0.25} metalness={0.9} />

  return (
    <group position={pivot}>
      <mesh position-y={0.6}>
        <cylinderGeometry args={[3, 3.4, 1.6, 48]} />
        <meshStandardMaterial color="#121c23" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position-y={3}>
        <cylinderGeometry args={[0.55, 0.7, 4, 24]} />
        {metal}
      </mesh>
      <group position-y={4.6} rotation-y={yaw}>
        {/* Contrappeso dietro il perno. */}
        <mesh position-z={-3} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[1.1, 1.1, 2, 32]} />
          <meshStandardMaterial color="#1b2a33" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position-z={length / 2} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.24, 0.24, length, 16]} />
          {metal}
        </mesh>
        {/* Testina: scende fino al disco. */}
        <mesh position={[0, -1.9, length]}>
          <boxGeometry args={[1, 3.6, 1.6]} />
          <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0.4} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

/* ---------------------------------------------------------- stelle e fari */

/** Polvere lontana: dà profondità al buio intorno al disco. */
export function Stars({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const random = seeded(7)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const cyan = new THREE.Color(COLORS.cyan)
    const white = new THREE.Color(COLORS.text)
    const amber = new THREE.Color(COLORS.amber)
    const color = new THREE.Color()
    for (let index = 0; index < count; index += 1) {
      const radius = 130 + random() * 160
      const theta = random() * Math.PI * 2
      const phi = Math.acos(random() * 1.6 - 0.6)
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[index * 3 + 1] = radius * Math.cos(phi) - 20
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
      const pick = random()
      color.copy(pick < 0.7 ? white : pick < 0.92 ? cyan : amber)
      colors.set([color.r, color.g, color.b], index * 3)
    }
    const result = new THREE.BufferGeometry()
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    result.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return result
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += Math.min(delta, 0.1) * 0.004
  })

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={1.1} vertexColors transparent opacity={0.8} fog={false} depthWrite={false} />
    </points>
  )
}

/** Un anello e un fascio di luce su ogni stazione: si vedono anche da lontano. */
function Beacon({ index }: { index: number }) {
  const frame = STATION_FRAMES[index]!
  const ring = useRef<THREE.MeshBasicMaterial>(null)
  const beam = useRef<THREE.MeshBasicMaterial>(null)

  // Arrivati alla stazione il faro si spegne: non deve attraversare i pannelli.
  useFrame(() => {
    const away = 1 - stationFocus(index)
    if (ring.current) ring.current.opacity = 0.12 + away * 0.45
    if (beam.current) beam.current.opacity = away * 0.3
  })

  return (
    <group position={[frame.anchor.x, 0, frame.anchor.z]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.1}>
        <ringGeometry args={[2.1, 2.5, 64]} />
        <meshBasicMaterial ref={ring} color={COLORS.cyan} transparent opacity={0.55} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position-y={7}>
        <cylinderGeometry args={[0.06, 0.06, 14, 8, 1, true]} />
        <meshBasicMaterial
          ref={beam}
          color={COLORS.cyan}
          transparent
          opacity={0.28}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

export function Beacons() {
  return (
    <>
      {STATION_FRAMES.slice(1).map((_, index) => (
        <Beacon key={index} index={index + 1} />
      ))}
    </>
  )
}
