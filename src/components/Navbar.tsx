import { Download, Mail, Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { profile } from '../data/profile'
import { asset } from '../lib/asset'
import './navbar.css'

const { nav, cv, monogram, name } = profile

export function Navbar() {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Escape chiude il menu mobile e riporta il focus sul pulsante.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const cvHref = cv.available ? asset(cv.path) : cv.requestHref
  const cvLabel = cv.available ? cv.downloadLabel : cv.requestLabel
  const CvIcon = cv.available ? Download : Mail

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <a className="navbar__brand" href="#hero" aria-label={`${name}, vai all'inizio`}>
          <span aria-hidden="true">{monogram.light}</span>
          <span aria-hidden="true" className="text-accent">
            {monogram.accent}
          </span>
        </a>

        <nav className="navbar__nav" aria-label={nav.menuLabel}>
          <ul id={menuId} className="navbar__list" data-open={open}>
            {nav.items.map((item) => (
              <li key={item.id}>
                <a
                  className="navbar__link"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="navbar__cta-mobile">
              <a
                className="btn btn--primary btn--small"
                href={cvHref}
                {...(cv.available
                  ? { download: cv.fileName, target: '_blank', rel: 'noreferrer' }
                  : {})}
                onClick={() => setOpen(false)}
              >
                <CvIcon className="icon" aria-hidden="true" />
                {cvLabel}
              </a>
            </li>
          </ul>
        </nav>

        <a
          className="btn btn--primary btn--small navbar__cta"
          href={cvHref}
          {...(cv.available
            ? { download: cv.fileName, target: '_blank', rel: 'noreferrer' }
            : {})}
        >
          <CvIcon className="icon" aria-hidden="true" />
          {cvLabel}
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? nav.closeLabel : nav.openLabel}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X className="icon" aria-hidden="true" />
          ) : (
            <Menu className="icon" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  )
}
