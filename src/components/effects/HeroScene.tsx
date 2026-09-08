import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

type HeroSceneProps = {
  /** Il rendering gira solo quando la hero è visibile e la tab è attiva. */
  active: boolean
  /** Su schermi piccoli riduciamo il numero di elementi e il DPR. */
  compact: boolean
  onContextLost: () => void
}

/**
 * Generatore pseudo-casuale deterministico: la polvere è sempre la stessa a
 * ogni render, così il calcolo resta puro e il risultato riproducibile.
 */
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const CYAN = '#22d3ee'
const BLUE = '#2196f3'
const DISC_RADIUS = 2
/**
 * Inclinazione del piatto. Positiva: la faccia con solchi ed etichetta guarda
 * la camera, come un disco appoggiato su un giradischi visto dall'alto.
 */
const TILT = 0.86
const LABEL_RADIUS = 0.52

/* ------------------------------------------------------------------ texture */

/** Alone radiale generato una volta sola: fa da bloom dietro al disco. */
function createGlowTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    )
    gradient.addColorStop(0, 'rgba(34, 211, 238, 0.55)')
    gradient.addColorStop(0.35, 'rgba(33, 150, 243, 0.18)')
    gradient.addColorStop(1, 'rgba(33, 150, 243, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }
  return new THREE.CanvasTexture(canvas)
}

/* --------------------------------------------------------------------- disco */

/**
 * Solchi: tutti gli anelli in **una sola geometria**.
 *
 * Prima era un `lineLoop` per anello, cioè 40 draw call per fotogramma solo
 * per i solchi. Qui c'è un unico `lineSegments` con i colori per vertice: una
 * draw call, stesso risultato.
 */
function Grooves({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const segments = 96
    const positions: number[] = []
    const colors: number[] = []
    const plain = new THREE.Color('#8fa6b6')
    const accent = new THREE.Color(CYAN)

    for (let ring = 0; ring < count; ring += 1) {
      const radius =
        LABEL_RADIUS + 0.08 + (ring / count) * (DISC_RADIUS - LABEL_RADIUS - 0.14)
      const color = ring % 6 === 0 ? accent : plain
      for (let i = 0; i < segments; i += 1) {
        const a = (i / segments) * Math.PI * 2
        const b = ((i + 1) / segments) * Math.PI * 2
        positions.push(
          Math.cos(a) * radius, 0, Math.sin(a) * radius,
          Math.cos(b) * radius, 0, Math.sin(b) * radius,
        )
        colors.push(color.r, color.g, color.b, color.r, color.g, color.b)
      }
    }

    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    buffer.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return buffer
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry} position={[0, 0.031, 0]}>
      <lineBasicMaterial vertexColors transparent opacity={0.22} depthWrite={false} />
    </lineSegments>
  )
}

