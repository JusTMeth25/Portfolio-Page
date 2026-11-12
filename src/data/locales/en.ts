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
  role: 'Full-Stack Developer',
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
    role: 'FULL-STACK DEVELOPER',
    cue: 'SCROLL TO CONTINUE',
    skipLabel: 'Skip intro',
    ariaLabel:
      'Opening sequence: a vinyl record opens up and grows until it fills the screen.',
  },

  hero: {
    eyebrow: 'LORENZO MELIS / PORTFOLIO',
    titleLines: ['Full-Stack', 'Developer.'],
    accentWord: 'Developer.',
    description: 'From cybersecurity to building complete applications.',
    stack: 'React · TypeScript · Spring Boot · PostgreSQL',
    primaryCta: { label: 'Explore the projects', href: '#progetti' },
    secondaryCta: { label: 'GitHub', href: 'https://github.com/JusTMeth25' },
    note: 'Training completed · EPICODE AI Full-Stack Developer',
    sceneLabels: ['A1 · Frontend', 'A2 · API', 'A3 · Database'],
  },

  about: {
    eyebrow: '02 / PROFILE',
    title: 'Building software with a security mindset.',
    paragraphs: [
      'I am Lorenzo Melis, a full-stack developer with a degree in Computer Engineering. I completed the EPICODE AI Full-Stack Developer programme, building applications with Java, Spring Boot, React, TypeScript and PostgreSQL.',
      'I started as a developer at Cybertech – Engineering, writing scripts to automate cybersecurity operations and building integrations between security systems with APIs and SQL queries. I then moved into SOC operations and consulting. With EPICODE I put coding back at the centre of my work.',
      'I bring that background into development: attention to security, to how data is handled, and to working alongside technical teams. I am looking for a full-stack role where I can contribute to the codebase and keep growing on both frontend and backend.',
    ],
    photos: {
      front: {
        src: 'images/profile/lorenzo-melis-foto.jpg',
        alt: 'Photo of Lorenzo Melis',
        width: 640,
        height: 640,
      },
      back: {
        src: 'images/profile/lorenzo-melis.jpg',
        alt: 'Illustrated anime-style avatar of Lorenzo Melis',
        width: 640,
        height: 640,
      },
    },
    flip: {
      toBack: 'Flip: illustrated version',
      toFront: 'Flip: photo',
      hint: 'Flip',
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
      'One continuous technical path: first scripting, automation and integrations, then security operations and consulting, now full-stack development.',
    entries: [
      {
        id: 'epicode',
        period: 'May 2026 — Oct 2026',
        role: 'AI Full-Stack Developer',
        organization: 'EPICODE',
        description:
          'Intensive programme covering HTML/CSS, JavaScript, React, Redux Toolkit, TypeScript, Java, the Spring Framework, relational databases and SQL, Spring Data JPA and REST APIs with Spring Web. Exercises, weekly projects and the VinylDex capstone on GitHub.',
        kind: 'formazione',
      },
      {
        id: 'protiviti',
        period: 'Jan 2025 — Apr 2026',
        role: 'Senior Cyber Security Consultant',
        organization: 'Protiviti',
        place: 'Rome',
        description:
          'Supported financial and aerospace clients on ICT risk and DORA, supplier security controls and audits, remediation and PMO activities.',
        kind: 'lavoro',
      },
      {
        id: 'cybertech',
        period: 'May 2019 — Dec 2024',
        role: 'Cyber Security Analyst → Specialist → Consultant',
        organization: 'Cybertech – Engineering',
        place: 'Rome',
        description:
          '2019–2022, scripting, automation and integrations: scripts to automate cybersecurity operations, APIs, SQL queries and integrations between security systems. 2022–2024, SOC operations: SIEM event and log analysis, incident handling, Azure, IAM/PAM, DLP, Microsoft Defender and reporting with IT and operations teams.',
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
        relatedProjectIds: ['solco', 'nova', 'vinyldex'],
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
        relatedProjectIds: ['solco', 'nova', 'vinyldex'],
      },
      {
        id: 'tools',
        title: 'Tools',
        items: ['Git', 'GitHub', 'Postman', 'Maven', 'Vite'],
        relatedProjectIds: ['solco', 'vinyldex'],
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
        'Linux LPIC-1 v.500',
        'Cisco CCNA (200-125)',
        'Cisco Cyber Threat Management',
        'ITIL v4 Foundation',
        'ISMS Auditor ISO/IEC 27001',
        'Lead Auditor ISO 19011 / ISO/IEC 17021',
        'Internal Auditor UNI EN ISO 9001:2015',
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
        value: 'linkedin.com/in/lorenzo-melis-',
        href: 'https://www.linkedin.com/in/lorenzo-melis-/',
        kind: 'linkedin',
      },
    ] satisfies ContactLink[],
  },

  cv: {
    available: true,
    /** The English CV. */
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
    title: 'Lorenzo Melis — Full-Stack Developer',
    description:
      'Portfolio of Lorenzo Melis, Full-Stack Developer: React, TypeScript and Java Spring Boot projects, with a cybersecurity background.',
  },

  footer: {
    note: 'Personal portfolio — React, TypeScript and Three.js.',
  },
}
