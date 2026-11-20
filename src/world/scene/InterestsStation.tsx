import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import type { Interest } from '../../data/profile'
import { useI18n } from '../../i18n/useI18n'
import { COLORS, createCanvasTexture, eyebrow, panelBackground, SANS, useCanvasTexture, wrapText } from '../canvasTexture'
import type { WorldSelection } from '../selection'
import { damp, useInteractive } from './frame'
import { Panel, StationGroup } from './shared'

const BOARD_W = 11.4
const BOARD_H = 6.6
const PX = 150
const RECORD_R = 1.1
const RECORD_Y = 1
const BARS = 44
const BAR_BASE = -2.55

const ACCENTS: Record<Interest['accent'], string> = {
  cyan: COLORS.cyan,
  amber: COLORS.amber,
  magenta: COLORS.magenta,
  violet: COLORS.violet,
}

/** Solchi condivisi da tutti i dischi della stazione. */
function useGrooveTexture() {
  const texture = useMemo(
    () =>
      createCanvasTexture(512, 512, (context, size) => {
        const c = size / 2
        context.fillStyle = '#05090c'
        context.beginPath()
        context.arc(c, c, c, 0, Math.PI * 2)
        context.fill()
        for (let r = c * 0.45; r < c - 4; r += 3) {
          const shade = 20 + Math.round(Math.abs(Math.sin(r * 0.6)) * 18)
          context.strokeStyle = `rgb(${shade}, ${shade + 8}, ${shade + 14})`
          context.lineWidth = 1
          context.beginPath()
          context.arc(c, c, r, 0, Math.PI * 2)
          context.stroke()
        }
        // Riflesso diagonale, come la luce su un vinile vero.
        const sheen = context.createLinearGradient(0, 0, size, size)
        sheen.addColorStop(0.35, 'rgba(255,255,255,0)')
        sheen.addColorStop(0.5, 'rgba(255,255,255,0.16)')
        sheen.addColorStop(0.65, 'rgba(255,255,255,0)')
        context.fillStyle = sheen
        context.beginPath()
        context.arc(c, c, c, 0, Math.PI * 2)
        context.fill()
      }),
    [],
  )
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

type RecordProps = {
  interest: Interest
  x: number
  grooves: THREE.Texture
  playing: boolean
  onSelect: () => void
}

function Record({ interest, x, grooves, playing, onSelect }: RecordProps) {
  const holder = useRef<THREE.Group>(null)
  const spinner = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const handlers = useInteractive(onSelect, setHovered)
  const accent = ACCENTS[interest.accent]
  const speed = useRef(0.4)

  const label = useCanvasTexture(
    256,
    256,
    (context, size) => {
      const c = size / 2
      context.fillStyle = accent
      context.beginPath()
      context.arc(c, c, c, 0, Math.PI * 2)
      context.fill()
      context.fillStyle = COLORS.ink
      context.textAlign = 'center'
      context.font = `800 38px ${SANS}`
      context.fillText(interest.label.toUpperCase(), c, c - 30)
      context.beginPath()
      context.arc(c, c, 10, 0, Math.PI * 2)
      context.fill()
    },
    [interest.label, accent],
  )

  useFrame((_, delta) => {
    speed.current = damp(speed.current, playing ? 5.6 : hovered ? 1.4 : 0.4, 2.5, delta)
    if (spinner.current) spinner.current.rotation.z -= Math.min(delta, 0.1) * speed.current
    const node = holder.current
    if (!node) return
    node.position.z = damp(node.position.z, playing ? 0.9 : 0.25, 5, delta)
    node.scale.setScalar(damp(node.scale.x, playing ? 1.14 : hovered ? 1.05 : 1, 6, delta))
  })

  return (
    <group ref={holder} position={[x, RECORD_Y, 0.25]} {...handlers}>
      <group ref={spinner}>
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[RECORD_R, RECORD_R, 0.06, 64]} />
          <meshStandardMaterial color="#05090c" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position-z={0.032}>
          <circleGeometry args={[RECORD_R, 64]} />
          <meshBasicMaterial map={grooves} toneMapped={false} />
        </mesh>
        <mesh position-z={0.034}>
          <circleGeometry args={[RECORD_R * 0.36, 48]} />
          <meshBasicMaterial map={label} toneMapped={false} />
        </mesh>
      </group>
      <mesh position-z={-0.08}>
        <ringGeometry args={[RECORD_R * 1.02, RECORD_R * 1.16, 64]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={playing ? 0.95 : 0.35}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/** Analizzatore di spettro: barre animate nel colore del disco sul piatto. */
function Spectrum({ color }: { color: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const target = useMemo(() => new THREE.Color(color), [color])
  const width = BOARD_W - 1.6
  const step = width / BARS

  useFrame((state, delta) => {
    const node = mesh.current
    if (!node) return
    const t = state.clock.elapsedTime
    for (let index = 0; index < BARS; index += 1) {
      const f = index / BARS
      // Somma di onde: un profilo che ricorda una musica vera, più alto sui bassi.
      const level =
        0.25 +
        0.45 * Math.abs(Math.sin(t * 2.1 + index * 0.45)) * (1.1 - f * 0.6) +
        0.3 * Math.abs(Math.sin(t * 3.7 + index * 1.3)) * Math.abs(Math.sin(t * 0.8 + f * 6))
      const height = 0.08 + level * 1.15
      dummy.position.set(-width / 2 + step * (index + 0.5), BAR_BASE + height / 2, 0.2)
      dummy.scale.set(1, height, 1)
      dummy.updateMatrix()
      node.setMatrixAt(index, dummy.matrix)
    }
    node.instanceMatrix.needsUpdate = true
    if (material.current) {
      material.current.color.lerp(target, Math.min(1, delta * 4))
      material.current.emissive.lerp(target, Math.min(1, delta * 4))
    }
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, BARS]}>
      <boxGeometry args={[step * 0.62, 1, 0.16]} />
      <meshStandardMaterial ref={material} color={color} emissive={color} emissiveIntensity={0.8} toneMapped={false} />
    </instancedMesh>
  )
}

type InterestsStationProps = { index: number; scale: number; selection: WorldSelection }

export function InterestsStation({ index, scale, selection }: InterestsStationProps) {
  const { profile, language } = useI18n()
  const { interests, world } = profile
  const grooves = useGrooveTexture()
  const items = interests.items
  const recordX = (position: number) => (position - (items.length - 1) / 2) * 2.75
  const playing = items.find((item) => item.id === selection.playing) ?? items[0]!

  const board = useCanvasTexture(
    BOARD_W * PX,
    BOARD_H * PX,
    (context, width, height) => {
      panelBackground(context, width, height, { accent: ACCENTS[playing.accent] })
      eyebrow(context, world.boards.spectrum, 56, 72, 28)
      context.textAlign = 'right'
      context.font = `500 26px ${SANS}`
      context.fillStyle = COLORS.muted
      context.fillText(`${world.nowPlaying}: `, width - 56 - context.measureText(playing.label).width - 12, 72)
      context.fillStyle = ACCENTS[playing.accent]
      context.font = `700 26px ${SANS}`
      context.fillText(playing.label, width - 56, 72)
      context.textAlign = 'center'
      items.forEach((item, position) => {
        const cx = (recordX(position) + BOARD_W / 2) * PX
        const top = (BOARD_H / 2 - RECORD_Y + RECORD_R) * PX + 56
        context.font = `700 32px ${SANS}`
        context.fillStyle = item.id === playing.id ? ACCENTS[item.accent] : COLORS.text
        context.fillText(item.label, cx, top)
        context.font = `500 21px ${SANS}`
        context.fillStyle = COLORS.muted
        wrapText(context, item.note, cx, top + 34, 2.5 * PX, 26, 2)
      })
      context.textAlign = 'start'
    },
    [language, playing.id],
  )

  return (
    <StationGroup index={index} scale={scale}>
      <Panel texture={board} width={BOARD_W} height={BOARD_H} renderOrder={-1} />
      {items.map((item, position) => (
        <Record
          key={item.id}
          interest={item}
          x={recordX(position)}
          grooves={grooves}
          playing={item.id === playing.id}
          onSelect={() => selection.setPlaying(item.id)}
        />
      ))}
      <Spectrum color={ACCENTS[playing.accent]} />
    </StationGroup>
  )
}