/** Corpo del vinile: cilindro schiacciato, etichetta e foro del perno. */
function Disc({ grooves }: { grooves: number }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, 0.06, 96]} />
        {/* Il corpo del disco resta PBR: è il pezzo che si guarda, e con
            Phong il vinile risultava slavato. Il resto usa Phong, più leggero. */}
        <meshStandardMaterial color="#0d151b" roughness={0.28} metalness={0.35} />
      </mesh>

      <Grooves count={grooves} />

      {/* Etichetta */}
      <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[LABEL_RADIUS, 64]} />
        <meshPhongMaterial
          color={CYAN}
          emissive={CYAN}
          emissiveIntensity={0.35}
          shininess={30}
        />
      </mesh>

      {/* Anello dell'etichetta */}
      <mesh position={[0, 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[LABEL_RADIUS * 0.95, LABEL_RADIUS, 64]} />
        <meshBasicMaterial color="#06222a" transparent opacity={0.55} />
      </mesh>

      {/* Foro del perno */}
      <mesh position={[0, 0.034, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.055, 24]} />
        <meshBasicMaterial color="#06222a" />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------------------- onde */

const RIPPLE_COUNT = 6

type Ripple = { life: number; x: number; z: number }

/**
 * Onde che si allargano dove passa il puntatore sul vinile: è l'interazione
 * "sopra al disco". Pool fisso di mesh riusate, nessun `setState` per frame.
 */
function Ripples({
  register,
}: {
  register: (spawn: (x: number, z: number) => void) => void
}) {
  const meshes = useRef<(THREE.Mesh | null)[]>([])
  const ripples = useRef<Ripple[]>(
    Array.from({ length: RIPPLE_COUNT }, () => ({ life: 1, x: 0, z: 0 })),
  )
  const cursor = useRef(0)

  useEffect(() => {
    register((x: number, z: number) => {
      const slot = cursor.current % RIPPLE_COUNT
      cursor.current += 1
      ripples.current[slot] = { life: 0, x, z }
    })
  }, [register])

  useFrame((_, delta) => {
    ripples.current.forEach((ripple, index) => {
      const mesh = meshes.current[index]
      if (!mesh) return
      if (ripple.life >= 1) {
        mesh.visible = false
        return
      }
      ripple.life = Math.min(1, ripple.life + delta * 1.1)
      mesh.visible = true
      mesh.position.set(ripple.x, 0.036, ripple.z)
      mesh.scale.setScalar(0.12 + ripple.life * 0.85)
      const material = mesh.material as THREE.MeshBasicMaterial
      material.opacity = (1 - ripple.life) ** 1.6 * 0.75
    })
  })

  return (
    <group>
      {Array.from({ length: RIPPLE_COUNT }, (_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            meshes.current[index] = node
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.82, 1, 64]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------- orbite */

/** Anelli inclinati e satelliti che girano attorno al disco. */
function Orbits({ compact }: { compact: boolean }) {
  const first = useRef<THREE.Group>(null)
  const second = useRef<THREE.Group>(null)
  const moonA = useRef<THREE.Mesh>(null)
  const moonB = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (first.current) first.current.rotation.z = t * 0.14
    if (second.current) second.current.rotation.z = -t * 0.09
    if (moonA.current) {
      moonA.current.position.set(
        Math.cos(t * 0.55) * 2.75,
        Math.sin(t * 0.55) * 0.35,
        Math.sin(t * 0.55) * 2.75,
      )
    }
    if (moonB.current) {
      moonB.current.position.set(
        Math.cos(-t * 0.38 + 1.6) * 3.2,
        Math.sin(-t * 0.38 + 1.6) * 0.9,
        Math.sin(-t * 0.38 + 1.6) * 3.2,
      )
    }
  })

  return (
    <group>
      <group ref={first} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.75, 0.006, 6, compact ? 80 : 120]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.55} />
        </mesh>
      </group>

      <group ref={second} rotation={[Math.PI / 2.6, 0.5, 0.3]}>
        <mesh>
          <torusGeometry args={[3.2, 0.004, 6, compact ? 80 : 120]} />
          <meshBasicMaterial color={BLUE} transparent opacity={0.4} />
        </mesh>
      </group>

      <mesh ref={moonA}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial color={CYAN} />
      </mesh>
      <mesh ref={moonB}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color={BLUE} />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- braccio */

/** Perno del braccio, in coordinate del piatto. */
const ARM_PIVOT = new THREE.Vector2(2.1, -2.0)
const ARM_LENGTH = 2.4
const ARM_REST_RADIUS = 1.86

/**
 * Angolo del braccio che fa cadere la testina esattamente sul raggio `target`.
 *
 * Il perno sta a distanza R dal centro, il braccio è lungo L e punta lungo +X
 * ruotato di `a` attorno a Y — in Three.js quel versore è `(cos a, −sin a)` sul
 * piano XZ. Imponendo `|P + L·u| = target` si ottiene
 * `R·cos(a + φ) = (target² − R² − L²) / (2L)`, con `φ = atan2(Pz, Px)`.
 *
 * Delle due soluzioni si prende quella che porta la testina sul bordo vicino al
 * perno: è la posa naturale di un braccio, non quella "a scavalco".
 */
function armAngleFor(target: number): number {
  const R = ARM_PIVOT.length()
  const phi = Math.atan2(ARM_PIVOT.y, ARM_PIVOT.x)
  const k = (target * target - R * R - ARM_LENGTH * ARM_LENGTH) / (2 * ARM_LENGTH * R)
  return -phi - Math.acos(Math.min(1, Math.max(-1, k)))
}

/** Braccio con testina: insegue il raggio toccato dal puntatore sul disco. */
function ToneArm({ radius }: { radius: React.RefObject<number> }) {
  const arm = useRef<THREE.Group>(null)
  const current = useRef(armAngleFor(ARM_REST_RADIUS))

  useFrame(() => {
    if (!arm.current) return
    const target = armAngleFor(radius.current ?? ARM_REST_RADIUS)
    current.current += (target - current.current) * 0.07
    arm.current.rotation.y = current.current
  })

  return (
    <group position={[ARM_PIVOT.x, 0.2, ARM_PIVOT.y]}>
      {/* Base del perno */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.16, 0.19, 0.16, 24]} />
        <meshPhongMaterial color="#16222b" shininess={70} specular="#4a7c90" />
      </mesh>

      <group ref={arm}>
        <mesh position={[ARM_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, ARM_LENGTH, 12]} />
          <meshPhongMaterial color="#c4d3de" shininess={110} specular="#ffffff" />
        </mesh>

        {/* Testina */}
        <mesh position={[ARM_LENGTH - 0.06, -0.06, 0]}>
          <boxGeometry args={[0.16, 0.1, 0.1]} />
          <meshPhongMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.9} />
        </mesh>
      </group>
    </group>
  )
}

/* ---------------------------------------------------------------- pulviscolo */

/** Polvere sospesa attorno al disco: dà profondità al vuoto. */
function Dust({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const random = seeded(20260908)
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const radius = 1.6 + random() * 3.4
      const angle = random() * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (random() - 0.5) * 2.6
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return buffer
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    if (!points.current) return
    points.current.rotation.y += delta * 0.03
    points.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.08
  })

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.028}
        color={CYAN}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* -------------------------------------------------------- qualità adattiva */

