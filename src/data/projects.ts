/**
 * Unica sorgente dei progetti mostrati nella griglia.
 *
 * Quello che non cambia fra le lingue (id, URL, immagini, tag, ordine) sta in
 * `PROJECT_BASE`; i testi tradotti stanno in `COPY`, una voce per lingua.
 * Per aggiungere, togliere o riordinare un progetto basta questo file.
 */

import type { Language } from './profile'

export type ProjectDetails = {
  overview: string
  features: string[]
  notes?: string[]
}

/** Parte indipendente dalla lingua. */
type ProjectBase = {
  id: string
  title: string
  tags: string[]
  repositoryUrl: string
  /** Compilare solo con una demo realmente verificata: altrimenti il pulsante non compare. */
  demoUrl?: string
  /** Percorso relativo a `public/`, risolto con la base path di Vite. */
  image: string
  imageKind: 'screenshot' | 'illustration'
  imageWidth: number
  imageHeight: number
  featured: boolean
  order: number
}

/** Parte tradotta. */
type ProjectCopy = {
  label: string
  description: string
  imageAlt: string
  details?: ProjectDetails
}

export type Project = ProjectBase & ProjectCopy

const PROJECT_BASE: ProjectBase[] = [
  {
    id: 'solco',
    title: 'Solco',
    tags: ['React', 'Three.js', 'Spring Security'],
    repositoryUrl: 'https://github.com/JusTMeth25/FS0226IT---U5W7D2',
    // Verificata il 2026-09-22: frontend su GitHub Pages, API su Render.
    demoUrl: 'https://justmeth25.github.io/FS0226IT---U5W7D2/',
    image: 'images/projects/solco.jpg',
    imageKind: 'screenshot',
    imageWidth: 1200,
    imageHeight: 750,
    featured: true,
    order: 1,
  },
  {
    id: 'nova',
    title: 'Nova',
    tags: ['React', 'Spring Boot', 'PostgreSQL'],
    repositoryUrl: 'https://github.com/JusTMeth25/FS0226IT---U5W6D3',
    image: 'images/projects/nova.jpg',
    imageKind: 'screenshot',
    imageWidth: 1200,
    imageHeight: 750,
    featured: true,
    order: 2,
  },
  {
    id: 'vinyldex',
    title: 'VinylDex',
    tags: ['React', 'Spring Boot', 'WebSocket'],
    repositoryUrl: 'https://github.com/JusTMeth25/FS0226IT--CAPSTONE',
    // Verificata il 2026-10-28: frontend e API sullo stesso server (Docker Compose + Caddy).
    demoUrl: 'https://vinyldex.duckdns.org',
    image: 'images/projects/vinyldex.jpg',
    imageKind: 'screenshot',
    imageWidth: 1200,
    imageHeight: 750,
    featured: true,
    order: 3,
  },
]

