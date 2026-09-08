# Prompt per Claude Code — Portfolio Lorenzo Melis

Agisci come senior frontend engineer e creative developer. Realizza concretamente nel workspace un portfolio personale completo, responsive, accessibile e pronto per GitHub Pages. Scrivi il codice, avvialo, verifica il risultato e correggi i problemi: non fermarti a un piano o a frammenti di esempio.

## 1. Obiettivo e metodo

Il portfolio appartiene a Lorenzo Melis, Junior Full-Stack Developer, laureato in ingegneria informatica, studente EPICODE AI Full-Stack Developer con precedente esperienza professionale in cybersecurity. Deve supportare candidature junior full stack e dimostrare cura del frontend, capacità di integrazione e attenzione alla sicurezza.

Il design approvato è uno studio digitale scuro con accenti ciano, titoli grandi e una scultura astratta luminosa nella hero. L'impatto deve essere notevole, ispirato alle interazioni di React Bits, mantenendo progetti e CV immediatamente accessibili.

Prima di modificare file, leggi le istruzioni del repository e controlla lo stato Git. Se esiste già un progetto, adattalo senza cancellare lavoro non pertinente; altrimenti inizializza il portfolio. Prendi autonomamente le normali decisioni implementative. Se manca un asset non essenziale, usa un fallback onesto e documentato e continua. Non inventare credenziali, dati personali, competenze o risultati. Non eseguire push, pubblicazioni o modifiche ai repository sorgente dei progetti: prepara tutto localmente e fornisci le istruzioni finali.

Se allego il mockup approvato, usalo come riferimento prioritario per proporzioni, gerarchia, colori e composizione. Non trasformare lo screenshot in un'immagine a tutta pagina: testo, pulsanti, sezioni e schede devono essere componenti reali. La descrizione seguente consente di lavorare anche senza mockup.

## 2. Stack e architettura

- React + TypeScript + Vite, con TypeScript strict.
- CSS modulare o CSS Modules con design token; evita framework di stile aggiuntivi se non necessari.
- Motion per React per reveal e microinterazioni, consultando la documentazione attuale per installazione e API.
- React Three Fiber / Three.js per la scultura della hero; usa Drei soltanto dove serve.
- Componenti selezionati da https://reactbits.dev/ per effetti grafici coerenti. Verifica nomi, API, dipendenze e licenze nella documentazione e nel codice ufficiale prima di integrarli. Non inventare pacchetti o comandi di installazione. Evita componenti a pagamento; conserva attribuzioni e licenze richieste in THIRD_PARTY_NOTICES.md.
- Icone di una sola libreria coerente, ad esempio Lucide React.
- Un solo package manager, preferibilmente npm, con lockfile versionato e versioni compatibili.
- Sito statico senza backend obbligatorio, database, login, CMS o chiavi API.
- Contenuti locali: il sito pubblicato non deve dipendere da richieste a GitHub per mostrare le schede.

Preferisci una pagina unica con ancore. I dettagli dei progetti possono essere pannelli espandibili accessibili; se scegli un dialog, implementa focus, Escape e ripristino del focus. Evita routing history che richieda riscritture server su GitHub Pages.

Struttura indicativa, adattabile con motivazione:

```text
src/
  components/         # Navbar, Hero, ProjectCard, ProjectDetails, Timeline, Footer...
  components/effects/ # HeroScene, Reveal, SpotlightCard...
  data/profile.ts
  data/projects.ts
  styles/             # token, globali, componenti
  hooks/
  App.tsx
  main.tsx
public/
  images/projects/
  cv/
  favicon.svg
.github/workflows/deploy.yml
README.md
THIRD_PARTY_NOTICES.md
```

## 3. Direzione visiva

Palette di partenza:

```css
--bg: #080e13;
--surface: #101920;
--text: #f3f2ed;
--muted: #a7bac9;
--accent: #22d3ee;
--accent-blue: #2196f3;
--border: #2a414f;
```

