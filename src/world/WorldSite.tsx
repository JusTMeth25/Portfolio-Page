import {
  ArrowDown,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Disc3,
  Download,
  ExternalLink,
  FolderGit2,
  Mail,
  RotateCw,
} from 'lucide-react'
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { ProjectDetails } from '../components/ProjectDetails'
import type { ContactLink } from '../data/profile'
import { getFeaturedProjects } from '../data/projects'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useI18n } from '../i18n/useI18n'
import { asset } from '../lib/asset'
import { subscribeToTicker } from '../lib/ticker'
import { STATION_IDS, type StationId } from './layout'
import { focusOf, readProgress, registerSections } from './scrollProgress'
import type { WorldSelection } from './selection'
import './world.css'

const WorldCanvas = lazy(() => import('./WorldCanvas'))

type WorldSiteProps = {
  /** `true` a intro finita: prima di allora la tela WebGL non si monta. */
  ready: boolean
  onContextLost: () => void
}

/* ---------------------------------------------------------------- pezzi */

type StepperProps = {
  count: number
  index: number
  onChange: (index: number) => void
  label: string
}

/** Precedente / successivo, con il contatore "2 / 3". */
function Stepper({ count, index, onChange, label }: StepperProps) {
  const { world } = useI18n().profile
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="stepper__button"
        onClick={() => onChange((index - 1 + count) % count)}
        aria-label={world.previous}
      >
        <ChevronLeft className="icon" aria-hidden="true" />
      </button>
      <span className="stepper__count mono" aria-live="polite">
        {index + 1} / {count}
      </span>
      <button
        type="button"
        className="stepper__button"
        onClick={() => onChange((index + 1) % count)}
        aria-label={world.next}
      >
        <ChevronRight className="icon" aria-hidden="true" />
      </button>
    </div>
  )
}

type StationProps = {
  id: StationId
  labelledBy: string
  register: (id: StationId, node: HTMLElement | null) => void
  children: ReactNode
  wide?: boolean
}

function Station({ id, labelledBy, register, children, wide = false }: StationProps) {
  return (
    <section
      className="station"
      id={id}
      data-station={id}
      aria-labelledby={labelledBy}
      ref={(node) => register(id, node)}
    >
      <div className={wide ? 'station__caption station__caption--wide' : 'station__caption'}>
        {children}
      </div>
    </section>
  )
}

const CONTACT_ICONS = {
  email: Mail,
  github: FolderGit2,
  linkedin: BriefcaseBusiness,
} as const

function externalProps(link: ContactLink) {
  return link.kind === 'email' ? {} : { target: '_blank', rel: 'noreferrer noopener' }
}

/* ------------------------------------------------------------ componente */

/**
 * Il sito in versione "mondo 3D".
 *
 * Sopra: il testo vero, in HTML, diviso in stazioni (una per sezione). Ogni
 * stazione resta ferma sullo schermo finché la telecamera è lì, poi sfuma.
 * Sotto: la tela WebGL fissa, con il disco, il solco e le dashboard.
 *
 * Il testo resta la fonte di verità: link, pulsanti e contenuti sono tutti
 * raggiungibili da tastiera e screen reader; il 3D li accompagna.
 */
