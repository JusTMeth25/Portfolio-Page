/**
 * Unica sorgente dei progetti mostrati nella griglia.
 *
 * Per aggiungere, togliere, sostituire o riordinare un progetto basta
 * modificare questo file (ed eventualmente l'immagine in `public/images/projects/`).
 * I componenti non contengono testi, URL o condizioni legate ai singoli progetti.
 */

export type ProjectDetails = {
  overview: string
  features: string[]
  notes?: string[]
}

export type Project = {
  id: string
  title: string
  label: string
  description: string
  tags: string[]
  repositoryUrl: string
  /** Compilare solo con una demo realmente verificata: altrimenti il pulsante non compare. */
  demoUrl?: string
  /** Percorso relativo a `public/`, risolto con la base path di Vite. */
  image: string
  imageAlt: string
  imageKind: 'screenshot' | 'illustration'
  imageWidth: number
  imageHeight: number
  featured: boolean
  order: number
  details?: ProjectDetails
}

export const projects: Project[] = [
  {
    id: 'spotify-clone',
    title: 'Spotify Clone',
    label: 'EPICODE · SETTIMANA 11',
    description:
      'Ricerca musicale, preferiti e playlist con stato gestito in Redux.',
    tags: ['React', 'Redux Toolkit', 'Vite'],
    repositoryUrl:
      'https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-11',
    image: 'images/projects/spotify-clone.jpg',
    imageAlt:
      'Screenshot dell’app: interfaccia musicale scura con navigazione laterale, caroselli di copertine e barra del player.',
    imageKind: 'screenshot',
    imageWidth: 1200,
    imageHeight: 750,
    featured: true,
    order: 1,
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
  {
    id: 'vinilshelf',
    title: 'Vinilshelf',
    label: 'EPICODE · SETTIMANA 3',
    description:
      'Collezione di vinili con ricerca, filtri e gestione degli acquisti.',
    tags: ['JavaScript', 'HTML', 'CSS'],
    repositoryUrl:
      'https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-3',
    image: 'images/projects/vinilshelf.jpg',
    imageAlt:
      'Screenshot di Vinilshelf: form di inserimento vinili, filtri, contatori e lista della collezione.',
    imageKind: 'screenshot',
    imageWidth: 1200,
    imageHeight: 750,
    featured: true,
    order: 2,
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
  {
    id: 'epiweather',
    title: 'EpiWeather',
    label: 'EPICODE · SETTIMANA 10',
    description:
      'Meteo e previsioni per città, con geocoding e artwork dinamico.',
    tags: ['React', 'Vite', 'OpenWeather'],
    repositoryUrl:
      'https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-10',
    image: 'images/projects/epiweather.jpg',
    imageAlt:
      'Screenshot della home di EpiWeather: intestazione dell’app e tre card che descrivono ricerca città, dettagli meteo e previsioni.',
    imageKind: 'screenshot',
    imageWidth: 1200,
    imageHeight: 750,
    featured: true,
    order: 3,
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
]

/** Progetti in evidenza, ordinati per `order`. */
export function getFeaturedProjects(list: Project[] = projects): Project[] {
  return list.filter((project) => project.featured).sort((a, b) => a.order - b.order)
}