Verifica e correggi il contrasto dei colori nei contesti effettivi. Sfondo grafite con bagliori blu/ciano molto discreti. Tipografia sans moderna come Inter o equivalente, possibilmente locale e con licenza compatibile. Monospace per piccoli indici, tecnologie e dettagli tecnici. Titoli grandi, pesi decisi, spazi generosi. Contenitore centrale massimo circa 1200–1280 px; padding fluido. Schede con raggio moderato, bordi sottili, superfici scure. Niente emoji decorative, barre percentuali delle skill, Matrix, terminali finti usati come navigazione o caroselli automatici.

La prima schermata desktop comprende navigazione e hero a due colonne. Sotto compare una griglia di tre progetti. La pagina prosegue con presentazione, percorso, competenze e contatti usando lo stesso linguaggio visivo.

### Navigazione

Monogramma testuale LM a sinistra, L chiara e M ciano. Link Progetti, Percorso, Contatti; pulsante Scarica CV. Header sticky discreto, con sfondo sufficientemente opaco e bordo inferiore. Su mobile menu accessibile con etichetta, aria-expanded e chiusura dopo selezione. Le ancore devono tener conto dell'altezza della navbar.

### Hero: testi esatti

- Eyebrow: `LORENZO MELIS / PORTFOLIO`
- H1 su due righe ove possibile: `Junior Full-Stack` / `Developer.`
- La parola Developer. è ciano.
- Descrizione: `Dal mondo cybersecurity allo sviluppo di applicazioni complete.`
- Tecnologie: `React · TypeScript · Spring Boot · PostgreSQL`
- CTA principale: `Esplora i progetti`, verso la griglia.
- CTA secondaria: `GitHub`, verso https://github.com/JusTMeth25
- Nota: `In formazione · EPICODE AI Full-Stack Developer`

A destra realizza una scultura WebGL con piani traslucidi intersecati, contorni luminosi, piccoli nodi e orbite ciano. Deve richiamare strati software interconnessi. Tre piccole etichette HTML: Frontend, API, Database. Rotazione lenta e parallax controllato dal puntatore; nessun movimento brusco. Privilegia una geometria procedurale ben illuminata a un modello 3D pesante. Approssima la trasparenza se materiali complessi compromettono le prestazioni.

Non aggiungere altri sfondi animati pesanti sopra il canvas. Il testo resta HTML indipendente dal caricamento del 3D. Su mobile riduci dettaglio e altezza, oppure mostra una composizione statica curata. Prevedi fallback in caso di WebGL assente, errore o perdita del contesto. Un fallback CSS/SVG originale è accettabile; non usare il mockup dell'intera pagina come fallback.

### Animazioni

- Titolo con ingresso breve all'apertura, eseguito una sola volta.
- Reveal delle sezioni con lieve traslazione e opacità, durata indicativa 400–650 ms.
- Schede con spotlight ciano al passaggio del mouse e tilt minimo su dispositivi con puntatore preciso.
- Pulsanti con feedback hover, focus-visible e active; non spostare i target per inseguire il mouse.
- Nessun effetto indispensabile per capire o usare il sito.
- Rispetta prefers-reduced-motion: elimina rotazione, parallax, tilt, scroll fluido e reveal con spostamento; il contenuto deve comparire subito.
- Metti in pausa il rendering animato fuori viewport e quando il documento non è visibile; limita DPR e complessità su dispositivi meno potenti. Evita aggiornamenti React di stato a ogni movimento del mouse.

## 4. I tre progetti, in questo ordine esatto

Titolo sezione: `Progetti in primo piano`. Eyebrow: `01 / SELECTED WORK`. Link di sezione: `Vedi GitHub`.

Leggi i repository, i README, i manifest e i file pertinenti per verificare descrizioni e funzionalità. I dati sotto derivano da una precedente ispezione: usa il codice corrente come riscontro, perché i README potrebbero essere incompleti. Non modificare questi repository. Non eseguire applicazioni scaricate senza prima controllare script e dipendenze.

### 1 — Spotify Clone

- Repository: https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-11
- Etichetta: `EPICODE · SETTIMANA 11`
- Titolo editoriale: `Spotify Clone`
- Descrizione breve: `Ricerca musicale, preferiti e playlist con stato gestito in Redux.`
- Tag principali: React, Redux Toolkit, Vite.
- Dal codice già ispezionato risultano componenti per ricerca, preferiti, playlist, player e integrazione Deezer. Verifica il comportamento prima di descrivere riproduzione o persistenza come funzionanti. Non presentarlo come prodotto ufficiale Spotify né implicare un'affiliazione.
- Direzione copertina: interfaccia musicale scura con copertine, navigazione laterale e player; piccolo accento verde contenuto nella preview.

