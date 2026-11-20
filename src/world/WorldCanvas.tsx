import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'

import { COLORS } from './canvasTexture'
import { STATION_IDS } from './layout'
import { ContactStation } from './scene/ContactStation'
import { Beacons, CameraRig, Groove, Lights, Playhead, Stars, Tonearm, Turntable } from './scene/Environment'
import { InterestsStation } from './scene/InterestsStation'
import { ProfileStation } from './scene/ProfileStation'
import { ProjectsStation } from './scene/ProjectsStation'
import { useLayoutScale } from './scene/frame'
import { SkillsStation } from './scene/SkillsStation'
import { TimelineStation } from './scene/TimelineStation'
import type { WorldSelection } from './selection'

type WorldCanvasProps = {
  /** Rendering acceso: falso quando la scheda è in background. */
  active: boolean
  compact: boolean
  selection: WorldSelection
  onContextLost: () => void
}

const at = (id: (typeof STATION_IDS)[number]) => STATION_IDS.indexOf(id)

function Scene({ compact, selection }: Pick<WorldCanvasProps, 'compact' | 'selection'>) {
  const scale = useLayoutScale(compact)
  return (
    <>
      <color attach="background" args={[COLORS.bg]} />
      <fogExp2 attach="fog" args={[COLORS.bg, 0.0058]} />
      <CameraRig compact={compact} scale={scale} />
      <Lights />
      <Stars count={compact ? 900 : 1800} />
      <Turntable />
      <Groove />
      <Playhead />
      <Tonearm />
      <Beacons />

      {/* Ogni stazione ha il suo Suspense: una texture lenta non blocca le altre. */}
      <Suspense fallback={null}>
        <ProjectsStation index={at('progetti')} scale={scale} selection={selection} />
      </Suspense>
      <Suspense fallback={null}>
        <ProfileStation index={at('profilo')} scale={scale} selection={selection} />
      </Suspense>
      <TimelineStation index={at('percorso')} scale={scale} selection={selection} />
      <SkillsStation index={at('competenze')} scale={scale} selection={selection} />
      <InterestsStation index={at('colonna-sonora')} scale={scale} selection={selection} />
      <ContactStation index={at('contatti')} scale={scale} />
    </>
  )
}

/** La tela WebGL del mondo: fissa sotto il testo, occupa tutto lo schermo. */
export default function WorldCanvas({ active, compact, selection, onContextLost }: WorldCanvasProps) {
  // Quando si passa alla versione classica la tela viene smontata e Three.js
  // rilascia il contesto WebGL di proposito: quella non è una perdita vera e
  // non deve disattivare la versione 3D.
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  return (
    <Canvas
      dpr={compact ? [1, 1.5] : [1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: compact ? 52 : 45, near: 0.1, far: 700, position: [82, 36, 6] }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.domElement.style.touchAction = 'pan-y'
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          if (mounted.current) onContextLost()
        })
      }}
    >
      <Scene compact={compact} selection={selection} />
    </Canvas>
  )
}
