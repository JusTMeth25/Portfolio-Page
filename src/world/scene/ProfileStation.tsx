import { useFrame, useLoader } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import { useI18n } from '../../i18n/useI18n'
import { asset } from '../../lib/asset'
import { COLORS, eyebrow, panelBackground, SANS, useCanvasTexture, wrapText } from '../canvasTexture'
import type { WorldSelection } from '../selection'
import { ColorTextureLoader, damp, useInteractive } from './frame'
import { Panel, StationGroup } from './shared'

const PHOTO = 3.7

type FactTileProps = { label: string; value: string; y: number; delay: number }

function FactTile({ label, value, y, delay }: FactTileProps) {
  const group = useRef<THREE.Group>(null)
  const texture = useCanvasTexture(
    1000,
    220,
    (context, width, height) => {
      panelBackground(context, width, height, { radius: 26 })
      eyebrow(context, label, 40, 74, 26)
      context.font = `650 50px ${SANS}`
      context.fillStyle = COLORS.text
      wrapText(context, value, 40, 150, width - 80, 54, 2)
    },
    [label, value],
  )

  useFrame((state) => {
    if (group.current) group.current.position.z = 0.15 + Math.sin(state.clock.elapsedTime * 0.9 + delay) * 0.08
  })

  return (
    <group ref={group} position={[2.45, y, 0]}>
      <Panel texture={texture} width={4.9} height={4.9 * 0.22} />
    </group>
  )
}

type ProfileStationProps = { index: number; scale: number; selection: WorldSelection }

export function ProfileStation({ index, scale, selection }: ProfileStationProps) {
  const { profile } = useI18n()
  const { about, world, name, role } = profile
  const [front, back] = useLoader(ColorTextureLoader, [
    asset(about.photos.front.src),
    asset(about.photos.back.src),
  ])

  const card = useRef<THREE.Group>(null)
  const handlers = useInteractive(selection.togglePhoto)

  const header = useCanvasTexture(
    1000,
    260,
    (context, width, height) => {
      panelBackground(context, width, height, { radius: 28 })
      eyebrow(context, world.boards.profile, 40, 70, 26)
      context.font = `750 72px ${SANS}`
      context.fillStyle = COLORS.text
      context.fillText(name, 40, 160)
      context.font = `500 40px ${SANS}`
      context.fillStyle = COLORS.cyan
      context.fillText(role, 40, 220)
    },
    [name, role, world.boards.profile],
  )

  useFrame((_, delta) => {
    if (!card.current) return
    card.current.rotation.y = damp(card.current.rotation.y, selection.photoBack ? Math.PI : 0, 5, delta)
  })

  return (
    <StationGroup index={index} scale={scale}>
      <group position={[-3, 0.2, 0.4]} rotation-y={0.18}>
        <group ref={card} {...handlers}>
          <mesh position-z={-0.05}>
            <boxGeometry args={[PHOTO + 0.3, PHOTO + 0.3, 0.06]} />
            <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0.35} />
          </mesh>
          <mesh position-z={0.001}>
            <planeGeometry args={[PHOTO, PHOTO]} />
            <meshBasicMaterial map={front} toneMapped={false} />
          </mesh>
          <mesh position-z={-0.09} rotation-y={Math.PI}>
            <planeGeometry args={[PHOTO, PHOTO]} />
            <meshBasicMaterial map={back} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <group position={[2.45, 2.25, 0.1]}>
        <Panel texture={header} width={4.9} height={4.9 * 0.26} />
      </group>
      {about.facts.map((fact, position) => (
        <FactTile
          key={fact.label}
          label={fact.label}
          value={fact.value}
          y={0.85 - position * 1.25}
          delay={position * 1.3}
        />
      ))}
    </StationGroup>
  )
}