### 2 — Vinilshelf

- Repository: https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-3
- Etichetta: `EPICODE · SETTIMANA 3`
- Titolo: `Vinilshelf`
- Descrizione breve: `Collezione di vinili con ricerca, filtri e gestione degli acquisti.`
- Tag principali: JavaScript, HTML, CSS.
- Interfaccia rilevata: inserimento titolo/artista/anno, stato posseduto o da acquistare, ricerca, filtri, ordinamento, contatori e cambio tema. Verifica script e comportamento; non attribuirgli React o un database.
- Direzione copertina: collezione di dischi con ricerca e stati, eventuale accento ambra.

### 3 — EpiWeather

- Repository: https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-10
- Etichetta: `EPICODE · SETTIMANA 10`
- Titolo: `EpiWeather`
- Descrizione breve: `Meteo e previsioni per città, con geocoding e artwork dinamico.`
- Tag principali: React, Vite, OpenWeather.
- Il README descrive ricerca città con scelta tra omonimi, meteo attuale, previsioni, React Router e artwork città da Unsplash. Cita anche test Vitest/Testing Library: verifica presenza e stato prima di riportare risultati.
- Direzione copertina: dashboard meteo con skyline, temperatura e previsioni.

### Copertine e dettagli

Preferisci screenshot reali disponibili nei repository o acquisiti localmente, se l'app può essere avviata senza credenziali mancanti. Le immagini del mockup approvato sono illustrative: non presentarle come screenshot reali. Anche il README di EpiWeather dichiara alcune preview illustrative; controlla la provenienza.

Se uno screenshot reale non è disponibile, realizza una copertina astratta originale coerente con il progetto e indicala come `Copertina illustrativa`. Non inventare un'interfaccia più avanzata spacciandola per l'app esistente. Usa asset locali leggeri, con dimensioni dichiarate e lazy loading sotto la hero. Non usare immagini remote casuali o hotlink instabili.

Ogni scheda deve avere titolo, etichetta, descrizione, tag e link `Repository GitHub`. Mostra `Demo live` solo quando un URL reale è stato verificato. Un'eventuale azione `Dettagli` apre una scheda sintetica con scopo, funzionalità verificate, stack e contributo personale effettivamente documentato. Non inventare metriche, clienti, utenti, risultati di test o attribuzione individuale di lavori di gruppo.

## 5. Modifica semplice dei progetti

Tutti i dati devono essere centralizzati in `src/data/projects.ts`. I componenti non devono contenere testi, URL o condizioni legati ai tre progetti specifici.

Definisci un tipo simile a questo, adattandolo alle esigenze reali:

```ts
type Project = {
  id: string;
  title: string;
  label: string;
  description: string;
  tags: string[];
  repositoryUrl: string;
  demoUrl?: string;
  image: string;
  imageAlt: string;
  imageKind: 'screenshot' | 'illustration';
  featured: boolean;
  order: number;
  details?: { overview: string; features: string[]; notes?: string[] };
};
```

Filtra per featured e ordina per order. Aggiungere, rimuovere, sostituire o riordinare un progetto deve richiedere soltanto la modifica dei dati e degli eventuali asset. La griglia deve funzionare anche con un numero diverso da tre. Un'immagine mancante deve avere un fallback decoroso. Spiega tutto nel README con un esempio concreto.

## 6. Profilo, percorso e competenze

Centralizza dati e testi in `src/data/profile.ts`. Lingua iniziale italiana; nessun selettore lingua fittizio. Mantieni il tono professionale e concreto, coerente con una candidatura junior nello sviluppo.

Titolo presentazione: `Sviluppo con una prospettiva sulla sicurezza.`

Testo di base da rifinire senza alterare i fatti:

