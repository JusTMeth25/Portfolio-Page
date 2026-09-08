# Documentazione tecnica

Note di sviluppo, personalizzazione e pubblicazione del portfolio.
Per la presentazione del profilo vedi il [README](../README.md).

---

## Indice

- [Comandi](#comandi)
- [Struttura](#struttura)
- [Modificare profilo e contatti](#modificare-profilo-e-contatti)
- [Modificare i progetti](#modificare-i-progetti)
- [Sostituire le copertine](#sostituire-le-copertine)
- [Lingue](#lingue)
- [CV in PDF](#cv-in-pdf)
- [Base path e pubblicazione su GitHub Pages](#base-path-e-pubblicazione-su-github-pages)
- [SEO e anteprima social](#seo-e-anteprima-social)
- [Accessibilità e animazioni](#accessibilità-e-animazioni)
- [Componenti esterni e licenze](#componenti-esterni-e-licenze)
- [Verifiche eseguite](#verifiche-eseguite)
- [Limiti noti](#limiti-noti)

---

## Comandi

```bash
npm install        # installazione riproducibile (lockfile versionato)
npm run dev        # server di sviluppo su http://localhost:5173
npm run typecheck  # TypeScript strict, senza emissione
npm run lint       # ESLint (TypeScript + React Hooks)
npm test           # Vitest + Testing Library
npm run build      # typecheck + build di produzione in dist/
npm run preview    # serve la build di dist/
```

Requisiti: Node.js 20+ (il workflow usa Node 22), npm 10+.
Un solo package manager: **npm**, con `package-lock.json` versionato.

---

## Struttura

```text
src/
  components/            Navbar, Hero, ProjectCard, ProjectDetails, Timeline, ...
  components/effects/    Intro + introScene (canvas 2D), AmbientGrooves,
                         Cursor, Equalizer, HeroScene (WebGL),
                         HeroFallback (SVG), Reveal, SpotlightCard
  data/profile.ts        tipi dei contenuti e registro delle lingue
  data/locales/          it.ts e en.ts: gli stessi testi in due lingue
  i18n/                  LanguageProvider, useI18n
  data/projects.ts       elenco dei progetti (unica sorgente)
  hooks/                 usePrefersReducedMotion, useMediaQuery
  lib/asset.ts           risolve i percorsi rispetto alla base path
  lib/scrollRestoration.ts  al refresh si riparte dalla hero
  lib/ticker.ts          il ciclo di animazione condiviso
  styles/                token e stili globali
  test/setup.ts          setup di Vitest
public/
  images/projects/       copertine dei progetti
  images/profile/        foto del profilo
  cv/                    CV in PDF
  favicon.svg, og-image.png
.github/workflows/deploy.yml
docs/                    documentazione e immagini del README
tools/cv/                script one-off che riscrive la sezione progetti del CV
```

---

## Modificare profilo e contatti

Tutto in **`src/data/profile.ts`**.

- `profile.hero` — eyebrow, righe del titolo, descrizione, stack, CTA, nota.
  `accentWord` indica quale riga di `titleLines` viene resa in ciano.
- `profile.about` — titolo, paragrafi, foto (`src` relativo a `public/`) e i
  quattro "fatti" sotto il testo.
- `profile.timeline.entries` — voci del percorso. Ogni voce ha `kind`
  (`'formazione' | 'lavoro'`) e un `current` opzionale per il badge "In corso".
  Sono ordinate come stanno nell'array.
- `profile.skills.groups` — gruppi di competenze. `relatedProjectIds` collega un
  gruppo ai progetti (la riga "Usate in: …" si costruisce da sola: se un id non
  esiste più, viene semplicemente ignorato).
- `profile.interests` — sezione "Colonna sonora". Ogni voce ha `label`, `note`
  e `accent` (`cyan | amber | magenta | violet`), che sceglie il colore
  dell'etichetta del disco.
- `profile.intro` — testi della sequenza d'apertura (HUD e descrizione
  accessibile). La durata è `INTRO_DURATION_MS` in `effects/introScene.ts`.
- `profile.contact.links` — email, GitHub, LinkedIn. `kind` sceglie l'icona.
- `profile.nav.items` — voci di navigazione e ancore.
- `profile.seo` — titolo e descrizione (il `<title>` e la `meta description`
  effettivi stanno in `index.html`: aggiornali insieme).

---

## Modificare i progetti

Tutto in **`src/data/projects.ts`**.

```ts
{
  id: 'nuovo-progetto',
  title: 'Nome del progetto',
  label: 'EPICODE · SETTIMANA 12',
  description: 'Una riga che spiega cosa fa.',
  tags: ['React', 'TypeScript'],
  repositoryUrl: 'https://github.com/JusTMeth25/nome-repo',
  // demoUrl: 'https://…',   ← solo se la demo esiste davvero
  image: 'images/projects/nuovo-progetto.jpg',
  imageAlt: 'Descrizione dell’immagine per chi non la vede.',
  imageKind: 'screenshot',   // oppure 'illustration'
  imageWidth: 1200,
  imageHeight: 750,
  featured: true,
  order: 2,                  // ordina la griglia
  details: {
    overview: 'Cosa fa il progetto e in che contesto è nato.',
    features: ['Funzionalità verificata 1', 'Funzionalità verificata 2'],
    notes: ['Limiti o precisazioni.'],
  },
}
```

Regole pratiche:

- **Aggiungere** un progetto: aggiungi l'oggetto e l'immagine in
  `public/images/projects/`.
- **Rimuovere**: cancella l'oggetto (oppure metti `featured: false` per
  nasconderlo senza perdere i dati).
- **Riordinare**: cambia `order`. La griglia usa `getFeaturedProjects()`, che
  filtra per `featured` e ordina per `order`.
- **Numero diverso da tre**: la griglia è `auto-fit`, funziona con 1, 2, 4 o più
  schede (un test lo verifica).
- **`demoUrl`**: il pulsante "Demo live" compare **solo** se il campo è
  valorizzato. Non inserirlo se la demo non è stata verificata.
- **Immagine mancante o non caricata**: la scheda mostra un fallback sobrio con
  il titolo del progetto, senza rompere il layout.
- **`imageKind`** controlla il badge in alto a destra: `Screenshot` oppure
  `Copertina illustrativa`. Usa `'illustration'` se l'immagine non è una vera
  cattura dell'app.

---

## Sostituire le copertine

Le tre copertine attuali sono **screenshot reali** acquisiti in locale
(vedi `THIRD_PARTY_NOTICES.md` per la provenienza esatta).

Per sostituirne una:

1. cattura l'immagine e ritagliala a **1200 × 750** (rapporto 8:5);
2. salvala in `public/images/projects/` come JPEG (le attuali pesano 50–80 kB);
3. aggiorna in `src/data/projects.ts` i campi `image`, `imageAlt`,
   `imageWidth`/`imageHeight` e, se serve, `imageKind`.

Le immagini sotto la hero sono in `loading="lazy"` (tranne la prima scheda) e
hanno `width`/`height` dichiarati per evitare il layout shift.

---

## Lingue

Il sito è in **italiano e inglese**, con il selettore `IT / EN` in navbar.

- I testi stanno in `src/data/locales/it.ts` e `src/data/locales/en.ts`. I due
  file hanno la stessa forma: `Profile` è il tipo di `it`, quindi se una chiave
  manca in inglese il typecheck fallisce subito.
- I progetti stanno in `src/data/projects.ts`, divisi in due parti: `PROJECT_BASE`
  con quello che non cambia (id, URL, immagini, tag, ordine) e `COPY` con i testi
  per lingua. Aggiungere un progetto significa aggiungere una voce in entrambi.
- La lingua vive in `src/i18n/LanguageProvider.tsx`: viene ricordata in
  `localStorage`, ricade sulla lingua del browser al primo accesso e aggiorna
  `<html lang>`, il `<title>` e la meta description.
- I componenti leggono tutto da `useI18n()`: testi, stringhe d'interfaccia
  (`profile.ui`) e progetti già tradotti.

**Aggiungere una lingua:** crea `src/data/locales/xx.ts` sulla falsariga di
`it.ts`, aggiungi `'xx'` al tipo `Language` e la voce in `profiles`, poi la
colonna corrispondente in `COPY` dentro `projects.ts` e il CV in `public/cv/`.

---

## CV in PDF

Ci sono **due CV**, uno per lingua, e la pagina scarica quello giusto:

| Lingua | File | Nome proposto |
|---|---|---|
| Italiano | `public/cv/lorenzo-melis-cv-it.pdf` | `Lorenzo-Melis-CV-IT.pdf` |
| Inglese | `public/cv/lorenzo-melis-cv-en.pdf` | `Lorenzo-Melis-CV-EN.pdf` |

Lo stato è controllato da `cv` dentro il file della lingua
(`src/data/locales/<lingua>.ts`):

```ts
cv: {
  available: true,                      // false → il pulsante diventa "Richiedi CV"
  path: 'cv/lorenzo-melis-cv-it.pdf',   // relativo a public/
  fileName: 'Lorenzo-Melis-CV-IT.pdf',  // nome proposto al download
  requestHref: 'mailto:…',              // usato quando available è false
}
```

- **Sostituire il CV**: sovrascrivi il PDF mantenendo il nome, oppure cambia
  `path`.
- **Disattivare il download**: metti `available: false`. Navbar e sezione
  contatti mostrano "Richiedi CV" con un `mailto:`, senza link rotti e senza
  cambiare il layout.

Il PDF inglese deriva dall'export Canva, con la sezione
*Selected Development Projects* riscritta sui tre progetti del portfolio (Spotify Clone, Vinylshelf, EpiWeather) e i link "Repository"
aggiornati ai repository corrispondenti. Nell'operazione i font incorporati sono
stati ricostruiti: rispetto all'originale il testo del PDF è ora estraibile
correttamente anche dai parser automatici (nell'export Canva la mappa
`ToUnicode` era incompleta e le cifre venivano lette in modo errato).

La versione italiana si genera **dal PDF inglese** con `tools/cv/cvtranslate.py`,
che traduce **tutte** le righe del documento mantenendo layout, font, colori,
sottolineature dei link e annotazioni. Le posizioni orizzontali non vengono
copiate ma ricalcolate dalle metriche dei glifi, così una traduzione più lunga o
più corta non sfasa la riga.

Gli script stanno in `tools/cv/`, con le istruzioni per rigenerare entrambi i
PDF se aggiorni il CV su Canva.

---

## Base path e pubblicazione su GitHub Pages

Il sito funziona sia come **user site** sia come **project site**. La base path
si passa alla build con la variabile `BASE_PATH`, normalizzata in
`vite.config.ts` (le barre iniziali e finali sono opzionali):

```bash
# https://JusTMeth25.github.io/
npm run build

# https://JusTMeth25.github.io/NOME-REPOSITORY/
BASE_PATH=NOME-REPOSITORY npm run build
```

> Su Git Bash per Windows scrivi il nome **senza barra iniziale**
> (`BASE_PATH=Portfolio-Page`): con `/Portfolio-Page` la shell riscriverebbe il
> valore in un percorso Windows.

Tutti gli asset (immagini, favicon, CV) passano da `asset()` in
`src/lib/asset.ts`, che usa `import.meta.env.BASE_URL`: non ci sono percorsi
assoluti dalla root che romperebbero il project site.

### Deploy

`.github/workflows/deploy.yml` esegue `npm ci`, lint, test, build e deploy su
GitHub Pages tramite `actions/deploy-pages`, con i permessi minimi
(`contents: read`, `pages: write`, `id-token: write`) e l'environment
`github-pages`. `BASE_PATH` e `SITE_URL` arrivano dagli output di
`actions/configure-pages`, quindi **non serve impostare nulla a mano**.

Il sito è pubblicato su **https://justmeth25.github.io/Portfolio-Page/**.

Il passo `actions/configure-pages` usa `enablement: true`, quindi attiva Pages
sul repository da solo al primo giro: basta il push su `main`. Il workflow parte
anche a mano da *Actions → Deploy su GitHub Pages → Run workflow*.

Un push successivo su `main` riesegue il workflow e ripubblica il sito.

---

## SEO e anteprima social

`index.html` contiene `title`, `description`, Open Graph e Twitter Card di base.
I metadati che richiedono un URL assoluto — `canonical`, `og:url`, `og:image`,
`sitemap.xml`, `robots.txt` — vengono generati **solo** se la build riceve
`SITE_URL`:

```bash
BASE_PATH=NOME-REPOSITORY SITE_URL=https://JusTMeth25.github.io/NOME-REPOSITORY/ npm run build
```

Senza `SITE_URL` non viene scritto nessun dominio segnaposto e non vengono
generati `sitemap.xml` e `robots.txt`: è una scelta voluta, meglio nessun
metadato che un URL sbagliato. In CI la variabile arriva da
`actions/configure-pages`, quindi la build pubblicata li include sempre.

L'anteprima social è `public/og-image.png` (1200 × 630), generata localmente.

---

## Accessibilità e animazioni

### Effetti presenti

| Effetto | File | Quando è attivo |
|---|---|---|
| Sequenza d'apertura (canvas 2D) | `effects/Intro.tsx` + `effects/introScene.ts` | a ogni caricamento, mai con movimento ridotto |
| Solchi di vinile sullo sfondo | `effects/AmbientGrooves.tsx` | sempre; con movimento ridotto disegna un solo fotogramma |
| Cursore del sito | `effects/Cursor.tsx` | solo puntatore preciso e movimento non ridotto |
| Equalizzatore reattivo | `effects/Equalizer.tsx` | hero e sezione "Colonna sonora"; profilo statico con movimento ridotto |
| Vinile 3D della hero | `effects/HeroScene.tsx` | solo desktop con WebGL; statico con movimento ridotto |
| Onde sul disco e braccio che segue il puntatore | `effects/HeroScene.tsx` | al passaggio del puntatore sul vinile |
| Ingresso delle testate di sezione | `effects/SectionIntro.tsx` | all'entrata nel viewport, una volta sola |
| Barra di avanzamento nella navbar | `effects/ScrollProgress.tsx` | sempre; senza molla con movimento ridotto |
| Spotlight e tilt sulle schede | `effects/SpotlightCard.tsx` | solo puntatore preciso |
| Reveal delle sezioni | `effects/Reveal.tsx` | all'ingresso nel viewport, una volta sola |
| Dischi che girano | `interests.css` | animazione CSS, accelerata al passaggio del mouse |

#### La hero

La scena è un **vinile 3D** (React Three Fiber): piatto che gira, solchi come
`lineLoop`, etichetta emissiva, foro del perno, due orbite inclinate con
satelliti, pulviscolo additivo e una luce che orbita per far scorrere il
riflesso sul bordo.

L'interazione avviene **sul disco**, non attorno:

- il raycast di R3F dà il punto toccato sul vinile; lì compare un bagliore e
  parte un'onda che si allarga (pool fisso di sette anelli riusati);
- il **braccio** calcola l'angolo che porta la testina sul solco toccato e ci
  arriva con un lerp — la formula è documentata in `armAngleFor`;
- una "carezza" sul disco lo accelera un po', poi torna alla velocità di regime.

Il braccio sta fuori dal gruppo che ruota: è il disco a girare, non il braccio.
La polvere usa un generatore pseudo-casuale con seme fisso, così il calcolo
resta puro e la scena è riproducibile.

Su schermi ≤ 900 px e senza WebGL resta la composizione SVG di
`effects/HeroFallback.tsx`, che disegna lo stesso vinile inclinato.

#### Le sezioni allo scroll

`effects/SectionIntro.tsx` è la testata condivisa di Progetti, Percorso,
Competenze e Colonna sonora: l'eyebrow entra da sinistra, una linea si allarga
sotto, e ogni parola del titolo sale da dietro una maschera (`overflow: hidden`,
niente `visibility`, quindi il testo resta sempre leggibile dagli screen reader
e dai motori di ricerca). Vale la stessa rete di sicurezza dei reveal: se
l'osservatore non scatta, dopo 1,5 s il testo compare comunque.

#### La sequenza d'apertura

Dura **3,4 s** e va in scena a **ogni caricamento della pagina** (nessuna
memoria fra una visita e l'altra: è una scelta esplicita, non una svista).

Le fasi, in `effects/introScene.ts`:

1. una fessura di luce si apre al centro;
2. la fessura diventa un disco, che si inclina e cresce in prospettiva;
3. il piatto gira — solchi, riflesso radente sul bordo, due orbite inclinate;
4. la puntina ruota attorno al perno e appoggia sul solco esterno;
5. la polvere si solleva dal centro;
6. il foro del perno si allarga fino a coprire lo schermo: si attraversa il
   disco invece di guardarlo sparire.

È **canvas 2D e non WebGL** di proposito: l'intro è la prima cosa che si vede e
caricare Three.js prima del primo fotogramma costerebbe ~880 kB. Qui il costo è
zero, nessuna dipendenza e nessun asset. Il contatore `000/100` viene scritto
direttamente nel DOM dentro il `requestAnimationFrame`, senza re-render.

**Non è uno splash bloccante**: il contenuto del sito è già nel DOM sotto il
velo (che è `aria-hidden`, mentre il canvas espone `role="img"` con una
descrizione), si chiude con un click, con un tasto qualsiasi o a fine sequenza,
e con `prefers-reduced-motion: reduce` non compare affatto. Mentre è visibile lo
scroll è bloccato e il focus è sul pulsante "Salta intro". Il bagliore finale è
una singola campana di luminosità — nessun lampeggio ripetuto, quindi resta
sotto la soglia dei tre flash al secondo.

#### Come sono guidati gli ingressi

Tutti i reveal passano da `hooks/useReveal.ts`, che è solo un
`IntersectionObserver` con `once`. **Nessun timer di sicurezza**: in una
versione precedente un failsafe da 1,5 s rivelava l'intera pagina subito dopo
il caricamento, e scorrendo non si vedeva più comparire nulla. L'unico caso in
cui il contenuto si mostra senza osservatore è quando l'API non esiste.

Le varianti d'ingresso di `Reveal` sono `up` (testi), `rise` (schede: salita,
scala e una punta di prospettiva), `left` (tappe della timeline) e `zoom`.

Due animazioni sono invece **legate allo scroll**, non a una soglia: la linea
della timeline si disegna man mano che la sezione attraversa lo schermo
(`useScroll` + `useTransform` su `scaleY`), e la hero esce di scena salendo e
sfumando. Entrambe toccano solo `transform` e `opacity`.

#### Budget di rendering

Obiettivo: **60 fps sempre**, misurati sui tempi fra fotogrammi e non sulla media.
Cosa è servito, in ordine di guadagno:

| Intervento | Prima | Dopo |
|---|---|---|
| Buffer dello sfondo a 0,45× invece che a risoluzione piena | 22 fps | 60 fps |
| Materiali e luci del vinile alleggeriti, alone di fondo più piccolo | 19 fps | 59 fps |
| Un solo `requestAnimationFrame` condiviso al posto di tre | — | meno punti in cui perdere frame |
| Solchi del vinile in una sola geometria | 40 draw call | 1 |



- **Un solo `requestAnimationFrame`** per tutta la pagina: `lib/ticker.ts`
  raccoglie sfondo, equalizzatore e anello del puntatore. Si ferma da solo
  quando non ha iscritti, con la tab in background o senza focus, e riprende
  con il tempo "congelato" invece di saltare in avanti.
- Gli effetti che seguono il puntatore scrivono direttamente su `style`:
  nessun `setState` di React a ogni movimento del mouse.
- Lo sfondo disegna a **30 fps** e riusa il gradiente finché il centro non si
  sposta davvero; gli equalizzatori vanno a ~40 fps e si fermano fuori dal
  viewport.
- I solchi del vinile 3D sono **una sola geometria** (`lineSegments` con colori
  per vertice): una draw call invece di quaranta.
- Il DPR del canvas 3D è limitato a 1,5 e l'antialias si attiva solo dove non
  c'è già un DPR alto a mascherare le scalettature.
- Se la pagina resta comunque sotto i 50 fps per due secondi, entra in modalità
  risparmio: `lib/ticker.ts` avvisa gli effetti e lo sfondo dimezza la frequenza;
  dentro la scena 3D `useAdaptiveQuality` abbassa il DPR e toglie prima il
  pulviscolo, poi le orbite. Su una GPU normale non scatta mai.
- **Regola**: la modalità risparmio non deve mai disiscrivere un effetto dal
  ticker lasciandone attivi i listener. L'anello del puntatore lo faceva e il
  risultato era un pallino fermo sullo schermo: il listener continuava a
  mostrarlo mentre il ciclo che lo muoveva era già spento. Ora l'anello non
  partecipa alla degradazione — costa una `transform` per fotogramma.

#### Il cursore

`effects/Cursor.tsx` sostituisce la freccia di sistema, invece di affiancarla.
Tre pezzi con tracciamenti diversi:

- il **punto** sta esattamente sul puntatore, così mirare resta preciso;
- l'**anello** insegue con un ritardo morbido ed è la parte che dà carattere;
- la **manina** ciano — indice teso, stile "seleziona collegamento" — prende il
  posto degli altri due sugli elementi cliccabili, con il punto sensibile sulla
  punta del dito.

La manina è disegnata due volte sullo stesso profilo: prima un alone chiaro,
poi il riempimento ciano con contorno scuro. Serve perché sui pulsanti ciano
una mano ciano sparirebbe. Anello e punto hanno un contorno scuro per lo stesso
motivo, sopra il titolo della hero.

La freccia di sistema viene nascosta con `html.has-custom-cursor`, classe che
il componente aggiunge **solo quando è montato davvero**: su touch, senza
puntatore preciso o con `prefers-reduced-motion` non si monta e resta il cursore
del sistema operativo. Se lo script non parte, la classe non compare e la pagina
resta usabile.

Conseguenza voluta: sparisce anche il cursore a I per la selezione del testo.
Selezionare si può ancora, semplicemente senza cambio di puntatore.

#### Posizione dello scroll al ricaricamento

Il browser di suo rimette lo scroll dov'era (`history.scrollRestoration` vale
`'auto'`): su una pagina unica significa ritrovarsi a metà sito dopo un
refresh. `lib/scrollRestoration.ts` passa a `'manual'` e riporta in cima, prima
del render così non si vede alcun salto. Le ancore restano intatte: se
nell'indirizzo c'è `#percorso` la posizione la decide quella, non il ripristino.

#### Perché il ciclo non può restare fermo

Tre difese, dopo un blocco segnalato dal vivo che qui non si riproduceva:

1. **Eccezioni isolate.** Ogni iscritto gira dentro un `try`/`catch`. Prima un
   errore in un singolo effetto impediva la richiesta del fotogramma successivo
   e congelava l'intera pagina.
2. **Niente `blur`/`focus`.** Fermavano il ciclo anche aprendo i DevTools o
   cliccando la barra degli indirizzi, e il `focus` di ritorno non è garantito:
   bastava una volta per restare fermi per sempre. Resta `visibilitychange`,
   che è il segnale corretto per "scheda non visibile".
3. **Battito di controllo** ogni due secondi: se la pagina è visibile, ci sono
   iscritti e l'ultimo fotogramma è più vecchio di un secondo, il ciclo
   riparte.

Sul lato 3D vale la stessa idea: `onPointerOut` di R3F scatta solo se il
puntatore si muove, quindi uscendo dal disco *scorrendo* il bagliore restava
acceso. Ora si spegne anche su `pointerleave` del canvas e quando la scena va
in pausa.
- Durante l'intro la scena 3D e lo sfondo animato **non partono**: si carica una
  cosa alla volta. Nel frattempo il chunk di Three.js viene scaricato in
  parallelo (`import()` in `Hero.tsx`), così alla fine dell'intro è già in cache
  e non c'è alcun salto.

### Regole generali

- HTML semantico (`header`, `nav`, `main`, `section`, `footer`), un solo `h1`.
- Skip link, focus visibile, navigazione completa da tastiera, menu mobile con
  `aria-expanded`/`aria-controls`, chiusura con `Escape` e ritorno del focus.
- Il canvas WebGL è `aria-hidden`; le etichette Frontend / API / Database sono
  HTML reale, leggibile dagli screen reader.
- Il testo della hero è HTML indipendente dal 3D: si vede subito, anche se
  WebGL non è disponibile o il contesto viene perso (in quel caso resta una
  composizione SVG originale).
- Su schermi ≤ 900 px il bundle Three.js **non viene nemmeno scaricato**: si usa
  direttamente la composizione SVG.
- Il rendering 3D si ferma fuori dal viewport e quando la tab non è visibile;
  il DPR è limitato.
- `prefers-reduced-motion: reduce`: niente rotazione, parallax, tilt, scroll
  fluido né reveal con spostamento. Il contenuto compare subito.
- I reveal hanno una rete di sicurezza: se l'`IntersectionObserver` non scatta,
  dopo 1,5 s il contenuto viene mostrato comunque.
- Contrasto: il rapporto più basso fra le combinazioni usate è 8,9:1, oltre la
  soglia WCAG AA (4,5:1).

---

## Componenti esterni e licenze

Vedi **`THIRD_PARTY_NOTICES.md`** per l'elenco completo, inclusa la posizione di
React Bits (MIT + Commons Clause) e la scelta di non copiarne il codice, e la
provenienza di ogni immagine.

---

## Verifiche eseguite

Ambiente: Windows 11, Node.js 24.16, npm 11.13, Chrome 152 headless
(`--disable-gpu`, quindi WebGL via software rasterizer).

| Verifica | Esito |
|---|---|
| `npm run typecheck` (TypeScript strict) | nessun errore |
| `npm run lint` | nessun errore, nessun warning |
| `npm test` | 31 test, 9 file, tutti verdi |
| `npm run build` | build riuscita |
| Resa visiva a 1440 / 1024 / 768 / 390 px | verificata via screenshot CDP |
| Overflow orizzontale fino a 320 px | assente |
| Menu mobile: apertura, `Escape`, chiusura dopo la selezione | ok (anche via test) |
| Pannello "Dettagli": apertura/chiusura, `aria-expanded` | ok (anche via test) |
| Dettagli aperti su una scheda | le altre restano chiuse e alla propria altezza (la griglia usa `align-items: start`, non `stretch`) |
| Cursore dopo uno scroll lungo | continua a seguire il mouse anche con CPU strozzata 6× (condizione in cui la modalità risparmio scatta di sicuro) |
| Cursore: freccia di sistema | `cursor: none` su body e pulsanti, `html.has-custom-cursor` presente solo con puntatore preciso |
| Cursore: manina | compare sui cliccabili e sparisce altrove, leggibile sia su fondo scuro sia sui pulsanti ciano (verificato con screenshot ravvicinati) |
| Ciclo condiviso con un effetto che solleva eccezioni a ogni fotogramma | la pagina resta viva, l'anello continua a seguire |
| Ciclo condiviso dopo un `blur` senza `focus` di ritorno | resta vivo |
| Refresh a metà pagina | si riparte da `scrollY: 0`, con `scrollRestoration: manual` |
| Apertura diretta su `#percorso` | porta alla sezione, non in cima |
| `prefers-reduced-motion: reduce` | contenuto immediato, scena statica |
| WebGL disabilitato (`--disable-webgl`) | fallback SVG mostrato |
| Sequenza d'apertura: comparsa a ogni caricamento, skip con click e con tastiera | ok (anche via test) |
| Build con `BASE_PATH` e servizio in sottocartella | pagina e asset ok |
| Console del browser | nessun errore, nessuna richiesta fallita |
| Reveal legati allo scroll | a pagina appena caricata schede e dischi sono a `opacity: 0`, la linea della timeline a `scaleY(0)`; dopo lo scroll tutto a 1 |
| Fotogrammi durante uno scroll completo | 60 fps, **zero** fotogrammi oltre i 20 ms, il peggiore a 16,8 ms — a 1440, 1024 e 390 px, in Chrome headless con rasterizzatore software |
| Fotogrammi restando sulla hero con il 3D attivo | 60 fps, zero fotogrammi persi |
| Cambio lingua | testi, `<html lang>`, titolo e CV scaricato cambiano insieme (anche via test) |
| Long task e layout shift | un solo long task da ~89 ms (compilazione della scena 3D), CLS 0 |
| Contenuto del CV italiano e posizione dei link | verificati con rendering PDFium |
| Link a repository, email, LinkedIn, download del CV | verificati manualmente |
| Contenuto del PDF e link "Repository" | verificati con rendering PDFium |

**Non eseguito:** Lighthouse (non disponibile nell'ambiente), quindi non sono
riportati punteggi di Performance/Accessibility/SEO; test dei tre repository dei
progetti.

---

## Limiti noti

- Il chunk della scena 3D pesa ~883 kB (235 kB gzip): è Three.js, viene caricato
  in lazy e solo su desktop. Su mobile e con movimento ridotto non si scarica.
- Gli screenshot dei progetti sono catture reali ma statiche: se aggiorni un
  progetto, ricattura l'immagine.
- Lo screenshot di EpiWeather mostra la home, non la dashboard meteo: quella
  richiede chiavi API personali.
- Nessuna demo live è indicata perché nessuna è stata verificata. Aggiungi
  `demoUrl` solo dopo aver controllato che l'URL risponda.
- Il sito è solo in italiano: non c'è (e non deve esserci) un selettore di lingua
  fittizio.
- L'intro a ogni caricamento ha un costo: per i primi 3,4 s la hero è coperta dal
  velo, quindi una misura di LCP la conteggia. È una scelta voluta a favore
  dell'impatto; per rimuoverla basta togliere `<Intro />` da `src/App.tsx`, per
  accorciarla basta abbassare `INTRO_DURATION_MS` in
  `effects/introScene.ts`.
