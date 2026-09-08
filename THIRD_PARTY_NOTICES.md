# Componenti e risorse di terze parti

Questo file elenca le dipendenze di terze parti incluse nel portfolio, con la
relativa licenza, e chiarisce la provenienza di codice e asset.

## Dipendenze runtime (npm)

| Pacchetto | Licenza | Uso nel progetto |
|---|---|---|
| `react`, `react-dom` | MIT | Libreria UI. |
| `motion` (Motion for React) | MIT | Reveal delle sezioni e ingresso del titolo. |
| `three` | MIT | Motore WebGL della scultura nella hero. |
| `@react-three/fiber` | MIT | Renderer React per Three.js. |
| `lucide-react` | ISC | Icone dell'interfaccia (unica libreria di icone usata). |
| `@fontsource-variable/inter` | SIL Open Font License 1.1 (font Inter) | Font Inter servito localmente, senza richieste a Google Fonts. |

## Dipendenze di sviluppo

`vite`, `@vitejs/plugin-react`, `typescript`, `typescript-eslint`, `eslint` e i
relativi plugin, `vitest`, `jsdom`, `@testing-library/*`: tutte con licenza MIT
(ISC per alcune dipendenze transitive). Il testo completo delle licenze si trova
in `node_modules/<pacchetto>/LICENSE`.

## React Bits

Il brief chiedeva di usare componenti di [React Bits](https://reactbits.dev/).

React Bits è distribuito con licenza **MIT + Commons Clause**: è utilizzabile
gratuitamente in progetti personali e commerciali, ma la Commons Clause vieta di
vendere il software stesso. I componenti non si installano come pacchetto npm:
si copiano nel progetto (manualmente o con CLI come `shadcn`/`jsrepo`).

**Scelta fatta in questo progetto: nessun codice di React Bits è stato copiato.**
Gli effetti sono implementazioni originali, ispirate ai pattern che React Bits
mostra pubblicamente:

- `src/components/effects/SpotlightCard.tsx` — spotlight che segue il puntatore
  e tilt minimo (pattern "Spotlight Card" / "Tilted Card");
- `src/components/effects/Reveal.tsx` — reveal delle sezioni con Motion;
- `src/components/effects/HeroScene.tsx` — scultura WebGL originale in
  React Three Fiber.

Il motivo è duplice: evitare di ridistribuire codice sotto Commons Clause dentro
un repository personale, e mantenere il bundle limitato alle dipendenze già
presenti. Se in futuro vuoi importare un componente reale di React Bits, copia il
file dal sito, aggiungilo sotto `src/components/effects/` e riporta qui il nome
del componente, la versione e la licenza MIT + Commons Clause.

## Immagini e contenuti

- `public/images/projects/spotify-clone.jpg` — screenshot reale dell'app
  `FS0226IT---PROGETTO-SETTIMANA-11`, acquisito in locale il 2026-09-08 con la
  build di sviluppo del repository. L'interfaccia riproduce il layout di Spotify
  a scopo didattico: il progetto **non** è affiliato a Spotify e i marchi
  eventualmente visibili appartengono ai rispettivi proprietari. Le copertine
  degli album provengono dall'API Deezer (proxy pubblico di Strive School).
- `public/images/projects/vinilshelf.jpg` — screenshot reale di
  `FS0226IT---PROGETTO-SETTIMANA-3`, acquisito aprendo `index.html` in locale.
- `public/images/projects/epiweather.jpg` — screenshot reale della **home** di
  `FS0226IT---PROGETTO-SETTIMANA-10`, acquisito in locale. La dashboard meteo
  non è stata catturata perché richiede chiavi API personali.
  Le immagini `docs/screenshots/` presenti in quel repository sono dichiarate
  "preview illustrative" dal suo stesso README e non sono state usate.
- `public/images/profile/lorenzo-melis.jpg` — avatar illustrato fornito da
  Lorenzo Melis (ridimensionato a 640×640).
- `public/og-image.png` — anteprima social generata localmente a partire dai
  componenti di questo progetto.
- `public/favicon.svg` — monogramma LM disegnato per questo progetto.
- `public/cv/lorenzo-melis-cv.pdf` — CV fornito da Lorenzo Melis (export Canva),
  con la sezione "Selected Development Projects" aggiornata ai tre progetti del
  portfolio.
