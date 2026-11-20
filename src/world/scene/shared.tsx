import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'

import { STATION_FRAMES } from '../layout'
import { StationContext, worldClock } from './frame'

type StationGroupProps = {
  index: number
  scale: number
  children: ReactNode
}

/** Gruppo posizionato sulla stazione e rivolto verso la telecamera. */
export function StationGroup({ index, scale, children }: StationGroupProps) {
  const frame = STATION_FRAMES[index]!
  const inner = useRef<THREE.Group>(null)

  // Un respiro leggero: i pannelli galleggiano sopra il disco.
  useFrame((state) => {
    const group = inner.current
    if (!group) return
    group.position.y = Math.sin(state.clock.elapsedTime * 0.6 + index) * 0.08
    // Si disegnano solo la stazione corrente e, durante il volo, quella verso
    // cui si va: le altre resterebbero visibili attraverso le lavagne
    // semitrasparenti e potrebbero finire davanti a quella corrente.
    group.visible = Math.abs(worldClock.progress - index) < 0.98
  })

  return (
    <group position={frame.center} rotation-y={frame.yaw} scale={scale}>
      <group ref={inner}>
        <StationContext.Provider value={index}>{children}</StationContext.Provider>
      </group>
    </group>
  )
}

type PanelProps = {
  texture: THREE.Texture
  width: number
  height: number
  position?: [number, number, number]
  opacity?: number
  /** Le lavagne di fondo si disegnano prima (-1), così non velano ciò che c'è davanti. */
  renderOrder?: number
}

/** Piano con una texture canvas: è il "foglio" di ogni dashboard. */
export function Panel({ texture, width, height, position, opacity = 1, renderOrder = 0 }: PanelProps) {
  return (
    <mesh position={position} renderOrder={renderOrder}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  )
}