const COPY: Record<Language, Record<string, ProjectCopy>> = {
  it: {
    solco: {
      label: 'EPICODE · U5W7D2',
      description:
        'Vetrina di vinili con tre livelli di accesso e giradischi 3D.',
      imageAlt:
        'Screenshot di Solco: titolo “Ogni disco ha un solco da raccontare” e, a destra, un disco 3D che esce dalla sua copertina.',
      details: {
        overview:
          'Sito vetrina full stack per un negozio di dischi, con tre livelli di accesso: ospite, utente registrato e amministratore. Stessi indirizzi, risposte diverse: è il backend Spring Boot a decidere cosa vede ognuno, il frontend React mostra solo quello che riceve.',
        features: [
          'Sicurezza su tre livelli con Spring Security e JWT: catena dei filtri (401), @PreAuthorize sulle operazioni da amministratore (403) e query ristrette al proprietario per i preferiti (404).',
          'Bozze e campi riservati, come prezzo d’acquisto e fornitore, non escono dal server se chi li chiede non è amministratore.',
          'Giradischi 3D in Three.js con braccio animato, 33⅓ e 45 giri e anteprime di 30 secondi da iTunes, con scratch a velocità variabile tramite AudioWorklet.',
          'Area riservata per l’amministratore: pubblicare o riportare in bozza, creare, modificare ed eliminare i dischi.',
        ],
        notes: [
          'La demo online usa un database H2 in memoria su Render: a ogni riavvio i dati tornano quelli iniziali.',
          'Il backend gratuito si sospende dopo circa 15 minuti senza visite: la prima apertura può richiedere fino a un minuto.',
        ],
      },
    },
    nova: {
      label: 'EPICODE · U5W6D3',
      description:
        'Clone di ChatGPT: chat salvate, streaming e conteggio dei token.',
      imageAlt:
        'Screenshot di Nova: barra laterale con le chat salvate, saluto dell’agente e campo per scrivere il messaggio.',
      details: {
        overview:
          'Applicazione full stack per conversare con un agente AI. Frontend in React e TypeScript, backend in Spring Boot con PostgreSQL; il modello è un NVIDIA Nemotron gratuito raggiunto tramite OpenRouter, chiamato solo dal backend.',
        features: [
          'Più conversazioni salvate nel database: crea, rinomina, cerca ed elimina, con titolo generato dal primo messaggio.',
          'Risposte in streaming con Server-Sent Events, pulsante Stop e Rigenera, rendering Markdown con evidenziazione del codice.',
          'Contesto inviato a ogni richiesta con gli ultimi 20 messaggi (configurabile) e personalità dell’agente in un file di istruzioni.',
          'Token consumati registrati per ogni chiamata; nuovi tentativi e modelli di riserva quando il modello gratuito è sovraccarico.',
        ],
        notes: [
          'La chiave OpenRouter resta sul server, in una variabile d’ambiente: il browser non la riceve mai.',
          'Per avviarlo servono Java 25, PostgreSQL e una chiave OpenRouter personale.',
        ],
      },
    },
    vinyldex: {
      label: 'EPICODE · CAPSTONE',
      description:
        'Gioco di carte collezionabili con hotel in pixel art.',
      imageAlt:
        'Screenshot della home di VinylDex: titolo “Ogni carta, un assolo”, un gatto rocker con la chitarra elettrica e, a sinistra, il menu del gioco.',
      details: {
        overview:
          'Progetto finale del corso: un gioco di carte collezionabili full stack, online. Backend in Java 25 con Spring Boot 4.1 e PostgreSQL (schema versionato con Flyway), frontend in React 19 con Vite, in produzione con Docker Compose e Caddy.',
        features: [
          'Il server decide tutto ciò che ha valore: carte estratte, probabilità, ricompense ed esiti delle partite. I gold passano solo da un servizio con blocco della riga e registro dei movimenti.',
          'Hotel in pixel art in tempo reale via WebSocket: stanze isometriche, avatar, chat e NPC con intelligenza artificiale.',
          'Oltre 140.000 carte da 23 fonti importate da API pubbliche, apertura dei pacchetti in 3D con Three.js, raccoglitore da sfogliare, mercato e scambi fra giocatori.',
          'Battaglie a 3 carte contro NPC o online in tempo reale e torneo a eliminazione diretta da 16 posti.',
          'Sicurezza: JWT in cookie HttpOnly con protezione CSRF, verifica in due passaggi (TOTP), accesso con Google, freno ai tentativi e Content-Security-Policy.',
        ],
        notes: [
          'Solo gold di gioco: nessun denaro reale. Le carte dei giochi importati restano dei rispettivi proprietari.',
          'Il repository dichiara 296 test backend (JUnit) e 147 frontend (Vitest), eseguiti in CI con GitHub Actions: non li ho rilanciati io, quindi non riporto risultati.',
          'Il frontend è anche un’app iOS e Android con Capacitor.',
        ],
      },
    },
  },

  en: {
    solco: {
      label: 'EPICODE · U5W7D2',
      description: 'Vinyl showcase with three access levels and a 3D turntable.',
      imageAlt:
        'Screenshot of Solco: the Italian headline “Ogni disco ha un solco da raccontare” and, on the right, a 3D record sliding out of its sleeve.',
      details: {
        overview:
          'A full-stack showcase site for a record shop with three access levels: guest, registered user and administrator. Same URLs, different answers: the Spring Boot backend decides what each visitor sees, and the React frontend only shows what it receives.',
        features: [
          'Three layers of security with Spring Security and JWT: the filter chain (401), @PreAuthorize on admin operations (403) and owner-scoped queries for favourites (404).',
          'Drafts and restricted fields, such as purchase price and supplier, never leave the server unless the caller is an administrator.',
          'A 3D turntable in Three.js with an animated tonearm, 33⅓ and 45 rpm and 30-second iTunes previews, with variable-speed scratching through an AudioWorklet.',
          'An admin area to publish or unpublish, create, edit and delete records.',
        ],
        notes: [
          'The live demo runs on an in-memory H2 database on Render: every restart resets the data.',
          'The free backend sleeps after about 15 minutes without visits: the first load can take up to a minute.',
        ],
      },
    },
    nova: {
      label: 'EPICODE · U5W6D3',
      description:
        'A ChatGPT clone: saved chats, streaming and token counting.',
      imageAlt:
        'Screenshot of Nova: sidebar with saved chats, the agent’s greeting and the message input.',
      details: {
        overview:
          'A full-stack app for chatting with an AI agent. React and TypeScript on the frontend, Spring Boot with PostgreSQL on the backend; the model is a free NVIDIA Nemotron reached through OpenRouter, called only from the backend.',
        features: [
          'Multiple conversations stored in the database: create, rename, search and delete, with a title generated from the first message.',
          'Streamed answers over Server-Sent Events, Stop and Regenerate buttons, Markdown rendering with code highlighting.',
          'Context sent with every request using the last 20 messages (configurable), and the agent’s personality defined in an instructions file.',
          'Token usage recorded for every call; automatic retries and fallback models when the free model is overloaded.',
        ],
        notes: [
          'The OpenRouter key stays on the server in an environment variable: the browser never receives it.',
          'Running it requires Java 25, PostgreSQL and a personal OpenRouter key.',
        ],
      },
    },
    vinyldex: {
      label: 'EPICODE · CAPSTONE',
      description:
        'A music-themed collectible card game with a real-time pixel-art hotel.',
      imageAlt:
        'Screenshot of the VinylDex home page: the Italian headline “Ogni carta, un assolo”, a rocker cat with an electric guitar and the game menu on the left.',
      details: {
        overview:
          'The final project of the course: a full-stack collectible card game, live online. Java 25 backend with Spring Boot 4.1 and PostgreSQL (schema versioned with Flyway), React 19 frontend with Vite, deployed with Docker Compose and Caddy.',
        features: [
          'The server decides everything that has value: card draws, odds, rewards and match results. Gold only moves through one service, with row locking and a ledger of every transaction.',
          'A real-time pixel-art hotel over WebSocket: isometric rooms, avatars, chat and AI-driven NPCs.',
          'More than 140,000 cards from 23 sources imported from public APIs, 3D pack opening with Three.js, a binder you can flip through, a marketplace and player-to-player trades.',
          'Three-card battles against NPCs or online in real time, plus a 16-player knockout tournament.',
          'Security: JWT in an HttpOnly cookie with CSRF protection, two-factor authentication (TOTP), Google sign-in, login rate limiting and a Content-Security-Policy.',
        ],
        notes: [
          'In-game gold only: no real money. Cards from imported games belong to their respective owners.',
          'The repository reports 296 backend tests (JUnit) and 147 frontend tests (Vitest), run in CI with GitHub Actions: I did not rerun them myself, so I report no results.',
          'The frontend also ships as an iOS and Android app with Capacitor.',
        ],
      },
    },
  },
}

/** Progetti nella lingua richiesta. */
export function getProjects(language: Language): Project[] {
  return PROJECT_BASE.map((base) => ({ ...base, ...COPY[language][base.id] }))
}

/** Progetti in evidenza, ordinati per `order`. */
export function getFeaturedProjects(list: Project[]): Project[] {
  return list
    .filter((project) => project.featured)
    .sort((a, b) => a.order - b.order)
}
