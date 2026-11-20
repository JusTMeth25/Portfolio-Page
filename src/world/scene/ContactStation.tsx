import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

import type { ContactLink } from '../../data/profile'
import { useI18n } from '../../i18n/useI18n'
import { COLORS, MONO, panelBackground, roundRect, useCanvasTexture } from '../canvasTexture'
import { damp, useInteractive } from './frame'
import { Panel, StationGroup } from './shared'

const TERM_W = 8.6
const TERM_H = 4.6
const PX = 180

function openLink(link: ContactLink) {
  if (link.kind === 'email') window.location.href = link.href
  else window.open(link.href, '_blank', 'noopener,noreferrer')
}

/** Tasto 3D: si abbassa al passaggio e apre il collegamento al click. */
function Key({ link, x }: { link: ContactLink; x: number }) {
  const cap = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const handlers = useInteractive(() => openLink(link), setHovered)
  const texture = useCanvasTexture(
    520,
    180,
    (context, width, height) => {
      roundRect(context, 6, 6, width - 12, height - 12, 26)
      context.fillStyle = hovered ? COLORS.cyan : '#142029'
      context.fill()
      context.lineWidth = 4
      context.strokeStyle = COLORS.cyan
      context.stroke()
      context.font = `700 54px ${MONO}`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = hovered ? COLORS.ink : COLORS.text
      context.fillText(link.label.toUpperCase(), width / 2, height / 2 + 2)
    },
    [link.label, hovered],
  )

  useFrame((_, delta) => {
    if (cap.current) cap.current.position.z = damp(cap.current.position.z, hovered ? 0.25 : 0.6, 10, delta)
  })

  return (
    <group position={[x, -3.15, 0.4]} {...handlers}>
      <mesh position-z={0.1}>
        <boxGeometry args={[2.7, 1, 0.3]} />
        <meshStandardMaterial color="#0b1217" roughness={0.4} metalness={0.6} />
      </mesh>
      <group ref={cap}>
        <mesh>
          <boxGeometry args={[2.5, 0.86, 0.3]} />
          <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={hovered ? 0.9 : 0.25} />
        </mesh>
        <Panel texture={texture} width={2.5} height={2.5 * (180 / 520)} position={[0, 0, 0.16]} />
      </group>
    </group>
  )
}

type ContactStationProps = { index: number; scale: number }

/** Terminale con i contatti e tre tasti che aprono email, GitHub e LinkedIn. */
export function ContactStation({ index, scale }: ContactStationProps) {
  const { profile, language } = useI18n()
  const { contact, world, name, role } = profile
  const caret = useRef<THREE.Mesh>(null)

  const terminal = useCanvasTexture(
    TERM_W * PX,
    TERM_H * PX,
    (context, width, height) => {
      panelBackground(context, width, height, { alpha: 0.95 })
      // Barra della finestra.
      context.fillStyle = 'rgba(20, 32, 41, 0.95)'
      context.fillRect(4, 8, width - 8, 70)
      ;['#f472b6', '#f0b429', '#22d3ee'].forEach((color, position) => {
        context.fillStyle = color
        context.beginPath()
        context.arc(52 + position * 40, 43, 12, 0, Math.PI * 2)
        context.fill()
      })
      context.font = `500 28px ${MONO}`
      context.fillStyle = COLORS.muted
      context.textAlign = 'center'
      context.fillText(`lorenzo@portfolio: ~/${world.boards.terminal}`, width / 2, 53)
      context.textAlign = 'start'

      const lines: Array<[string, string]> = [
        ['$ ', 'whoami'],
        ['', `${name} — ${role}`],
        ['$ ', `cat ${world.boards.terminal}.txt`],
        ...contact.links.map((link): [string, string] => ['', `${link.label.toLowerCase().padEnd(10, ' ')}${link.value}`]),
        ['$ ', ''],
      ]
      let y = 150
      for (const [prompt, text] of lines) {
        context.font = `500 40px ${MONO}`
        context.fillStyle = COLORS.cyan
        context.fillText(prompt, 56, y)
        const offset = prompt ? context.measureText(prompt).width : 0
        context.fillStyle = prompt ? COLORS.text : COLORS.mutedStrong
        context.fillText(text, 56 + offset, y)
        y += 82
      }
    },
    [language],
  )

  const lineCount = 3 + contact.links.length + 1
  const caretY = TERM_H / 2 - (150 + (lineCount - 1) * 82 - 14) / PX

  useFrame((state) => {
    if (caret.current) caret.current.visible = Math.floor(state.clock.elapsedTime * 2) % 2 === 0
  })

  return (
    <StationGroup index={index} scale={scale}>
      <group position-y={0.9}>
        <mesh position-z={-0.08}>
          <boxGeometry args={[TERM_W + 0.3, TERM_H + 0.3, 0.12]} />
          <meshStandardMaterial color="#0b1217" roughness={0.35} metalness={0.6} />
        </mesh>
        <Panel texture={terminal} width={TERM_W} height={TERM_H} />
        <mesh ref={caret} position={[-TERM_W / 2 + (56 + 52) / PX + 0.1, caretY, 0.02]}>
          <planeGeometry args={[0.16, 0.26]} />
          <meshBasicMaterial color={COLORS.cyan} toneMapped={false} />
        </mesh>
      </group>
      {contact.links.map((link, position) => (
        <Key key={link.id} link={link} x={(position - (contact.links.length - 1) / 2) * 2.95} />
      ))}
    </StationGroup>
  )
}
