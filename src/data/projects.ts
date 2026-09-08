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
    id: 'spotify-clone',
    title: 'Spotify Clone',
    tags: ['React', 'Redux Toolkit', 'Vite'],
    repositoryUrl:
      'https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-11',
    image: 'images/projects/spotify-clone.jpg',
    imageKind: 'screenshot',
    imageWidth: 1200,
    imageHeight: 750,
    featured: true,
    order: 1,
  },
  {
    id: 'vinilshelf',
    title: 'Vinilshelf',
    tags: ['JavaScript', 'HTML', 'CSS'],
    repositoryUrl:
      'https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-3',
    image: 'images/projects/vinilshelf.jpg',
    imageKind: 'screenshot',
    imageWidth: 1200,
    imageHeight: 750,
    featured: true,
    order: 2,
  },
  {
    id: 'epiweather',
    title: 'EpiWeather',
    tags: ['React', 'Vite', 'OpenWeather'],
    repositoryUrl:
      'https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-10',
    image: 'images/projects/epiweather.jpg',
    imageKind: 'screenshot',
    imageWidth: 1200,
    imageHeight: 750,
    featured: true,
    order: 3,
  },
]

const COPY: Record<Language, Record<string, ProjectCopy>> = {
  it: {
    'spotify-clone': {
      label: 'EPICODE · SETTIMANA 11',
      description:
        'Ricerca musicale, preferiti e playlist con stato gestito in Redux.',
      imageAlt:
        'Screenshot dell’app: interfaccia musicale scura con navigazione laterale, caroselli di copertine e barra del player.',
      details: {
        overview:
          'Clone dell’interfaccia web di Spotify realizzato durante la settimana 11 del percorso EPICODE. L’app consuma l’API Deezer tramite il proxy pubblico di Strive School e organizza tutto lo stato applicativo in cinque slice di Redux Toolkit.',
        features: [
          'Ricerca brani con debounce di 400 ms, stato e risultati in Redux.',
          'Player con play/pausa, brano precedente e successivo, shuffle, loop, barra di avanzamento con seek e controllo del volume.',
          'Preferiti e playlist multiple create dall’utente, con vista dedicata per ognuna.',
          'Layout mobile-first con sidebar su desktop e barra di navigazione inferiore su mobile.',
        ],
        notes: [
          'Progetto didattico: non è un prodotto Spotify e non ha alcuna affiliazione con Spotify.',
          'Le anteprime audio sono quelle da ~30 secondi fornite da Deezer; i dati dipendono dal proxy Strive School.',
          'Lo stato è solo in memoria: il README del repository dichiara l’assenza di persistenza, quindi preferiti e playlist si azzerano al refresh.',
        ],
      },
    },
    vinilshelf: {
      label: 'EPICODE · SETTIMANA 3',
      description:
        'Collezione di vinili con ricerca, filtri e gestione degli acquisti.',
      imageAlt:
        'Screenshot di Vinilshelf: form di inserimento vinili, filtri, contatori e lista della collezione.',
      details: {
        overview:
          'Applicazione in JavaScript senza framework, costruita sul pattern stato → render() → eventi. Gestisce una collezione di vinili posseduti o da acquistare, interamente lato client.',
        features: [
          'Inserimento di titolo, artista e anno con stato “posseduto” o “da acquistare”.',
          'Ricerca live per titolo o artista, filtro per stato e ordinamento per anno o titolo.',
          'Contatori totali/posseduti/da acquistare e barra di completamento della collezione.',
          'Tema chiaro/scuro e persistenza dei dati in localStorage.',
        ],
        notes: [
          'Nessun framework e nessun database: solo HTML, CSS e JavaScript con localStorage.',
        ],
      },
    },
    epiweather: {
      label: 'EPICODE · SETTIMANA 10',
      description:
        'Meteo e previsioni per città, con geocoding e artwork dinamico.',
      imageAlt:
        'Screenshot della home di EpiWeather: intestazione dell’app e tre card che descrivono ricerca città, dettagli meteo e previsioni.',
      details: {
        overview:
          'Web app meteo in React con React Router: la ricerca città usa la Geocoding API di OpenWeather e propone la scelta fra omonimi prima di aprire la dashboard con coordinate esatte.',
        features: [
          'Ricerca città al submit del form, con lista di suggerimenti per gli omonimi.',
          'Dashboard con temperatura, percepita, umidità, vento, pressione e previsioni.',
          'Classi grafiche dinamiche in base alla condizione meteo e artwork della città da Unsplash.',
          'Navigazione Home / Ricerca / Dettaglio con React Router.',
        ],
        notes: [
          'Lo screenshot mostra la home dell’app: la dashboard meteo richiede chiavi API personali e non è stata catturata.',
          'Richiede chiavi API personali (OpenWeather e Unsplash) in un file .env locale.',
          'Il repository include test Vitest e Testing Library per Navbar, Home e Search: non li ho eseguiti in questa sessione, quindi non riporto risultati.',
        ],
      },
    },
  },

  en: {
    'spotify-clone': {
      label: 'EPICODE · WEEK 11',
      description: 'Music search, likes and playlists with state kept in Redux.',
      imageAlt:
        'Screenshot of the app: dark music interface with a sidebar, cover art carousels and a player bar.',
      details: {
        overview:
          'A clone of the Spotify web interface built during week 11 of the EPICODE programme. The app consumes the Deezer API through the public Strive School proxy and keeps all application state in five Redux Toolkit slices.',
        features: [
          'Track search with a 400 ms debounce, state and results in Redux.',
          'Player with play/pause, previous and next track, shuffle, loop, a seekable progress bar and volume control.',
          'Liked tracks and multiple user-created playlists, each with its own view.',
          'Mobile-first layout: sidebar on desktop, bottom navigation bar on mobile.',
        ],
        notes: [
          'Student project: it is not a Spotify product and has no affiliation with Spotify.',
          'Audio previews are the ~30 second clips provided by Deezer; the data depends on the Strive School proxy.',
          'State lives in memory only: the repository README states there is no persistence, so likes and playlists reset on refresh.',
        ],
      },
    },
    vinilshelf: {
      label: 'EPICODE · WEEK 3',
      description: 'A vinyl collection with search, filters and buying status.',
      imageAlt:
        'Screenshot of Vinilshelf: the add-record form, filters, counters and the collection list.',
      details: {
        overview:
          'A framework-free JavaScript app built on the state → render() → events pattern. It tracks a collection of records already owned or still to buy, entirely on the client.',
        features: [
          'Add title, artist and year with an “owned” or “to buy” status.',
          'Live search by title or artist, filter by status and sorting by year or title.',
          'Total / owned / to-buy counters and a collection completion bar.',
          'Light and dark theme, with data persisted in localStorage.',
        ],
        notes: [
          'No framework and no database: just HTML, CSS and JavaScript with localStorage.',
        ],
      },
    },
    epiweather: {
      label: 'EPICODE · WEEK 10',
      description:
        'Weather and forecasts by city, with geocoding and dynamic artwork.',
      imageAlt:
        'Screenshot of the EpiWeather home page: the app header and three cards describing city search, weather details and forecasts.',
      details: {
        overview:
          'A React weather app with React Router: city search uses the OpenWeather Geocoding API and lets you pick between same-named places before opening the dashboard on exact coordinates.',
        features: [
          'City search on form submit, with a suggestion list for duplicate names.',
          'Dashboard with temperature, feels-like, humidity, wind, pressure and forecasts.',
          'Dynamic styling based on the weather condition, plus city artwork from Unsplash.',
          'Home / Search / Detail navigation with React Router.',
        ],
        notes: [
          'The screenshot shows the app home page: the weather dashboard needs personal API keys and was not captured.',
          'Requires personal API keys (OpenWeather and Unsplash) in a local .env file.',
          'The repository includes Vitest and Testing Library tests for Navbar, Home and Search: I did not run them in this session, so I report no results.',
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