/** 0 = tutto, 1 = senza pulviscolo e a risoluzione piena 1×, 2 = essenziale. */
type QualityLevel = 0 | 1 | 2

/**
 * Rete di sicurezza sui fotogrammi.
 *
 * Se la scena non regge i 60 fps per due secondi di fila, scende di un livello:
 * prima toglie il pulviscolo e abbassa il DPR, poi spegne anche le orbite. Su
 * una GPU normale non scatta mai; su hardware debole è ciò che tiene la pagina
 * fluida invece di lasciarla arrancare.
 */
function useAdaptiveQuality(): QualityLevel {
  const setDpr = useThree((state) => state.setDpr)
  const [level, setLevel] = useState<QualityLevel>(0)
  const window_ = useRef({ time: 0, frames: 0, slowSeconds: 0 })

  useFrame((_, delta) => {
    const w = window_.current
    w.time += delta
    w.frames += 1
    if (w.time < 1) return

    const fps = w.frames / w.time
    w.time = 0
    w.frames = 0

    if (fps < 50) {
      w.slowSeconds += 1
      if (w.slowSeconds >= 2) {
        w.slowSeconds = 0
        setLevel((current) => (current < 2 ? ((current + 1) as QualityLevel) : current))
      }
    } else {
      w.slowSeconds = 0
    }
  })

  useEffect(() => {
    if (level === 1) setDpr(1)
    if (level === 2) setDpr(0.85)
  }, [level, setDpr])

  return level
}

/* ------------------------------------------------------------------- scena */