`Sono Lorenzo Melis, laureato in ingegneria informatica e attualmente in formazione nel percorso EPICODE AI Full-Stack Developer. Sviluppo progetti con React, JavaScript, TypeScript, Java, Spring Boot e PostgreSQL. Porto nello sviluppo l'esperienza maturata nella cybersecurity, con attenzione alla sicurezza, alla gestione dei dati e alla collaborazione con team tecnici.`

Dati riportati nel CV fornito:

- EPICODE — AI Full-Stack Developer, maggio 2026–in corso; completamento previsto novembre 2026. Lo stato resta un dato modificabile, non presumere il completamento al passaggio della data.
- Laurea in Ingegneria Informatica L-08 — Universitas Mercatorum, 2023–2026, voto 105/110.
- Master Networks and Information Systems — ELIS College, Roma, 2018–2019.
- Protiviti, Roma — Senior Cyber Security Consultant, settembre 2025–aprile 2026. Governance e compliance cybersecurity, valutazioni del rischio ICT, controlli, valutazione fornitori e supporto alla remediation.
- KPMG Advisory, Roma — Cyber Security Consultant, marzo–giugno 2025. Information security e technology risk, policy, vulnerability assessment, IAM/IAG e continuità operativa.
- Cybertech – Engineering, Roma — percorso da Cyber Security Analyst a Specialist e Consultant, maggio 2019–dicembre 2024. SIEM/log analysis, incident handling, Azure, IAM/PAM, DLP e collaborazione con team tecnici e operativi.

Presenta la transizione professionale in una timeline breve e leggibile. Conserva il titolo Senior solo per l'esperienza cybersecurity in cui compare, senza suggerire seniority nello sviluppo software.

Competenze documentate:

- Frontend: HTML5, CSS3, JavaScript, TypeScript, React, Redux Toolkit, Bootstrap, Sass.
- Backend e dati: Java, Spring Boot, Spring Web, Spring Data JPA, Spring Security, REST API, SQL, PostgreSQL.
- Strumenti: Git, GitHub, Postman, Maven, Vite.
- Background IT: Linux, Microsoft Azure, networking, cybersecurity.
- Lingue: italiano fluente, inglese avanzato, spagnolo base.

Usa gruppi testuali e, dove possibile, collegamenti ai progetti pertinenti. Nessuna percentuale di padronanza. Il nome del corso contiene AI, ma i tre progetti selezionati non documentano funzionalità AI: non aggiungere claim su LLM, agenti o machine learning. Non aggiungere Python, Node.js, Docker o CI/CD come competenze personali già acquisite soltanto perché richieste da un annuncio o usate per costruire il portfolio.

Certificazioni opzionali in un'area compatta, se utili: CompTIA Security+ ce, Linux LPIC-1, Cisco CCNA Routing and Switching, Cisco Cyber Threat Management, ITIL v4 Foundation. Riportale come indicate nel CV senza affermare validità attuale o date non documentate. Non inserire loghi aziendali a scopo decorativo o testimonial.

## 7. Contatti e CV

- Email: lorenzo.melis@yahoo.it
- GitHub: https://github.com/JusTMeth25
- LinkedIn: https://www.linkedin.com/in/lorenzo-melis97/
- Nome: Lorenzo Melis.

Sezione contatti con breve invito a parlare di opportunità junior full stack, link email via mailto, GitHub e LinkedIn. Puoi aggiungere copia email con feedback accessibile e fallback se Clipboard API non è disponibile. Nessun modulo che simuli un invio inesistente. Non pubblicare il numero di telefono per impostazione predefinita.

Prevedi il PDF in `public/cv/lorenzo-melis-cv.pdf`, con percorso configurabile. Se fornisco un PDF reale, usalo. Se fornisco solo lo screenshot, non creare un PDF fittizio o un download rotto: mantieni il layout della CTA, ma mostra temporaneamente `Richiedi CV` con mailto e documenta come attivare `Scarica CV`. Se fornisco una foto, puoi usarla nella sezione profilo; non è necessaria nella hero. Non generare un mio ritratto.

Footer essenziale con nome, anno e link utili. Non aggiungere banner cookie in assenza di servizi che lo richiedano e non inserire analytics di default.

## 8. Responsive, accessibilità e prestazioni

