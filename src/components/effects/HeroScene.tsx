import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

type HeroSceneProps = {
  /** Il rendering gira solo quando la hero è visibile e la tab è attiva. */
  active: boolean
  /** Su schermi piccoli riduciamo il numero di elementi e il DPR. */
  compact: boolean
  onContextLost: () => void
}

const CYAN = '#22d3ee'
const BLUE = '#2196f3'

/** Tre piani traslucidi intersecati = strati software interconnessi. */
function Layer({
  y,
  size,
  rotation,
  color,
  opacity,
}: {
  y: number
  size: [number, number]
  rotation: [number, number, number]
  color: string
  opacity: number
}) {
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(size[0], size[1], 1, 1),
    [size],
  )
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry])

  useEffect(() => {
    return () => {
      geometry.dispose()
      edges.dispose()
    }
  }, [geometry, edges])

  return (
    <group position={[0, y, 0]} rotation={rotation}>
      <mesh geometry={geometry}>
        {/* Trasparenza approssimata: material base additivo, niente refrazione. */}
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={CYAN} transparent opacity={0.85} />
      </lineSegments>
    </group>
  )
}

/** Nodi luminosi distribuiti sui piani. */
function Nodes({ count }: { count: number }) {
  const positions = useMemo(() => {
    const rows: [number, number, number][] = []
    const layers = [0.95, 0, -0.95]
    for (let i = 0; i < count; i += 1) {
      const layer = layers[i % layers.length] ?? 0
      const angle = (i / count) * Math.PI * 2 * 1.618
      const radius = 0.55 + ((i * 37) % 55) / 100
      rows.push([
        Math.cos(angle) * radius,
        layer + (((i * 17) % 20) - 10) / 260,
        Math.sin(angle) * radius * 0.72,
      ])
    }
    return rows
  }, [count])

  return (
    <group>
      {positions.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.034, 10, 10]} />
          <meshBasicMaterial color={index % 3 === 0 ? BLUE : CYAN} />
        </mesh>
      ))}
    </group>
  )
}

/** Orbite ciano attorno alla scultura. */
function Orbits() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.62, 0.008, 8, 128]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[Math.PI / 2.3, 0.42, 0.26]}>
        <torusGeometry args={[1.34, 0.006, 8, 128]} />
        <meshBasicMaterial color={BLUE} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

/** Montanti che legano i tre piani: gli strati sono collegati fra loro. */
function Connectors() {
  const geometry = useMemo(() => {
    const points = [
      [0, -1.15, 0], [0, 1.15, 0],
      [-0.92, -1.05, -0.4], [-0.92, 1.05, -0.4],
      [0.92, -1.05, 0.4], [0.92, 1.05, 0.4],
    ]
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(points.flat(), 3),
    )
    return buffer
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={CYAN} transparent opacity={0.45} />
    </lineSegments>
  )
}

function Sculpture({
  compact,
  reduced,
}: {
  compact: boolean
  reduced: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  useFrame((state, delta) => {
    const node = group.current
    if (!node) return

    if (reduced) {
      node.rotation.y = -0.35
      node.rotation.x = 0.12
      return
    }

    // Rotazione lenta e continua.
    node.rotation.y += delta * 0.16

    // Parallax morbido: il target insegue il puntatore, mai a scatti.
    pointer.current.x += (state.pointer.x * 0.16 - pointer.current.x) * 0.05
    pointer.current.y += (state.pointer.y * 0.12 - pointer.current.y) * 0.05
    node.rotation.x = 0.14 + pointer.current.y
    node.position.x = pointer.current.x * 0.35
  })

  const scale = Math.min(1.12, viewport.width / 4.6)

  return (
    <group ref={group} scale={scale}>
      <Layer
        y={0.95}
        size={[2.5, 1.65]}
        rotation={[-1.16, 0, 0.16]}
        color={CYAN}
        opacity={0.2}
      />
      <Layer
        y={0}
        size={[2.9, 1.9]}
        rotation={[-1.22, 0, -0.1]}
        color={BLUE}
        opacity={0.19}
      />
      <Layer
        y={-0.95}
        size={[2.5, 1.65]}
        rotation={[-1.16, 0, 0.22]}
        color={CYAN}
        opacity={0.16}
      />
      <Connectors />
      <Nodes count={compact ? 12 : 24} />
      {!compact && <Orbits />}
    </group>
  )
}

export default function HeroScene({
  active,
  compact,
  onContextLost,
}: HeroSceneProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <Canvas
      /* 'demand' disegna un fotogramma e si ferma: niente loop inutile. */
      frameloop={active ? 'always' : 'demand'}
      dpr={compact ? [1, 1.4] : [1, 1.8]}
      camera={{ position: [0, 0.35, 4.6], fov: 42 }}
      gl={{ antialias: !compact, alpha: true, powerPreference: 'low-power' }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        gl.setClearAlpha(0)
        const canvas = gl.domElement
        canvas.setAttribute('aria-hidden', 'true')
        canvas.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          onContextLost()
        })
      }}
    >
      <Sculpture compact={compact} reduced={reduced} />
    </Canvas>
  )
}
