import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useI18n } from '../../i18n/useI18n'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { INTRO_DURATION_MS, createIntroScene } from './introScene'
import './intro.css'

type IntroProps = {
  /** Chiamata quando il velo non è più di scena (anche se non è mai comparso). */
  onFinish?: () => void
}

/**
 * Sequenza d'apertura, a ogni caricamento della pagina.
 *
 * Una linea di luce si apre in un disco, la puntina scende, la polvere si
 * solleva e il vinile passa oltre la camera lasciando la hero.
 *
 * Non è uno splash bloccante:
 * - il contenuto del sito è già nel DOM sotto il velo, che è `aria-hidden`;
 * - si chiude con un click, con qualsiasi tasto o a fine sequenza (3,4 s);
 * - con `prefers-reduced-motion: reduce` non compare affatto;
 * - il bagliore finale è una singola campana di luminosità, non un lampeggio.
 */
export function Intro({ onFinish }: IntroProps) {
  const { profile } = useI18n()
  const { intro } = profile
  const reduced = usePrefersReducedMotion()
  const [dismissed, setDismissed] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const visible = !reduced && !dismissed

  const close = useCallback(() => setDismissed(true), [])

  // Il resto della pagina aspetta qui: finché l'intro è di scena, la scena 3D
  // e lo sfondo animato restano fermi e non rubano fotogrammi.
  useEffect(() => {
    if (!visible) onFinish?.()
  }, [visible, onFinish])

  // Ciclo di rendering della scena.
  useEffect(() => {
    if (!visible) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const scene = createIntroScene(canvas, context)
    const started = performance.now()
    let frame = 0
    let lastCounter = -1

    function step(now: number) {
      const elapsed = now - started
      scene.render(elapsed)

      // Contatore 000 → 100 scritto nel DOM, senza re-render di React.
      const value = Math.min(100, Math.round((elapsed / INTRO_DURATION_MS) * 100))
      if (value !== lastCounter && counterRef.current) {
        counterRef.current.textContent = String(value).padStart(3, '0')
        lastCounter = value
      }

      if (elapsed >= INTRO_DURATION_MS) {
        close()
        return
      }
      frame = window.requestAnimationFrame(step)
    }

    const onResize = () => scene.resize()
    window.addEventListener('resize', onResize)
    frame = window.requestAnimationFrame(step)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [visible, close])

  // Uscite manuali e blocco dello scroll.
  useEffect(() => {
    if (!visible) return

    const onKeyDown = () => close()
    const onPointerDown = () => close()
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    skipRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      document.body.style.overflow = previousOverflow
    }
  }, [visible, close])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.18 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <canvas
            ref={canvasRef}
            className="intro__canvas"
            role="img"
            aria-label={intro.ariaLabel}
          />

          <div className="intro__hud" aria-hidden="true">
            <motion.span
              className="intro__hud-item intro__hud-item--tl mono"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              {intro.name}
            </motion.span>

            <motion.span
              className="intro__hud-item intro__hud-item--tr mono"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              {intro.edition}
            </motion.span>

            <motion.span
              className="intro__hud-item intro__hud-item--bl mono"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              {intro.role}
            </motion.span>

            <motion.span
              className="intro__hud-item intro__hud-item--br mono"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <span ref={counterRef}>000</span>
              <span className="intro__hud-slash">/</span>100
            </motion.span>

            <motion.span
              className="intro__cue mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.6, delay: 1.7, times: [0, 0.2, 0.7, 1] }}
            >
              {intro.cue}
            </motion.span>
          </div>

          <div className="intro__progress" aria-hidden="true">
            <motion.span
              className="intro__progress-fill"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: INTRO_DURATION_MS / 1000, ease: 'linear' }}
            />
          </div>

          <button
            ref={skipRef}
            type="button"
            className="intro__skip"
            onClick={close}
          >
            {intro.skipLabel}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