function Turntable({
  active,
  compact,
  reduced,
}: {
  active: boolean
  compact: boolean
  reduced: boolean
}) {
  const rig = useRef<THREE.Group>(null)
  const platter = useRef<THREE.Group>(null)
  const keyLight = useRef<THREE.PointLight>(null)
  const cursorGlow = useRef<THREE.Mesh>(null)

  const pointer = useRef({ x: 0, y: 0 })
  const spin = useRef(0.42)
  const lastRipple = useRef({ x: 99, z: 99, time: 0 })
  // Raggio del solco sotto il puntatore: lo legge il braccio.
  const trackRadius = useRef(ARM_REST_RADIUS)
  const spawnRipple = useRef<(x: number, z: number) => void>(() => {})

  const { viewport } = useThree()
  const canvas = useThree((state) => state.gl.domElement)
  const quality = useAdaptiveQuality()
  const glowTexture = useMemo(() => createGlowTexture(), [])
  useEffect(() => () => glowTexture.dispose(), [glowTexture])

  /**
   * Spegne il bagliore sotto il puntatore e riporta il braccio a riposo.
   *
   * `onPointerOut` di R3F scatta solo se il puntatore si muove: uscendo dal
   * disco scorrendo la pagina non arriva mai, e il bagliore restava acceso
   * dove l'avevi lasciato. Qui lo si spegne anche quando il puntatore lascia
   * il canvas e quando la scena va in pausa.
   */
  const releasePointer = useCallback(() => {
    if (cursorGlow.current) cursorGlow.current.visible = false
    trackRadius.current = ARM_REST_RADIUS
  }, [])

  useEffect(() => {
    if (!active) releasePointer()
  }, [active, releasePointer])

  useEffect(() => {
    canvas.addEventListener('pointerleave', releasePointer)
    window.addEventListener('blur', releasePointer)
    return () => {
      canvas.removeEventListener('pointerleave', releasePointer)
      window.removeEventListener('blur', releasePointer)
    }
  }, [canvas, releasePointer])

  useFrame((state, delta) => {
    const platterNode = platter.current
    const rigNode = rig.current
    if (!platterNode || !rigNode) return

    if (reduced) {
      platterNode.rotation.y = 0.4
      rigNode.rotation.x = TILT
      rigNode.rotation.y = 0.12
      return
    }

    // Il piatto gira sempre; il puntatore lo accelera un po', come una mano
    // appoggiata sul disco.
    spin.current += (0.42 - spin.current) * 0.03
    platterNode.rotation.y += delta * spin.current

    // Parallax morbido dell'inclinazione.
    pointer.current.x += (state.pointer.x * 0.22 - pointer.current.x) * 0.05
    pointer.current.y += (state.pointer.y * 0.16 - pointer.current.y) * 0.05
    rigNode.rotation.x = TILT + pointer.current.y * 0.4
    rigNode.rotation.y = pointer.current.x * 0.7
    rigNode.position.x = pointer.current.x * 0.25

    // Luce che orbita: il riflesso scorre lungo il bordo del vinile.
    if (keyLight.current) {
      const t = state.clock.elapsedTime * 0.5
      keyLight.current.position.set(Math.cos(t) * 3.4, 2.4, Math.sin(t) * 3.4)
    }
  })

  /** Il puntatore tocca il vinile: accende il bagliore e lascia un'onda. */
  const handleMove = (event: {
    point: THREE.Vector3
    stopPropagation: () => void
  }) => {
    if (reduced) return
    const platterNode = platter.current
    if (!platterNode) return

    const local = platterNode.worldToLocal(event.point.clone())
    if (cursorGlow.current) {
      cursorGlow.current.visible = true
      cursorGlow.current.position.set(local.x, 0.037, local.z)
    }

    // Il braccio si sposta sul solco toccato.
    trackRadius.current = Math.min(
      1.92,
      Math.max(0.62, Math.hypot(local.x, local.z)),
    )

    const now = performance.now()
    const distance = Math.hypot(
      local.x - lastRipple.current.x,
      local.z - lastRipple.current.z,
    )
    if (distance > 0.22 && now - lastRipple.current.time > 90) {
      spawnRipple.current(local.x, local.z)
      lastRipple.current = { x: local.x, z: local.z, time: now }
      // Una carezza sul disco lo spinge appena.
      spin.current = Math.min(1.5, spin.current + 0.16)
    }
  }

  const scale = Math.min(1.05, viewport.width / 6.6)

  return (
    <group scale={scale}>
      {/* Alone dietro al disco */}
      <mesh position={[0, 0, -1.4]} scale={5.6}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {quality < 1 && <Dust count={compact ? 90 : 150} />}

      <group ref={rig} rotation={[TILT, 0, 0.12]}>
        {quality < 2 && <Orbits compact={compact} />}

        {/* Fuori dal piatto: il braccio è fermo, è il disco a girare. */}
        <ToneArm radius={trackRadius} />

        <group
          ref={platter}
          onPointerMove={handleMove}
          onPointerOut={releasePointer}
        >
          <Disc grooves={compact ? 16 : 32} />
          <Ripples
            register={(spawn) => {
              spawnRipple.current = spawn
            }}
          />

          {/* Bagliore sotto al puntatore */}
          <mesh
            ref={cursorGlow}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
            scale={0.34}
          >
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial
              map={glowTexture}
              transparent
              opacity={0.9}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      </group>

      {/* Due luci in tutto: l'ambiente dà il fondo, la puntiforme che orbita
          fa scorrere il riflesso sul bordo del vinile. */}
      {/* Tre luci in tutto: ambiente per il fondo, direzionale per il volume,
          puntiforme che orbita e fa scorrere il riflesso sul bordo. */}
      <ambientLight intensity={0.55} color="#9fd8e8" />
      <directionalLight position={[-3, 5, 2]} intensity={1.1} color="#eaf6ff" />
      <pointLight ref={keyLight} intensity={24} distance={12} color={CYAN} />
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
      /* Tetto al DPR: su schermi densi il costo cresce col quadrato. */
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 1.15, 6.2], fov: 40 }}
      gl={{
        // L'antialias serve solo dove non c'è già un DPR alto a mascherare le
        // scalettature: altrove è costo puro.
        antialias: !compact && (window.devicePixelRatio || 1) < 1.5,
        alpha: true,
        powerPreference: 'low-power',
      }}
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
      <Turntable active={active} compact={compact} reduced={reduced} />
    </Canvas>
  )
}
