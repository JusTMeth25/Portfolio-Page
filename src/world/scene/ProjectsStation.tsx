import { useFrame, useLoader } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { getFeaturedProjects, type Project } from '../../data/projects'
import { useI18n } from '../../i18n/useI18n'
import { asset } from '../../lib/asset'
import { chip, COLORS, eyebrow, panelBackground, SANS, useCanvasTexture } from '../canvasTexture'
import type { WorldSelection } from '../selection'
import { ColorTextureLoader, damp, useInteractive } from './frame'
import { Panel, StationGroup } from './shared'

const SCREEN_W = 5.2
const SCREEN_H = 3.25
const SPREAD = 4.1

type MonitorProps = {
  project: Project
  screen: THREE.Texture
  slot: number
  onSelect: () => void
}

/** Monitor con lo screenshot e una striscia informativa sotto. */
function Monitor({ project, screen, slot, onSelect }: MonitorProps) {
  const group = useRef<THREE.Group>(null)
  const glow = useRef<THREE.MeshBasicMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const handlers = useInteractive(onSelect, setHovered)
  const { language } = useI18n()

  const strip = useCanvasTexture(
    1040,
    260,
    (context, width, height) => {
      panelBackground(context, width, height, { radius: 28 })
      eyebrow(context, project.label, 36, 60, 24)
      context.font = `700 64px ${SANS}`
      context.fillStyle = COLORS.text
      context.fillText(project.title, 36, 140)
      let x = 36
      for (const tag of project.tags) x = chip(context, tag, x, 170, 24) + 12
    },
    [project.id, language],
  )

  useFrame((_, delta) => {
    const node = group.current
    if (!node) return
    const front = slot === 0
    node.position.x = damp(node.position.x, slot * SPREAD, 5, delta)
    node.position.z = damp(node.position.z, front ? 0.9 : -1.6, 5, delta)
    node.position.y = damp(node.position.y, front ? 0 : 0.35, 5, delta)
    node.rotation.y = damp(node.rotation.y, -slot * 0.55, 5, delta)
    const scale = damp(node.scale.x, (front ? 1 : 0.62) * (hovered ? 1.04 : 1), 6, delta)
    node.scale.setScalar(scale)
    if (glow.current) {
      glow.current.opacity = damp(glow.current.opacity, front ? 0.9 : hovered ? 0.6 : 0.12, 6, delta)
    }
  })

  return (
    <group ref={group} {...handlers}>
      {/* Bordo luminoso dietro il monitor. */}
      <mesh position-z={-0.12}>
        <planeGeometry args={[SCREEN_W + 0.34, SCREEN_H + 0.34]} />
        <meshBasicMaterial
          ref={glow}
          color={COLORS.cyan}
          transparent
          opacity={0.1}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position-z={-0.06}>
        <boxGeometry args={[SCREEN_W + 0.2, SCREEN_H + 0.2, 0.1]} />
        <meshStandardMaterial color="#0b1217" roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      <Panel texture={strip} width={SCREEN_W} height={SCREEN_W / 4} position={[0, -SCREEN_H / 2 - 0.85, 0.02]} />
    </group>
  )
}

type ProjectsStationProps = {
  index: number
  scale: number
  selection: WorldSelection
}

export function ProjectsStation({ index, scale, selection }: ProjectsStationProps) {
  const { projects } = useI18n()
  const featured = useMemo(() => getFeaturedProjects(projects), [projects])
  const urls = useMemo(() => featured.map((project) => asset(project.image)), [featured])
  const screens = useLoader(ColorTextureLoader, urls)

  const count = featured.length
  return (
    <StationGroup index={index} scale={scale}>
      <group position-y={0.6}>
        {featured.map((project, position) => {
          // -1, 0, +1: sinistra, in primo piano, destra.
          let slot = (position - selection.project + count) % count
          if (slot > count / 2) slot -= count
          return (
            <Monitor
              key={project.id}
              project={project}
              screen={screens[position]!}
              slot={slot}
              onSelect={() =>
                slot === 0 ? selection.openProjectDetails() : selection.setProject(position)
              }
            />
          )
        })}
      </group>
    </StationGroup>
  )
}