export function WorldSite({ ready, onContextLost }: WorldSiteProps) {
  const { profile, projects } = useI18n()
  const { hero, ui, world, about, timeline, skills, interests, contact, cv } = profile
  const featured = useMemo(() => getFeaturedProjects(projects), [projects])
  const compact = useMediaQuery('(max-width: 900px)')

  /* --- scelte condivise con la scena --- */
  const [project, setProjectState] = useState(0)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [photoBack, setPhotoBack] = useState(false)
  const [entry, setEntry] = useState(timeline.entries[0]?.id ?? '')
  const [group, setGroup] = useState(skills.groups[0]?.id ?? '')
  const [playing, setPlaying] = useState(interests.items[0]?.id ?? '')

  const setProject = useCallback((index: number) => {
    setProjectState(index)
    setDetailsOpen(false)
  }, [])

  const selection = useMemo<WorldSelection>(
    () => ({
      project,
      setProject,
      openProjectDetails: () => setDetailsOpen(true),
      photoBack,
      togglePhoto: () => setPhotoBack((value) => !value),
      entry,
      setEntry,
      group,
      setGroup,
      playing,
      setPlaying,
    }),
    [project, setProject, photoBack, entry, group, playing],
  )

  /* --- sezioni e avanzamento --- */
  const nodes = useRef<Partial<Record<StationId, HTMLElement>>>({})
  const rail = useRef<HTMLOListElement>(null)

  const register = useCallback((id: StationId, node: HTMLElement | null) => {
    if (node) nodes.current[id] = node
    else delete nodes.current[id]
  }, [])

  useEffect(() => {
    const list = STATION_IDS.map((id) => nodes.current[id]).filter(
      (node): node is HTMLElement => Boolean(node),
    )
    registerSections(list)

    // Ogni fotogramma: il pannello di testo della stazione corrente è a fuoco,
    // gli altri sfumano; la tracklist laterale segna dove siamo.
    let last = -1
    const unsubscribe = subscribeToTicker(() => {
      const progress = readProgress()
      if (Math.abs(progress - last) < 0.0005) return
      last = progress
      list.forEach((node, index) => {
        const focus = focusOf(progress, index)
        node.style.setProperty('--focus', focus.toFixed(3))
        node.dataset.focus = focus > 0.35 ? 'on' : 'off'
      })
      const current = Math.round(progress)
      rail.current?.querySelectorAll('a').forEach((link, index) => {
        if (index === current) link.setAttribute('aria-current', 'step')
        else link.removeAttribute('aria-current')
      })
    })
    return () => {
      unsubscribe()
      registerSections([])
    }
  }, [])

  /* --- tela WebGL --- */
  const [canvasOn, setCanvasOn] = useState(false)
  const [documentVisible, setDocumentVisible] = useState(true)

  useEffect(() => {
    void import('./WorldCanvas')
  }, [])

  useEffect(() => {
    if (!ready) return
    const id = window.setTimeout(() => setCanvasOn(true), 120)
    return () => window.clearTimeout(id)
  }, [ready])

  useEffect(() => {
    const onChange = () => setDocumentVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  /* --- contatti --- */
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
      setCopyState('failed')
    }
  }

  const cvHref = cv.available ? asset(cv.path) : cv.requestHref
  const cvLabel = cv.available ? cv.downloadLabel : cv.requestLabel
  const CvIcon = cv.available ? Download : Mail

  const detailsId = useId()
  const current = featured[project]
  const activeEntry = timeline.entries.find((item) => item.id === entry) ?? timeline.entries[0]
  const activeGroup = skills.groups.find((item) => item.id === group) ?? skills.groups[0]
  const relatedTitles = (activeGroup?.relatedProjectIds ?? [])
    .map((id) => projects.find((item) => item.id === id)?.title)
    .filter(Boolean)
    .join(', ')

  return (
    <div className="world" data-compact={compact}>
      <div className="world__canvas" role="img" aria-label={world.sceneLabel}>
        {canvasOn ? (
          <Suspense fallback={<p className="world__loading mono">{world.loading}</p>}>
            <WorldCanvas
              active={documentVisible}
              compact={compact}
              selection={selection}
              onContextLost={onContextLost}
            />
          </Suspense>
        ) : (
          <p className="world__loading mono">{world.loading}</p>
        )}
      </div>

      <nav className="world__rail" aria-label="Tracklist">
        <ol ref={rail}>
          {STATION_IDS.map((id) => (
            <li key={id}>
              <a href={`#${id}`}>
                <span className="world__rail-dot" aria-hidden="true" />
                <span className="world__rail-label mono">{world.stations[id]}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <main id="main" className="world__stations">
        {/* ------------------------------------------------------- hero */}
        <Station id="hero" labelledBy="hero-title" register={register} wide>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title" className="station__hero-title">
            {hero.titleLines.map((line) => (
              <span key={line} className={line === hero.accentWord ? 'text-accent' : undefined}>
                {line}
              </span>
            ))}
          </h1>
          <p className="station__lede">{hero.description}</p>
          <p className="station__stack mono">{hero.stack}</p>
          <div className="station__actions">
            <a className="btn btn--primary" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <ArrowDown className="icon" aria-hidden="true" />
            </a>
            <a className="btn btn--ghost" href={hero.secondaryCta.href} target="_blank" rel="noreferrer noopener">
              <FolderGit2 className="icon" aria-hidden="true" />
              {hero.secondaryCta.label}
              <span className="visually-hidden">{ui.newTab}</span>
            </a>
          </div>
          <p className="station__note">{hero.note}</p>
          <p className="station__hint mono" aria-hidden="true">
            <Disc3 className="icon" /> {world.scrollHint}
          </p>
        </Station>

        {/* --------------------------------------------------- progetti */}
        <Station id="progetti" labelledBy="progetti-title" register={register}>
          <p className="eyebrow">{profile.projectsSection.eyebrow}</p>
          <h2 id="progetti-title" className="station__title">
            {profile.projectsSection.title}
          </h2>

          {current ? (
            <article className="station__card" aria-live="polite">
              <p className="station__label mono">{current.label}</p>
              <h3 className="station__card-title">{current.title}</h3>
              <p>{current.description}</p>
              <ul className="station__chips" aria-label={ui.technologies}>
                {current.tags.map((tag) => (
                  <li key={tag} className="mono">
                    {tag}
                  </li>
                ))}
              </ul>
              <div className="station__actions">
                <a className="btn btn--small" href={current.repositoryUrl} target="_blank" rel="noreferrer noopener">
                  <FolderGit2 className="icon" aria-hidden="true" />
                  {ui.repository}
                  <span className="visually-hidden">
                    {ui.of} {current.title} {ui.newTab}
                  </span>
                </a>
                {current.demoUrl && (
                  <a className="btn btn--small btn--primary" href={current.demoUrl} target="_blank" rel="noreferrer noopener">
                    <ExternalLink className="icon" aria-hidden="true" />
                    {ui.liveDemo}
                    <span className="visually-hidden">
                      {ui.of} {current.title} {ui.newTab}
                    </span>
                  </a>
                )}
                {current.details && (
                  <button
                    type="button"
                    className="btn btn--small"
                    aria-expanded={detailsOpen}
                    aria-controls={detailsId}
                    onClick={() => setDetailsOpen((value) => !value)}
                  >
                    {detailsOpen ? ui.closeDetails : ui.details}
                    <ChevronDown
                      className="icon station__chevron"
                      data-open={detailsOpen}
                      aria-hidden="true"
                    />
                  </button>
                )}
              </div>
              {current.details && (
                <div className="station__details">
                  <ProjectDetails id={detailsId} details={current.details} hidden={!detailsOpen} />
                </div>
              )}
            </article>
          ) : (
            <p>{ui.emptyProjects}</p>
          )}

          {featured.length > 1 && (
            <Stepper count={featured.length} index={project} onChange={setProject} label={profile.projectsSection.title} />
          )}
          <p className="station__hint mono">{world.selectHint}</p>
        </Station>

        {/* ---------------------------------------------------- profilo */}
        <Station id="profilo" labelledBy="profilo-title" register={register}>
          <p className="eyebrow">{about.eyebrow}</p>
          <h2 id="profilo-title" className="station__title">
            {about.title}
          </h2>
          <div className="station__prose">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="visually-hidden">
            {about.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="station__actions">
            <button type="button" className="btn btn--small" onClick={selection.togglePhoto} aria-pressed={photoBack}>
              <RotateCw className="icon" aria-hidden="true" />
              {photoBack ? about.flip.toFront : about.flip.toBack}
            </button>
          </div>
        </Station>

        {/* --------------------------------------------------- percorso */}
        <Station id="percorso" labelledBy="percorso-title" register={register}>
          <p className="eyebrow">{timeline.eyebrow}</p>
          <h2 id="percorso-title" className="station__title">
            {timeline.title}
          </h2>
          <p className="station__intro">{timeline.intro}</p>
          <ul className="station__choices">
            {timeline.entries.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="station__choice"
                  data-kind={item.kind}
                  aria-pressed={item.id === entry}
                  onClick={() => setEntry(item.id)}
                >
                  <span className="station__choice-title">{item.organization}</span>
                  <span className="station__choice-meta mono">{item.period}</span>
                </button>
              </li>
            ))}
          </ul>
          {activeEntry && (
            <article className="station__card" aria-live="polite">
              <p className="station__label mono" data-kind={activeEntry.kind}>
                {ui.timelineKind[activeEntry.kind]} · {activeEntry.period}
              </p>
              <h3 className="station__card-title">{activeEntry.role}</h3>
              <p className="station__org">
                {activeEntry.organization}
                {activeEntry.place ? ` · ${activeEntry.place}` : ''}
              </p>
              <p>{activeEntry.description}</p>
            </article>
          )}
        </Station>

        {/* ------------------------------------------------- competenze */}
        <Station id="competenze" labelledBy="competenze-title" register={register}>
          <p className="eyebrow">{skills.eyebrow}</p>
          <h2 id="competenze-title" className="station__title">
            {skills.title}
          </h2>
          <p className="station__intro">{skills.note}</p>
          <ul className="station__tabs">
            {skills.groups.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="station__tab"
                  aria-pressed={item.id === group}
                  onClick={() => setGroup(item.id)}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
          {activeGroup && (
            <div className="station__card" aria-live="polite">
              <h3 className="station__card-title">{activeGroup.title}</h3>
              <ul className="station__chips">
                {activeGroup.items.map((item) => (
                  <li key={item} className="mono">
                    {item}
                  </li>
                ))}
              </ul>
              {relatedTitles && (
                <p className="station__related">
                  {ui.usedIn} <span>{relatedTitles}</span>
                </p>
              )}
            </div>
          )}
          <details className="station__more">
            <summary>
              {skills.certifications.title} ({skills.certifications.items.length})
            </summary>
            <ul>
              {skills.certifications.items.map((item) => (
                <li key={item} className="mono">
                  {item}
                </li>
              ))}
            </ul>
            <p className="station__note">{skills.certifications.note}</p>
          </details>
        </Station>

        {/* --------------------------------------------- colonna sonora */}
        <Station id="colonna-sonora" labelledBy="colonna-sonora-title" register={register}>
          <p className="eyebrow">{interests.eyebrow}</p>
          <h2 id="colonna-sonora-title" className="station__title">
            {interests.title}
          </h2>
          <p className="station__intro">{interests.text}</p>
          <ul className="station__choices">
            {interests.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="station__choice"
                  data-accent={item.accent}
                  aria-pressed={item.id === playing}
                  onClick={() => setPlaying(item.id)}
                  title={world.play}
                >
                  <span className="station__choice-title">{item.label}</span>
                  <span className="station__choice-meta">{item.note}</span>
                </button>
              </li>
            ))}
          </ul>
        </Station>

        {/* --------------------------------------------------- contatti */}
        <Station id="contatti" labelledBy="contatti-title" register={register}>
          <p className="eyebrow">{contact.eyebrow}</p>
          <h2 id="contatti-title" className="station__title">
            {contact.title}
          </h2>
          <p className="station__intro">{contact.text}</p>
          <ul className="station__links">
            {contact.links.map((link) => {
              const Icon = CONTACT_ICONS[link.kind]
              return (
                <li key={link.id}>
                  <a className="station__link" href={link.href} {...externalProps(link)}>
                    <Icon className="icon" aria-hidden="true" />
                    <span className="mono station__link-label">{link.label}</span>
                    <span className="station__link-value">{link.value}</span>
                  </a>
                </li>
              )
            })}
          </ul>
          <div className="station__actions">
            <button type="button" className="btn btn--small" onClick={handleCopy}>
              {copyState === 'done' ? (
                <Check className="icon" aria-hidden="true" />
              ) : (
                <Copy className="icon" aria-hidden="true" />
              )}
              {copyState === 'done' ? contact.copiedLabel : contact.copyLabel}
            </button>
            <a className="btn btn--small btn--primary" href={cvHref} {...(cv.available ? { download: cv.fileName } : {})}>
              <CvIcon className="icon" aria-hidden="true" />
              {cvLabel}
            </a>
          </div>
          <p className="station__status" role="status">
            {copyState === 'done' && contact.copiedLabel}
            {copyState === 'failed' && contact.copyFallback}
          </p>
        </Station>
      </main>
    </div>
  )
}
