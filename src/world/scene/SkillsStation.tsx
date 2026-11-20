import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

import type { SkillGroup } from '../../data/profile'
import { getFeaturedProjects } from '../../data/projects'
import { useI18n } from '../../i18n/useI18n'
import { COLORS, eyebrow, MONO, panelBackground, roundRect, SANS, useCanvasTexture } from '../canvasTexture'
import type { WorldSelection } from '../selection'
import { damp, stationFocus, useInteractive } from './frame'
import { Panel, StationGroup } from './shared'

const BOARD_W = 11.4
const BOARD_H = 7
const PX = 150
const BLOCK_W = 1.85
const BLOCK_H = 0.3
const BLOCK_GAP = 0.07
const BASE_Y = -2.15
const COLUMN_STEP = 2.15

/* ------------------------------------------------------------------ KPI */

function KpiTile({ value, label, x }: { value: string; label: string; x: number }) {
  const texture = useCanvasTexture(
    600,
    280,
    (context, width, height) => {
      panelBackground(context, width, height, { radius: 26 })
      context.font = `800 110px ${SANS}`
      context.fillStyle = COLORS.cyan
      context.fillText(value, 36, 150)
      context.font = `500 34px ${SANS}`
      context.fillStyle = COLORS.mutedStrong
      context.fillText(label, 36, 222)
    },
    [value, label],
  )
  return (
    <group position={[x, 2.25, 0.25]}>
      <Panel texture={texture} width={2.5} height={2.5 * (280 / 600)} />
    </group>
  )
}

/* -------------------------------------------------------- blocchi skill */

function BlockLabel({ text, active }: { text: string; active: boolean }) {
  const texture = useCanvasTexture(
    560,
    92,
    (context, width, height) => {
      let size = 40
      context.font = `600 ${size}px ${MONO}`
      while (context.measureText(text).width > width - 40 && size > 22) {
        size -= 2
        context.font = `600 ${size}px ${MONO}`
      }
      context.fillStyle = active ? COLORS.ink : COLORS.mutedStrong
      context.textBaseline = 'middle'
      context.fillText(text, 22, height / 2 + 2)
    },
    [text, active],
  )
  return <Panel texture={texture} width={BLOCK_W - 0.08} height={(BLOCK_W - 0.08) * (92 / 560)} position={[0, 0, BLOCK_H / 2 + 0.16]} />
}

type ColumnProps = {
  group: SkillGroup
  x: number
  active: boolean
  onSelect: () => void
}

/** Colonna del grafico: un blocco etichettato per ogni tecnologia. */
function Column({ group, x, active, onSelect }: ColumnProps) {
  const blocks = useRef<(THREE.Group | null)[]>([])
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const [hovered, setHovered] = useState(false)
  const handlers = useInteractive(onSelect, setHovered)
  const grow = useRef(0)

  // I blocchi si impilano quando la stazione entra a fuoco, uno dopo l'altro.
  useFrame((_, delta) => {
    grow.current = damp(grow.current, stationFocus(4) > 0.35 ? 1 : 0, 2.4, delta)
    group.items.forEach((_, position) => {
      const block = blocks.current[position]
      if (!block) return
      const local = THREE.MathUtils.clamp(grow.current * (group.items.length + 2) - position * 0.9, 0, 1)
      block.position.y = BASE_Y + BLOCK_H / 2 + position * (BLOCK_H + BLOCK_GAP) + (1 - local) * 1.2
      block.scale.setScalar(Math.max(0.001, local))
      const material = materials.current[position]
      if (material) {
        const target = active ? 0.9 : hovered ? 0.45 : 0.08
        material.emissiveIntensity = damp(material.emissiveIntensity, target, 6, delta)
      }
    })
  })

  return (
    <group position-x={x} {...handlers}>
      {group.items.map((item, position) => (
        <group
          key={item}
          ref={(node) => {
            blocks.current[position] = node
          }}
        >
          <mesh>
            <boxGeometry args={[BLOCK_W, BLOCK_H, 0.3]} />
            <meshStandardMaterial
              ref={(node) => {
                materials.current[position] = node
              }}
              color={active ? COLORS.cyan : '#1b2a33'}
              emissive={COLORS.cyan}
              emissiveIntensity={0.08}
              roughness={0.35}
              metalness={0.3}
            />
          </mesh>
          <BlockLabel text={item} active={active} />
        </group>
      ))}
      {/* Zoccolo: rende cliccabile anche una colonna bassa. */}
      <mesh position={[0, BASE_Y - 0.08, 0]}>
        <boxGeometry args={[BLOCK_W + 0.2, 0.08, 0.5]} />
        <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={active ? 1 : 0.3} />
      </mesh>
    </group>
  )
}

