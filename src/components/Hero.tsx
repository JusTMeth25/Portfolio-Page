import { motion } from 'motion/react'
import { ArrowDown, FolderGit2 } from 'lucide-react'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'

import { profile } from '../data/profile'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { Equalizer } from './effects/Equalizer'
import { HeroFallback } from './effects/HeroFallback'
import './hero.css'

const HeroScene = lazy(() => import('./effects/HeroScene'))

/** WebGL disponibile? Se no, resta la composizione SVG. */
function detectWebGL(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

const { hero } = profile

export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [sceneEnabled, setSceneEnabled] = useState(false)
  const [sceneBroken, setSceneBroken] = useState(false)
  const [visible, setVisible] = useState(true)
  const [documentVisible, setDocumentVisible] = useState(true)

  const reduced = usePrefersReducedMotion()
  const compact = useMediaQuery('(max-width: 900px)')
  const coarse = useMediaQuery('(pointer: coarse)')

  // Il 3D parte solo dopo il primo paint del testo, e solo se WebGL c'è.
  useEffect(() => {
    if (!detectWebGL()) return
    const id = window.setTimeout(() => setSceneEnabled(true), 120)
    return () => window.clearTimeout(id)
  }, [])

  // Rendering in pausa fuori dal viewport.
  useEffect(() => {
    const node = stageRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.05 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Rendering in pausa quando la tab non è visibile.
  useEffect(() => {
    const onChange = () => setDocumentVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  // Su schermi piccoli e con puntatore grosso restiamo sulla composizione SVG:
  // niente bundle Three.js da scaricare su mobile.
  const showScene = sceneEnabled && !sceneBroken && !compact
  const sceneActive = visible && documentVisible && !reduced && !coarse

  const titleTransition = (index: number) => ({
    duration: reduced ? 0 : 0.62,
    delay: reduced ? 0 : 0.06 + index * 0.09,
    ease: [0.22, 0.61, 0.36, 1] as const,
  })

  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">{hero.eyebrow}</p>

          <h1 id="hero-title" className="hero__title">
            {hero.titleLines.map((line, index) => (
              <motion.span
                key={line}
                className="hero__title-line"
                initial={reduced ? false : { opacity: 0, y: '0.35em' }}
                animate={{ opacity: 1, y: '0em' }}
                transition={titleTransition(index)}
              >
                <span
                  className={line === hero.accentWord ? 'text-accent' : undefined}
                >
                  {line}
                </span>
              </motion.span>
            ))}
          </h1>

          <p className="hero__description">{hero.description}</p>
          <p className="hero__stack mono">{hero.stack}</p>

          <div className="hero__actions">
            <a className="btn btn--primary" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <ArrowDown className="icon" aria-hidden="true" />
            </a>
            <a
              className="btn btn--ghost"
              href={hero.secondaryCta.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              <FolderGit2 className="icon" aria-hidden="true" />
              {hero.secondaryCta.label}
              <span className="visually-hidden">(si apre in una nuova scheda)</span>
            </a>
          </div>

          <div className="hero__eq">
            <Equalizer bars={26} />
          </div>

          <p className="hero__note">{hero.note}</p>
        </div>

        <div className="hero__stage" ref={stageRef}>
          <div className="hero__canvas" data-mode={showScene ? '3d' : 'svg'}>
            {showScene ? (
              <Suspense fallback={<HeroFallback />}>
                <HeroScene
                  active={sceneActive}
                  compact={compact}
                  onContextLost={() => setSceneBroken(true)}
                />
              </Suspense>
            ) : (
              <HeroFallback />
            )}
          </div>

          <ul className="hero__labels">
            {hero.sceneLabels.map((label) => (
              <li key={label} className="hero__label mono">
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
