import {
  BriefcaseBusiness,
  Check,
  Copy,
  Download,
  FolderGit2,
  Mail,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import type { ContactLink } from '../data/profile'
import { useI18n } from '../i18n/useI18n'
import { asset } from '../lib/asset'
import { Reveal } from './effects/Reveal'
import './contact.css'

const ICONS = {
  email: Mail,
  github: FolderGit2,
  linkedin: BriefcaseBusiness,
} as const

function iconFor(kind: ContactLink['kind']) {
  return ICONS[kind]
}

export function Contact() {
  const { profile } = useI18n()
  const { contact, cv } = profile
  const email = contact.links.find((link) => link.kind === 'email')?.value ?? ''
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle')

  useEffect(() => {
    if (copyState === 'idle') return
    const id = window.setTimeout(() => setCopyState('idle'), 3200)
    return () => window.clearTimeout(id)
  }, [copyState])

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard non disponibile')
      await navigator.clipboard.writeText(email)
      setCopyState('done')
    } catch {
      // Fallback onesto: nessuna finta conferma, si mostra l'indirizzo da copiare.
      setCopyState('failed')
    }
  }

  const cvHref = cv.available ? asset(cv.path) : cv.requestHref
  const cvLabel = cv.available ? cv.downloadLabel : cv.requestLabel
  const CvIcon = cv.available ? Download : Mail

  return (
    <section className="section" id="contatti" aria-labelledby="contatti-title">
      <div className="container">
        <Reveal className="contact">
          <p className="eyebrow">{contact.eyebrow}</p>
          <h2 className="contact__title" id="contatti-title">
            {contact.title}
          </h2>
          <p className="contact__text lede">{contact.text}</p>

          <ul className="contact__links">
            {contact.links.map((link) => {
              const Icon = iconFor(link.kind)
              const external = link.kind !== 'email'
              return (
                <li key={link.id}>
                  <a
                    className="contact__link"
                    href={link.href}
                    {...(external
                      ? { target: '_blank', rel: 'noreferrer noopener' }
                      : {})}
                  >
                    <Icon className="icon" aria-hidden="true" />
                    <span className="contact__link-label mono">{link.label}</span>
                    <span className="contact__link-value">{link.value}</span>
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="contact__actions">
            <button type="button" className="btn btn--small" onClick={handleCopy}>
              {copyState === 'done' ? (
                <Check className="icon" aria-hidden="true" />
              ) : (
                <Copy className="icon" aria-hidden="true" />
              )}
              {copyState === 'done' ? contact.copiedLabel : contact.copyLabel}
            </button>

            <a
              className="btn btn--small"
              href={cvHref}
              {...(cv.available
                ? { download: cv.fileName, target: '_blank', rel: 'noreferrer' }
                : {})}
            >
              <CvIcon className="icon" aria-hidden="true" />
              {cvLabel}
            </a>
          </div>

          <p className="contact__status" role="status">
            {copyState === 'done' && contact.copiedLabel}
            {copyState === 'failed' && contact.copyFallback}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