/* --------------------------------------------------------------- ticker */

function CertificationTicker({ items, title }: { items: string[]; title: string }) {
  const texture = useCanvasTexture(
    4096,
    96,
    (context, width, height) => {
      context.fillStyle = 'rgba(8, 14, 19, 0.92)'
      context.fillRect(0, 0, width, height)
      context.font = `600 34px ${MONO}`
      context.textBaseline = 'middle'
      const text = `${title}  ·  ${items.join('  ·  ')}  ·  `
      let x = 0
      while (x < width) {
        context.fillStyle = COLORS.amber
        context.fillText(text, x, height / 2)
        x += context.measureText(text).width
      }
    },
    [items, title],
  )
  const material = useRef<THREE.MeshBasicMaterial>(null)

  // Il nastro scorre spostando l'offset della texture, che si ripete.
  useFrame((_, delta) => {
    const map = material.current?.map
    if (!map) return
    map.wrapS = THREE.RepeatWrapping
    map.offset.x = (map.offset.x + Math.min(delta, 0.1) * 0.025) % 1
  })

  return (
    <mesh position={[0, -BOARD_H / 2 + 0.38, 0.06]}>
      <planeGeometry args={[BOARD_W - 0.5, 0.42]} />
      <meshBasicMaterial ref={material} map={texture} toneMapped={false} />
    </mesh>
  )
}

/* -------------------------------------------------------------- stazione */

type SkillsStationProps = { index: number; scale: number; selection: WorldSelection }

export function SkillsStation({ index, scale, selection }: SkillsStationProps) {
  const { profile, projects, language } = useI18n()
  const { skills, world } = profile
  const groups = skills.groups
  const columnX = (position: number) => (position - (groups.length - 1) / 2) * COLUMN_STEP
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)
  const projectCount = getFeaturedProjects(projects).length

  const board = useCanvasTexture(
    BOARD_W * PX,
    BOARD_H * PX,
    (context, width, height) => {
      panelBackground(context, width, height)
      eyebrow(context, world.boards.skills, 56, 72, 28)
      // Titoli delle colonne sotto la base.
      context.textAlign = 'center'
      groups.forEach((group, position) => {
        const cx = (columnX(position) + BOARD_W / 2) * PX
        const cy = (BOARD_H / 2 - BASE_Y) * PX
        context.font = `650 30px ${SANS}`
        context.fillStyle = COLORS.text
        context.fillText(group.title, cx, cy + 74)
        context.font = `500 22px ${MONO}`
        context.fillStyle = COLORS.muted
        context.fillText(`${group.items.length} ${world.boards.items}`, cx, cy + 104)
      })
      context.textAlign = 'start'
      // Fascia per il ticker.
      roundRect(context, 25, height - 0.62 * PX, width - 50, 0.5 * PX, 12)
      context.strokeStyle = COLORS.borderSoft
      context.lineWidth = 2
      context.stroke()
    },
    [language, groups],
  )

  const kpis = [
    { value: String(total), label: world.kpi.technologies },
    { value: String(groups.length), label: world.kpi.groups },
    { value: String(projectCount), label: world.kpi.projects },
    { value: String(skills.certifications.items.length), label: world.kpi.certifications },
  ]

  return (
    <StationGroup index={index} scale={scale}>
      <Panel texture={board} width={BOARD_W} height={BOARD_H} renderOrder={-1} />
      {kpis.map((kpi, position) => (
        <KpiTile key={kpi.label} value={kpi.value} label={kpi.label} x={(position - 1.5) * 2.75} />
      ))}
      <group position-z={0.3}>
        {groups.map((group, position) => (
          <Column
            key={group.id}
            group={group}
            x={columnX(position)}
            active={group.id === selection.group}
            onSelect={() => selection.setGroup(group.id)}
          />
        ))}
      </group>
      <CertificationTicker items={skills.certifications.items} title={world.boards.certifications} />
    </StationGroup>
  )
}
