/**
 * Testi del sito in italiano.
 * La versione inglese, in `en.ts`, deve avere esattamente la stessa forma.
 */

import type {
  ContactLink,
  Interest,
  SkillGroup,
  TimelineEntry,
} from '../profile'

export const it = {
  /** Codice della lingua per l'attributo `lang` e per il selettore. */
  code: 'it',
  label: 'Italiano',
  /** Etichetta breve nel selettore di lingua. */
  short: 'IT',
  switchLabel: 'Cambia lingua',
  switchToLabel: 'Passa all’inglese',

  name: 'Lorenzo Melis',
  role: 'Junior Full-Stack Developer',
  monogram: { light: 'L', accent: 'M' },

  /** Stringhe d'interfaccia sparse nei componenti. */
  ui: {
    skipToContent: 'Salta al contenuto',
    newTab: '(si apre in una nuova scheda)',
    technologies: 'Tecnologie',
    repository: 'Repository GitHub',
    liveDemo: 'Demo live',
    details: 'Dettagli',
    closeDetails: 'Chiudi dettagli',
    features: 'Funzionalità',
    notes: 'Note',
    screenshot: 'Screenshot',
    illustration: 'Copertina illustrativa',
    emptyProjects: 'Nessun progetto in evidenza al momento.',
    inProgress: 'In corso',
    timelineKind: { formazione: 'formazione', lavoro: 'lavoro' },
    usedIn: 'Usate in:',
    of: 'di',
  },

  projectsSection: {
    eyebrow: '01 / SELECTED WORK',
    title: 'Progetti in primo piano',
    linkLabel: 'Vedi GitHub',
  },

  /** Testi della sequenza d'apertura (src/components/effects/Intro.tsx). */
  intro: {
    name: 'LORENZO MELIS',
    edition: 'PORTFOLIO No.001',
    role: 'JUNIOR FULL-STACK DEVELOPER',
    cue: 'SCORRI PER CONTINUARE',
    skipLabel: 'Salta intro',
    /** Descrizione della sequenza per chi usa uno screen reader. */
    ariaLabel:
      'Sequenza di apertura: un disco in vinile si apre e si allarga fino a coprire lo schermo.',
  },

  hero: {
    eyebrow: 'LORENZO MELIS / PORTFOLIO',
    titleLines: ['Junior Full-Stack', 'Developer.'],
    /** Parola resa in ciano nell'H1 (deve comparire in titleLines). */
    accentWord: 'Developer.',
    description:
      'Dal mondo cybersecurity allo sviluppo di applicazioni complete.',
    stack: 'React · TypeScript · Spring Boot · PostgreSQL',
    primaryCta: { label: 'Esplora i progetti', href: '#progetti' },
    secondaryCta: { label: 'GitHub', href: 'https://github.com/JusTMeth25' },
    note: 'In formazione · EPICODE AI Full-Stack Developer',
    /** Etichette HTML sopra la scena: le "tracce" del disco. */
    sceneLabels: ['A1 · Frontend', 'A2 · API', 'A3 · Database'],
  },

  about: {
    eyebrow: '02 / PROFILO',
    title: 'Sviluppo con una prospettiva sulla sicurezza.',
    paragraphs: [
      'Sono Lorenzo Melis, laureato in ingegneria informatica e attualmente in formazione nel percorso EPICODE AI Full-Stack Developer. Sviluppo progetti con React, JavaScript, TypeScript, Java, Spring Boot e PostgreSQL.',
      'Porto nello sviluppo l’esperienza maturata nella cybersecurity, con attenzione alla sicurezza, alla gestione dei dati e alla collaborazione con team tecnici. Cerco un ruolo come full stack in cui contribuire al codice e continuare a crescere su frontend e backend.',
    ],
    photos: {
      /** Faccia iniziale: la foto vera. */
      front: {
        src: 'images/profile/lorenzo-melis-foto.jpg',
        alt: 'Foto di Lorenzo Melis',
        width: 640,
        height: 640,
      },
      /** Retro: la versione illustrata. */
      back: {
        src: 'images/profile/lorenzo-melis.jpg',
        alt: 'Avatar illustrato in stile anime di Lorenzo Melis',
        width: 640,
        height: 640,
      },
    },
    flip: {
      toBack: 'Gira: versione illustrata',
      toFront: 'Gira: foto',
      hint: 'Gira',
    },
    facts: [
      { label: 'Formazione', value: 'EPICODE AI Full-Stack Developer' },
      { label: 'Laurea', value: 'Ingegneria Informatica L-08 · 105/110' },
      { label: 'Background', value: '5+ anni in cybersecurity' },
    ],
  },

  timeline: {
    eyebrow: '03 / PERCORSO',
    title: 'Dalla sicurezza informatica allo sviluppo',
    intro:
      'Un percorso tecnico continuo: prima analisi e governance della sicurezza, oggi sviluppo full stack.',
    entries: [
      {
        id: 'epicode',
        period: 'Mag 2026 — in corso',
        role: 'AI Full-Stack Developer',
        organization: 'EPICODE',
        description:
          'Percorso intensivo su HTML/CSS, JavaScript, React, Redux Toolkit, TypeScript, Java, Spring Framework, database relazionali e SQL, Spring Data JPA e REST API con Spring Web. Completamento previsto novembre 2026.',
        kind: 'formazione',
        current: true,
      },
      {
        id: 'protiviti',
        period: 'Set 2025 — Apr 2026',
        role: 'Senior Cyber Security Consultant',
        organization: 'Protiviti',
        place: 'Roma',
        description:
          'Governance e compliance cybersecurity: valutazioni del rischio ICT, valutazione dei controlli, audit di sicurezza sui fornitori e supporto alla pianificazione della remediation.',
        kind: 'lavoro',
      },
      {
        id: 'kpmg',
        period: 'Mar 2025 — Giu 2025',
        role: 'Cyber Security Consultant',
        organization: 'KPMG Advisory',
        place: 'Roma',
        description:
          'Progetti di information security e technology risk: analisi delle policy di sicurezza, vulnerability assessment, IAM/IAG, continuità operativa e disaster recovery.',
        kind: 'lavoro',
      },
      {
        id: 'cybertech',
        period: 'Mag 2019 — Dic 2024',
        role: 'Cyber Security Analyst → Specialist → Consultant',
        organization: 'Cybertech – Engineering',
        place: 'Roma',
        description:
          'Analisi SIEM e dei log, incident handling, Microsoft Azure, IAM/PAM, DLP, integrazioni di sicurezza e collaborazione quotidiana con team tecnici e operativi.',
        kind: 'lavoro',
      },
      {
        id: 'mercatorum',
        period: '2023 — 2026',
        role: 'Laurea in Ingegneria Informatica L-08',
        organization: 'Universitas Mercatorum',
        description: 'Voto finale 105/110.',
        kind: 'formazione',
      },
      {
        id: 'elis',
        period: '2018 — 2019',
        role: 'Master in Networks and Information Systems',
        organization: 'ELIS College',
        place: 'Roma',
        description:
          'Master post-laurea su reti e sistemi informativi, primo passo verso il lavoro in ambito IT.',
        kind: 'formazione',
      },
    ] satisfies TimelineEntry[],
  },

  skills: {
    eyebrow: '04 / COMPETENZE',
    title: 'Strumenti che uso nei progetti',
    note: 'Tecnologie applicate nei progetti del percorso EPICODE e nell’esperienza IT precedente.',
    groups: [
      {
        id: 'frontend',
        title: 'Frontend',
        items: [
          'HTML5',
          'CSS3',
          'JavaScript',
          'TypeScript',
          'React',
          'Redux Toolkit',
          'Bootstrap',
          'Sass',
        ],
        relatedProjectIds: ['spotify-clone', 'vinilshelf', 'epiweather'],
      },
      {
        id: 'backend',
        title: 'Backend e dati',
        items: [
          'Java',
          'Spring Boot',
          'Spring Web',
          'Spring Data JPA',
          'Spring Security',
          'REST API',
          'SQL',
          'PostgreSQL',
        ],
      },
      {
        id: 'tools',
        title: 'Strumenti',
        items: ['Git', 'GitHub', 'Postman', 'Maven', 'Vite'],
        relatedProjectIds: ['spotify-clone', 'epiweather'],
      },
      {
        id: 'it',
        title: 'Background IT',
        items: ['Linux', 'Microsoft Azure', 'Networking', 'Cybersecurity'],
      },
      {
        id: 'languages',
        title: 'Lingue',
        items: ['Italiano (madrelingua)', 'Inglese (avanzato)', 'Spagnolo (base)'],
      },
    ] satisfies SkillGroup[],
    certifications: {
      title: 'Certificazioni',
      note: 'Riportate come indicate nel CV.',
      items: [
        'CompTIA Security+ ce',
        'Linux LPIC-1',
        'Cisco CCNA Routing and Switching',
        'Cisco Cyber Threat Management',
        'ITIL v4 Foundation',
      ],
    },
  },

  /**
   * Sezione "Colonna sonora": interessi personali, non competenze.
   * È dichiaratamente una nota di colore, tenuta separata dalle skill.
   */
  interests: {
    eyebrow: '05 / COLONNA SONORA',
    title: 'Cosa gira mentre scrivo codice',
    text: 'Fuori dall’editor colleziono vinili. Le stesse cose che cerco in un disco — struttura, ritmo, cura dei dettagli — le cerco anche nel codice.',
    items: [
      {
        id: 'vinili',
        label: 'Vinili',
        note: 'Collezione su piatto, non in streaming',
        accent: 'cyan',
      },
      {
        id: 'anni-80',
        label: 'Anni 80',
        note: 'Sintetizzatori, drum machine, riverberi',
        accent: 'magenta',
      },
      {
        id: 'hip-hop',
        label: 'Hip hop',
        note: 'Campionamenti, boom bap, groove',
        accent: 'amber',
      },
      {
        id: 'rock',
        label: 'Rock',
        note: 'Chitarre, dischi suonati dall’inizio alla fine',
        accent: 'violet',
      },
    ] satisfies Interest[],
  },

  contact: {
    eyebrow: '06 / CONTATTI',
    title: 'Contattami per un lavoro',
    text: 'Sono disponibile per posizioni come full stack, frontend o backend. Scrivimi: rispondo a tutti i messaggi.',
    copyLabel: 'Copia email',
    copiedLabel: 'Email copiata',
    copyFallback: 'Copia manualmente: lorenzo.melis@yahoo.it',
    links: [
      {
        id: 'email',
        label: 'Email',
        value: 'lorenzo.melis@yahoo.it',
        href: 'mailto:lorenzo.melis@yahoo.it',
        kind: 'email',
      },
      {
        id: 'github',
        label: 'GitHub',
        value: 'github.com/JusTMeth25',
        href: 'https://github.com/JusTMeth25',
        kind: 'github',
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        value: 'linkedin.com/in/lorenzo-melis97',
        href: 'https://www.linkedin.com/in/lorenzo-melis97/',
        kind: 'linkedin',
      },
    ] satisfies ContactLink[],
  },

  /**
   * CV in PDF.
   * `available: false` sostituisce "Scarica CV" con "Richiedi CV" (mailto),
   * senza rompere il layout. Vedi README.
   */
  cv: {
    available: true,
    /** Percorso relativo a `public/`, risolto con la base path di Vite. */
    path: 'cv/lorenzo-melis-cv-it.pdf',
    downloadLabel: 'Scarica CV',
    requestLabel: 'Richiedi CV',
    requestHref:
      'mailto:lorenzo.melis@yahoo.it?subject=Richiesta%20CV%20-%20Lorenzo%20Melis',
    fileName: 'Lorenzo-Melis-CV-IT.pdf',
  },

  nav: {
    items: [
      { id: 'progetti', label: 'Progetti', href: '#progetti' },
      { id: 'percorso', label: 'Percorso', href: '#percorso' },
      { id: 'contatti', label: 'Contatti', href: '#contatti' },
    ],
    menuLabel: 'Menu di navigazione',
    openLabel: 'Apri il menu',
    closeLabel: 'Chiudi il menu',
  },

  seo: {
    title: 'Lorenzo Melis — Junior Full-Stack Developer',
    description:
      'Portfolio di Lorenzo Melis, Junior Full-Stack Developer: progetti React, TypeScript e Java Spring Boot, con un background in cybersecurity.',
  },

  footer: {
    note: 'Portfolio personale — React, TypeScript e Three.js.',
  },
}
