import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { useI18n } from '../i18n/useI18n'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { asset } from '../lib/asset'
import './profile-card.css'

/**
 * Carta del profilo che si gira: davanti la foto, dietro la versione
 * illustrata.
 *
 * È un `<button>` vero, non un div con un click sopra: si raggiunge con Tab,
 * risponde a Invio e Spazio e dichiara lo stato con `aria-pressed`. Le due
 * immagini stanno sempre nel DOM, così chi usa uno screen reader trova
 * entrambe le descrizioni; quella nascosta è tolta dal flusso con
 * `visibility`, che la esclude anche dalla lettura.
 *
 * Con `prefers-reduced-motion` non c'è rotazione: le due facce si scambiano
 * con una dissolvenza.
 */
export function ProfileCard() {
  const { profile } = useI18n()
  const { photos, flip } = profile.about
  const reduced = usePrefersReducedMotion()
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      className="profile-card"
      data-flipped={flipped}
      data-reduced={reduced}
      aria-pressed={flipped}
      aria-label={flipped ? flip.toFront : flip.toBack}
      onClick={() => setFlipped((value) => !value)}
    >
      <span className="profile-card__inner">
        <span className="profile-card__face profile-card__face--front">
          <img
            src={asset(photos.front.src)}
            alt={photos.front.alt}
            width={photos.front.width}
            height={photos.front.height}
            loading="lazy"
            decoding="async"
          />
        </span>

        <span className="profile-card__face profile-card__face--back">
          <img
            src={asset(photos.back.src)}
            alt={photos.back.alt}
            width={photos.back.width}
            height={photos.back.height}
            loading="lazy"
            decoding="async"
          />
        </span>
      </span>

      <span className="profile-card__hint mono" aria-hidden="true">
        <RefreshCw className="icon" />
        {flip.hint}
      </span>
    </button>
  )
}
