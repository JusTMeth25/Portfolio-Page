/**
 * Site copy in English.
 * Must mirror `it.ts` exactly: same keys, same shape.
 */

import type {
  ContactLink,
  Interest,
  SkillGroup,
  TimelineEntry,
} from '../profile'

export const en = {
  code: 'en',
  label: 'English',
  short: 'EN',
  switchLabel: 'Change language',
  switchToLabel: 'Switch to Italian',

  name: 'Lorenzo Melis',
  role: 'Junior Full-Stack Developer',
  monogram: { light: 'L', accent: 'M' },

  ui: {
    skipToContent: 'Skip to content',
    newTab: '(opens in a new tab)',
    technologies: 'Technologies',
    repository: 'GitHub repository',
    liveDemo: 'Live demo',
    details: 'Details',
    closeDetails: 'Close details',
    features: 'Features',
    notes: 'Notes',
    screenshot: 'Screenshot',
    illustration: 'Illustrated cover',
    emptyProjects: 'No featured projects right now.',
    inProgress: 'In progress',
    timelineKind: { formazione: 'education', lavoro: 'work' },
    usedIn: 'Used in:',
    of: 'of',
  },

  projectsSection: {
    eyebrow: '01 / SELECTED WORK',
    title: 'Featured projects',
    linkLabel: 'See GitHub',
  },

  intro: {
    name: 'LORENZO MELIS',
    edition: 'PORTFOLIO No.001',
    role: 'JUNIOR FULL-STACK DEVELOPER',
    cue: 'SCROLL TO CONTINUE',
    skipLabel: 'Skip intro',
    ariaLabel:
      'Opening sequence: a vinyl record opens up and grows until it fills the screen.',
  },

  hero: {
    eyebrow: 'LORENZO MELIS / PORTFOLIO',
    titleLines: ['Junior Full-Stack', 'Developer.'],
    accentWord: 'Developer.',
    description: 'From cybersecurity to building complete applications.',
    stack: 'React · TypeScript · Spring Boot · PostgreSQL',
    primaryCta: { label: 'Explore the projects', href: '#progetti' },
    secondaryCta: { label: 'GitHub', href: 'https://github.com/JusTMeth25' },
    note: 'Currently training · EPICODE AI Full-Stack Developer',
    sceneLabels: ['A1 · Frontend', 'A2 · API', 'A3 · Database'],
  },

  about: {
    eyebrow: '02 / PROFILE',
    title: 'Building software with a security mindset.',
    paragraphs: [
      'I am Lorenzo Melis, a Computer Engineering graduate currently completing the EPICODE AI Full-Stack Developer programme. I build projects with React, JavaScript, TypeScript, Java, Spring Boot and PostgreSQL.',
      'I bring my cybersecurity background into development: attention to security, to how data is handled, and to working alongside technical teams. I am looking for a full-stack role where I can contribute to the codebase and keep growing on both frontend and backend.',
    ],
    photo: {
      src: 'images/profile/lorenzo-melis.jpg',
      alt: 'Illustrated anime-style avatar of Lorenzo Melis',
      width: 640,
      height: 640,
    },
    facts: [
      { label: 'Training', value: 'EPICODE AI Full-Stack Developer' },
      { label: 'Degree', value: 'Computer Engineering L-08 · 105/110' },
      { label: 'Background', value: '5+ years in cybersecurity' },
    ],
  },

  timeline: {
    eyebrow: '03 / PATH',
    title: 'From cybersecurity to development',
    intro:
      'One continuous technical path: first security analysis and governance, now full-stack development.',
    entries: [
      {
        id: 'epicode',
        period: 'May 2026 — present',
        role: 'AI Full-Stack Developer',
        organization: 'EPICODE',
        description:
          'Intensive programme covering HTML/CSS, JavaScript, React, Redux Toolkit, TypeScript, Java, the Spring Framework, relational databases and SQL, Spring Data JPA and REST APIs with Spring Web. Expected completion November 2026.',
        kind: 'formazione',
        current: true,
      },
      {
        id: 'protiviti',
        period: 'Sep 2025 — Apr 2026',
        role: 'Senior Cyber Security Consultant',
        organization: 'Protiviti',
        place: 'Rome',
        description:
          'Cybersecurity governance and compliance: ICT risk assessments, control evaluations, supplier security audits and support on remediation planning.',
        kind: 'lavoro',
      },
      {
        id: 'kpmg',
        period: 'Mar 2025 — Jun 2025',
        role: 'Cyber Security Consultant',
        organization: 'KPMG Advisory',
        place: 'Rome',
        description:
          'Information security and technology risk projects: security policy analysis, vulnerability assessments, IAM/IAG, business continuity and disaster recovery.',
        kind: 'lavoro',
      },
      {
        id: 'cybertech',
        period: 'May 2019 — Dec 2024',
        role: 'Cyber Security Analyst → Specialist → Consultant',
        organization: 'Cybertech – Engineering',
        place: 'Rome',
        description:
          'SIEM and log analysis, incident handling, Microsoft Azure, IAM/PAM, DLP, security integrations and day-to-day work with technical and operations teams.',
        kind: 'lavoro',
      },
      {
        id: 'mercatorum',
        period: '2023 — 2026',
        role: "Bachelor's Degree in Computer Engineering L-08",
        organization: 'Universitas Mercatorum',
        description: 'Final grade 105/110.',
        kind: 'formazione',
      },
      {
        id: 'elis',
        period: '2018 — 2019',
        role: 'Master in Networks and Information Systems',
        organization: 'ELIS College',
        place: 'Rome',
        description:
          'Postgraduate master on networks and information systems, the first step into working in IT.',
        kind: 'formazione',
      },
    ] satisfies TimelineEntry[],
  },

  skills: {
    eyebrow: '04 / SKILLS',
    title: 'Tools I use in my projects',
    note: 'Technologies applied in the EPICODE projects and in my previous IT experience.',
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
        title: 'Backend and data',
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
        title: 'Tools',
        items: ['Git', 'GitHub', 'Postman', 'Maven', 'Vite'],
        relatedProjectIds: ['spotify-clone', 'epiweather'],
      },
      {
        id: 'it',
        title: 'IT background',
        items: ['Linux', 'Microsoft Azure', 'Networking', 'Cybersecurity'],
      },
      {
        id: 'languages',
        title: 'Languages',
        items: ['Italian (native)', 'English (advanced)', 'Spanish (basic)'],
      },
    ] satisfies SkillGroup[],
    certifications: {
      title: 'Certifications',
      note: 'Listed as they appear on my CV.',
      items: [
        'CompTIA Security+ ce',
        'Linux LPIC-1',
        'Cisco CCNA Routing and Switching',
        'Cisco Cyber Threat Management',
        'ITIL v4 Foundation',
      ],
    },
  },

  interests: {
    eyebrow: '05 / SOUNDTRACK',
    title: 'What spins while I write code',
    text: 'Away from the editor I collect vinyl. The things I look for in a record — structure, rhythm, attention to detail — are the same ones I look for in code.',
    items: [
      {
        id: 'vinili',
        label: 'Vinyl',
        note: 'A real collection on a turntable, not a playlist',
        accent: 'cyan',
      },
      {
        id: 'anni-80',
        label: '80s',
        note: 'Synthesisers, drum machines, reverb',
        accent: 'magenta',
      },
      {
        id: 'hip-hop',
        label: 'Hip hop',
        note: 'Samples, boom bap, groove',
        accent: 'amber',
      },
      {
        id: 'rock',
        label: 'Rock',
        note: 'Guitars, records played from start to finish',
        accent: 'violet',
      },
    ] satisfies Interest[],
  },

  contact: {
    eyebrow: '06 / CONTACT',
    title: 'Get in touch about a role',
    text: 'I am available for full-stack, frontend or backend positions. Drop me a line: I reply to every message.',
    copyLabel: 'Copy email',
    copiedLabel: 'Email copied',
    copyFallback: 'Copy manually: lorenzo.melis@yahoo.it',
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

  cv: {
    available: true,
    /** The English CV: the original Canva export. */
    path: 'cv/lorenzo-melis-cv-en.pdf',
    downloadLabel: 'Download CV',
    requestLabel: 'Request CV',
    requestHref:
      'mailto:lorenzo.melis@yahoo.it?subject=CV%20request%20-%20Lorenzo%20Melis',
    fileName: 'Lorenzo-Melis-CV-EN.pdf',
  },

  nav: {
    items: [
      { id: 'progetti', label: 'Projects', href: '#progetti' },
      { id: 'percorso', label: 'Path', href: '#percorso' },
      { id: 'contatti', label: 'Contact', href: '#contatti' },
    ],
    menuLabel: 'Site navigation',
    openLabel: 'Open the menu',
    closeLabel: 'Close the menu',
  },

  seo: {
    title: 'Lorenzo Melis — Junior Full-Stack Developer',
    description:
      'Portfolio of Lorenzo Melis, Junior Full-Stack Developer: React, TypeScript and Java Spring Boot projects, with a cybersecurity background.',
  },

  footer: {
    note: 'Personal portfolio — React, TypeScript and Three.js.',
  },
}
