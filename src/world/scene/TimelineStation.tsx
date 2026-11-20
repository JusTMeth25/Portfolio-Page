import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import type { TimelineEntry } from '../../data/profile'
import { useI18n } from '../../i18n/useI18n'
import { COLORS, eyebrow, MONO, panelBackground, SANS, useCanvasTexture } from '../canvasTexture'
import { timelineSpan } from '../timelineSpans'
import type { WorldSelection } from '../selection'
import { damp, useInteractive } from './frame'
import { Panel, StationGroup } from './shared'

/* Geometria del grafico, in unità del mondo (origine al centro della lavagna). */
const BOARD_W = 11
const BOARD_H = 6.4
const CHART_LEFT = -1.5
const CHART_RIGHT = 5
const ROW_TOP = 1.45
const ROW_STEP = 0.78
const AXIS_Y = -2.45
const PX = 160

type Row = { entry: TimelineEntry; start: number; end: number; y: number }

function buildRows(entries: TimelineEntry[]): { rows: Row[]; from: number; to: number } {
  const rows = entries
    .map((entry) => ({ entry, ...timelineSpan(entry) }))
    .sort((a, b) => a.start - b.start)
    .map((row, position) => ({ ...row, y: ROW_TOP - position * ROW_STEP }))
  const from = Math.floor(Math.min(...rows.map((row) => row.start)))
  const to = Math.ceil(Math.max(...rows.map((row) => row.end))) + 1
  return { rows, from, to }
}

type BarProps = {
  row: Row
  x: (year: number) => number
  active: boolean
  onSelect: () => void
}

function Bar({ row, x, active, onSelect }: BarProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const handlers = useInteractive(onSelect, setHovered)
  const color = row.entry.kind === 'lavoro' ? COLORS.amber : COLORS.cyan
  const left = x(row.start)
  const width = Math.max(0.22, x(row.end) - left)

  useFrame((_, delta) => {
    if (mesh.current) mesh.current.position.z = damp(mesh.current.position.z, active ? 0.4 : 0.14, 6, delta)
    if (material.current) {
      const target = active ? 1.4 : hovered ? 0.9 : 0.35
      material.current.emissiveIntensity = damp(material.current.emissiveIntensity, target, 6, delta)
    }
  })

  return (
    <mesh ref={mesh} position={[left + width / 2, row.y, 0.14]} {...handlers}>
      <boxGeometry args={[width, 0.42, 0.2]} />
      <meshStandardMaterial
        ref={material}
        color={color}
        emissive={color}
        emissiveIntensity={0.35}
        roughness={0.35}
        metalness={0.2}
        toneMapped={false}
      />
    </mesh>
  )
}

type TimelineStationProps = { index: number; scale: number; selection: WorldSelection }

/** Diagramma di Gantt in 3D: una barra per tappa, colore per tipo. */
export function TimelineStation({ index, scale, selection }: TimelineStationProps) {
  const { profile, language } = useI18n()
  const { timeline, world, ui } = profile
  const { rows, from, to } = useMemo(() => buildRows(timeline.entries), [timeline.entries])
  const x = useMemo(
    () => (year: number) => CHART_LEFT + ((year - from) / (to - from)) * (CHART_RIGHT - CHART_LEFT),
    [from, to],
  )
  const sweep = useRef<THREE.Mesh>(null)

  const board = useCanvasTexture(
    BOARD_W * PX,
    BOARD_H * PX,
    (context, width, height) => {
      const px = (value: number) => (value + BOARD_W / 2) * PX
      const py = (value: number) => (BOARD_H / 2 - value) * PX
      panelBackground(context, width, height)
      eyebrow(context, world.boards.timeline, 56, 76, 28)

      // Legenda.
      let legendX = width - 56
      context.font = `600 24px ${MONO}`
      for (const [kind, color] of [['formazione', COLORS.cyan], ['lavoro', COLORS.amber]] as const) {
        const label = ui.timelineKind[kind].toUpperCase()
        legendX -= context.measureText(label).width
        context.fillStyle = COLORS.muted
        context.fillText(label, legendX, 74)
        legendX -= 34
        context.fillStyle = color
        context.fillRect(legendX, 56, 22, 22)
        legendX -= 40
      }

      // Griglia degli anni.
      context.textAlign = 'center'
      for (let year = from; year <= to; year += 1) {
        const gx = px(x(year))
        context.strokeStyle = COLORS.borderSoft
        context.lineWidth = 2
        context.beginPath()
        context.moveTo(gx, py(ROW_TOP + 0.55))
        context.lineTo(gx, py(AXIS_Y))
        context.stroke()
        context.fillStyle = COLORS.muted
        context.font = `500 24px ${MONO}`
        context.fillText(String(year), gx, py(AXIS_Y) + 40)
      }
      context.textAlign = 'start'
      context.strokeStyle = COLORS.border
      context.beginPath()
      context.moveTo(px(CHART_LEFT), py(AXIS_Y))
      context.lineTo(px(CHART_RIGHT), py(AXIS_Y))
      context.stroke()

      // Etichette delle righe.
      for (const row of rows) {
        context.fillStyle = COLORS.text
        context.font = `650 34px ${SANS}`
        context.fillText(row.entry.organization, 56, py(row.y) - 2)
        context.fillStyle = COLORS.muted
        context.font = `500 22px ${MONO}`
        context.fillText(row.entry.period, 56, py(row.y) + 30)
      }
    },
    [language, rows, from, to],
  )

  // La linea che scorre sugli anni, come la puntina che legge il disco.
  useFrame((state) => {
    if (!sweep.current) return
    const t = (state.clock.elapsedTime * 0.12) % 1
    sweep.current.position.x = CHART_LEFT + t * (CHART_RIGHT - CHART_LEFT)
  })

  return (
    <StationGroup index={index} scale={scale}>
      <Panel texture={board} width={BOARD_W} height={BOARD_H} renderOrder={-1} />
      {rows.map((row) => (
        <Bar
          key={row.entry.id}
          row={row}
          x={x}
          active={row.entry.id === selection.entry}
          onSelect={() => selection.setEntry(row.entry.id)}
        />
      ))}
      <mesh ref={sweep} position={[CHART_LEFT, (ROW_TOP + 0.5 + AXIS_Y) / 2, 0.05]}>
        <planeGeometry args={[0.04, ROW_TOP + 0.5 - AXIS_Y]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.6} toneMapped={false} depthWrite={false} />
      </mesh>
    </StationGroup>
  )
}