- Desktop: hero a due colonne, tre schede per riga.
- Tablet: riequilibra hero e griglia, anche due schede per riga.
- Mobile: singola colonna, testo prima della grafica, CTA raggiungibili e nessun overflow orizzontale.
- HTML semantico: header, nav, main, section, footer; un solo H1 e gerarchia coerente.
- Skip link, focus visibile, navigazione da tastiera completa, nomi accessibili per icone e controlli.
- Obiettivo WCAG AA per contrasto; controlla anche testi secondari e tag.
- Le decorazioni canvas non devono creare rumore per screen reader; le etichette utili restano accessibili.
- Contenuti leggibili durante il caricamento e senza WebGL; nessuno splash screen bloccante.
- Lazy-load del 3D e degli asset non essenziali, cleanup di listener e risorse GPU, assenza di layout shift significativo.
- Mira a Lighthouse almeno 90 per Performance e almeno 95 per Accessibility, Best Practices e SEO, se misurabile nell'ambiente. Sono obiettivi: riporta i risultati reali e le condizioni di misura, senza inventare punteggi.

## 9. SEO e GitHub Pages

Prepara build statica, title e description pertinenti, favicon LM e metadati Open Graph. Crea una preview social locale se gli strumenti disponibili lo consentono. Configura canonical, URL assoluti social, sitemap e robots soltanto a partire dall'URL finale effettivo; non pubblicare domini segnaposto o localhost nei metadati.

Il portfolio deve supportare sia `https://JusTMeth25.github.io/` sia `https://JusTMeth25.github.io/NOME-REPOSITORY/`. Configura il base path di Vite in modo esplicito e documentato. Tutti gli asset, immagini, favicon e CV devono rispettarlo. Non fissare percorsi assoluti dalla root che rompano il project site. Se il nome del repository non è disponibile, prepara la configurazione parametrica e indica il singolo valore da impostare.

Prepara `.github/workflows/deploy.yml` per build e deploy su GitHub Pages tramite GitHub Actions, consultando la documentazione ufficiale attuale per versioni delle action e permessi. Usa npm ci, build, artifact e deploy, permessi minimi necessari ed environment GitHub Pages. Prevedi attivazione manuale e/o branch principale effettivo. Non pubblicare durante questa sessione senza una mia richiesta esplicita. Nel README spiega che un push successivo può attivare il workflow se configurato così.

## 10. Verifiche e consegna

Procedi per fasi: ispezione, struttura e dati, UI completa, effetti, verifica e rifinitura. Non fermarti dopo la hero e non consegnare sezioni vuote.

Esegui quanto disponibile:

1. Installazione riproducibile, typecheck, lint e build di produzione.
2. Avvio in locale e verifica visiva a circa 1440, 1024, 768 e 390 px.
3. Controllo di navbar, ancore, repository, email, stato del CV, dettagli e menu mobile.
4. Controllo tastiera, reduced motion e fallback senza WebGL.
5. Controllo del base path anche per una sottocartella GitHub Pages.
6. Verifica console, asset mancanti, overflow e cleanup delle animazioni.
7. Pochi test significativi per comportamento: ordinamento/selezione progetti, CTA senza PDF, menu o pannelli se complessi. Evita test che duplicano semplicemente il markup.

Se hai un browser automatizzabile, acquisisci screenshot desktop e mobile e correggi le discrepanze rispetto al riferimento. Se una verifica non è eseguibile, dichiaralo: non presentarla come superata.

Consegna codice completo, asset locali, lockfile, workflow e README in italiano con:

- comandi per installare, avviare, verificare e costruire;
- come modificare profilo e contatti;
- come cambiare progetti, ordine, immagini e link in un solo file;
- come sostituire le copertine illustrative con screenshot;
- come aggiungere il PDF e attivare il download;
- come impostare repository/base path/URL finale e pubblicare su Pages;
- provenienza e licenze dei componenti esterni;
- verifiche eseguite, limiti reali ed eventuali asset mancanti.

Nel riepilogo finale comunica cosa hai realizzato, come avviarlo e dove personalizzarlo. Il risultato deve essere un portfolio funzionante e curato, pronto per la mia revisione e pubblicazione.
