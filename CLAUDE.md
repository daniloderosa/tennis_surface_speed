# CLAUDE.md — Tennis Surface Speed Scrollytelling
# Progetto: "Non tutte le superfici sono uguali"
# Leggi tutto il file prima di scrivere una riga di codice.

---

## Identità del progetto

- **Titolo:** Non tutte le superfici sono uguali
- **Sottotitolo:** Nel tennis professionistico, il nome della superficie conta meno di quanto pensi
- **Autore/i:** Danilo
- **Lingua:** Italiano
- **Fonti dati:**
  - Tennis Abstract — surface speed ratings (1991–2025): `https://www.tennisabstract.com/cgi-bin/surface-speed.cgi?year=XXXX`
  - Jeff Sackmann / tennis_atp — risultati partite ATP (repo GitHub pubblico): `https://github.com/JeffSackmann/tennis_atp`
  - Match Charting Project — rally length per partita: `https://github.com/JeffSackmann/tennis_MatchChartingProject`
- **Deploy:** GitHub Pages via `@sveltejs/adapter-static`

---

## Struttura narrativa

```
HERO
  Apertura visiva con il titolo. Sfondo neutro, nessun grafico ancora visibile.

SEZIONE 1 — "Tre superfici, tre mondi diversi?"
  Step 0: il luogo comune — hard veloce, erba velocissima, terra lenta.
           Grafico: strip plot di tutti i tornei, punti grigi (nessun colore ancora).
  Step 1: i colori appaiono — hard blu, terra arancione, erba verde.
           Il lettore si aspetta tre cluster separati.
  Step 2: zoom sulle anomalie — label su Gstaad (terra, 1.03),
           Roland Garros (terra, 0.68), Indian Wells 2025 (hard, 0.72),
           Paris Masters (hard, 0.95). Fascia di sovrapposizione evidenziata.
           Messaggio: alcune terre sono più veloci di alcuni hard.

SEZIONE 2 — "Cosa cambia davvero in campo?"
  Step 0: introduce il rally length come metrica chiave.
           Grafico: scatterplot surface speed (X) vs rally length media (Y).
           Ogni punto è un torneo. Correlazione visibile ma non perfetta.
  Step 1: gli outlier vengono nominati — Gstaad (terra veloce, rally corti),
           Parigi Masters (hard lento, rally lunghi).
           Messaggio: la superficie non determina tutto da sola.

SEZIONE 3 — "Com'è cambiato nel tempo?"
  Step 0: line chart con tre linee (hard, terra, erba), velocità media per anno,
           1991–2025. Asse X = anni, asse Y = surface speed rating medio.
  Step 1: le linee non convergono — la varianza è stabile.
           Highlight del periodo 2005–2010 come momento di cambiamento percepito.
  Step 2: compare una seconda serie — lunghezza media dei rally nel tempo.
           I rally si allungano su tutte le superfici, ma le superfici restano distinte.
           Messaggio: non sono le superfici a cambiare, è il modo di giocare.

SEZIONE 4 — "Oggi: la mappa reale dei tornei"
  Step 0: ritorno al strip plot della Sezione 1, ora con tutti i label visibili.
           I tornei anomali sono evidenziati con annotazioni.
  Step 1: box espandibile con spiegazione tecnica (altitudine, palline, temperatura).
           Questo è l'unico elemento non-grafico interattivo della pagina.

OUTRO
  Testo di chiusura. Nessun grafico.
```

---

## Stack tecnico

| Cosa | Strumento | Note |
|---|---|---|
| Framework | SvelteKit 2+ con Svelte 5 (runes) | Sempre runes, mai la vecchia API |
| Build | Vite 6+ | |
| Grafici | LayerChart + D3 v7 | LayerChart è il layer principale, D3 per calcoli e transizioni |
| Grafici esplorativi | Svelteplot | Solo se LayerChart non copre il caso d'uso |
| Scrollytelling | `Scrolly.svelte` custom (IntersectionObserver) | Già nel template, non ricreare |
| CSS | Custom properties — nessun framework CSS | Tutto in `tokens.css` |
| Deploy | `@sveltejs/adapter-static` → GitHub Pages | |

---

## Design system — Reuters Graphics

Il progetto usa i token del design system di Reuters Graphics come base.
Tutti i valori sono definiti in `src/lib/styles/tokens.css` come custom properties CSS.
Per cambiare font, colori o spaziature: modifica **solo** `tokens.css`, non i componenti.

### Font

Reuters Graphics usa quattro famiglie tipografiche.

```css
--font-display:    'Barlow Condensed', sans-serif;  /* titoli hero — fallback di KiloMetric */
--font-sans:       'Roboto', 'Arial', sans-serif;   /* corpo testo */
--font-serif:      'Georgia', serif;                /* citazioni, pull quote */
--font-mono:       'Roboto Mono', monospace;        /* dati, assi */
```

Google Fonts da caricare: `Barlow+Condensed:wght@600;700`, `Roboto:wght@400;500`, `Roboto+Mono`.

### Palette — Reuters Nord (thematic)

Colori derivati dalla palette Nord usata da Reuters Graphics per UI e dataviz.

```css
/* Sfondo e superfici */
--color-bg:           #2E3440;   /* nord0 */
--color-surface:      #3B4252;   /* nord1 */
--color-surface-2:    #434C5E;   /* nord2 */
--color-border:       #4C566A;   /* nord3 */

/* Testo */
--color-text:         #ECEFF4;   /* nord6 */
--color-text-muted:   #D8DEE9;   /* nord4 */
--color-text-faint:   #E5E9F0;   /* nord5 */

/* Superfici tennis — colori categorici dataviz */
--color-hard:         #5E81AC;   /* nord10 — blu */
--color-clay:         #BF616A;   /* nord11 — rosso/arancio */
--color-grass:        #A3BE8C;   /* nord14 — verde */

/* Highlight e annotazioni */
--color-highlight:    #EBCB8B;   /* nord13 — ambra */
--color-primary:      #88C0D0;   /* nord8  — azzurro chiaro */
--color-secondary:    #81A1C1;   /* nord9  — blu medio */

/* Scala sequenziale Reuters (blueberry) */
--color-seq-min:      #C8DAF0;
--color-seq-max:      #044F74;
```

### Spaziatura e layout

```css
--step-width:         360px;
--chart-max-width:    960px;
--section-gap:        6rem;
--step-height:        85vh;

--text-hero:          clamp(2.8rem, 6vw, 5rem);
--text-section-title: clamp(1.6rem, 3vw, 2.4rem);
--text-step:          1rem;
--text-label:         0.8rem;
--text-axis:          0.75rem;
--line-height-body:   1.65;

--z-sticky:   10;
--z-overlay:  20;
--z-tooltip:  30;
```

---

## BOOTSTRAP — Istruzioni per progetto nuovo (cartella vuota)

> Se nella cartella esiste già un `package.json`, salta questa sezione.

### Passo 1 — Inizializza SvelteKit

```bash
npx sv create . --template minimal --no-add-ons
```
Quando chiede: TypeScript → No, ESLint → No, Prettier → Sì, Playwright → No.

### Passo 2 — Installa le dipendenze

```bash
npm install d3 layerchart svelteplot
npm install --save-dev @sveltejs/adapter-static svelte-preprocess autoprefixer postcss
```

### Passo 3 — svelte.config.js

```js
import adapterStatic from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';

export default {
  compilerOptions: { runes: true },
  preprocess: sveltePreprocess({ postcss: { plugins: [autoprefixer] } }),
  kit: {
    adapter: adapterStatic({ strict: false }),
    paths: {
      base: '/tennis_surface_speed'   // ← nome esatto della repo GitHub
    },
    alias: {
      '$components': './src/components',
      '$data':       './src/lib/data',
      '$styles':     './src/lib/styles',
      '$utils':      './src/lib/utils'
    }
  }
};
```

### Passo 4 — vite.config.js

```js
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: { open: true, port: 5173 }
});
```

### Passo 5 — Struttura cartelle

```
src/
├── components/
│   ├── charts/
│   │   ├── StripPlot.svelte           ← sezioni 1 e 4
│   │   ├── ScatterRallySpeed.svelte   ← sezione 2
│   │   └── LineHistorical.svelte      ← sezione 3
│   ├── sections/
│   │   ├── Hero.svelte
│   │   ├── ScrollySection.svelte      ← wrapper riutilizzabile
│   │   └── Outro.svelte
│   ├── helpers/
│   │   └── Scrolly.svelte
│   └── ui/
│       ├── StepCard.svelte
│       ├── Tooltip.svelte
│       ├── Annotation.svelte          ← label annotate sui grafici
│       └── ExpandableBox.svelte       ← box tecnico espandibile (sezione 4)
├── lib/
│   ├── data/
│   │   ├── surface_speed_current.json
│   │   ├── surface_speed_by_year.json
│   │   └── rally_length_by_tournament.json
│   └── styles/
│       ├── tokens.css                 ← UNICO punto di controllo del design
│       └── global.css
└── routes/
    ├── +layout.svelte
    └── +page.svelte
static/
└── data/                              ← CSV grezzi originali (non modificare)
```

### Passo 6 — src/lib/styles/tokens.css

```css
:root {
  --color-bg:           #2E3440;
  --color-surface:      #3B4252;
  --color-surface-2:    #434C5E;
  --color-border:       #4C566A;

  --color-text:         #ECEFF4;
  --color-text-muted:   #D8DEE9;
  --color-text-faint:   #E5E9F0;

  --color-hard:         #5E81AC;
  --color-clay:         #BF616A;
  --color-grass:        #A3BE8C;

  --color-highlight:    #EBCB8B;
  --color-primary:      #88C0D0;
  --color-secondary:    #81A1C1;

  --color-seq-min:      #C8DAF0;
  --color-seq-max:      #044F74;

  --font-display:  'Barlow Condensed', sans-serif;
  --font-sans:     'Roboto', 'Arial', sans-serif;
  --font-serif:    'Georgia', serif;
  --font-mono:     'Roboto Mono', monospace;

  --text-hero:          clamp(2.8rem, 6vw, 5rem);
  --text-section-title: clamp(1.6rem, 3vw, 2.4rem);
  --text-step:          1rem;
  --text-label:         0.8rem;
  --text-axis:          0.75rem;
  --line-height-body:   1.65;

  --step-width:         360px;
  --chart-max-width:    960px;
  --section-gap:        6rem;
  --step-height:        85vh;

  --z-sticky:   10;
  --z-overlay:  20;
  --z-tooltip:  30;
}
```

### Passo 7 — src/lib/styles/global.css

```css
@import './tokens.css';

@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Roboto:wght@400;500&family=Roboto+Mono&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; scroll-behavior: smooth; }

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  line-height: var(--line-height-body);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display);
  line-height: 1.15;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}

.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
```

### Passo 8 — src/components/helpers/Scrolly.svelte

```svelte
<script>
  let {
    root = null,
    top = 0,
    bottom = 0,
    increments = 100,
    value = $bindable(undefined),
    children
  } = $props();

  let steps = [];
  let threshold = [];
  let nodes = [];
  let observers = [];
  let container;

  function mostInView() {
    let maxRatio = 0, maxIndex = 0;
    for (let i = 0; i < steps.length; i++) {
      if (steps[i] > maxRatio) { maxRatio = steps[i]; maxIndex = i; }
    }
    value = maxRatio > 0 ? maxIndex : undefined;
  }

  function createObserver(node, index) {
    const marginTop    = top    ? top    * -1 : 0;
    const marginBottom = bottom ? bottom * -1 : 0;
    const options = { root, rootMargin: `${marginTop}px 0px ${marginBottom}px 0px`, threshold };
    if (observers[index]) observers[index].disconnect();
    const io = new IntersectionObserver((e) => {
      steps[index] = e[0].intersectionRatio;
      mostInView();
    }, options);
    io.observe(node);
    observers[index] = io;
  }

  function update() {
    if (!nodes.length) return;
    nodes.forEach(createObserver);
  }

  $effect(() => {
    for (let i = 0; i <= increments; i++) threshold.push(i / increments);
    nodes = Array.from(container.querySelectorAll(':scope > *:not(iframe)'));
    update();
  });

  $effect(() => { top; bottom; update(); });
</script>

<div bind:this={container}>
  {@render children?.()}
</div>
```

### Passo 9 — src/routes/+layout.svelte

```svelte
<script>
  import '$lib/styles/global.css';
  let { children } = $props();
</script>
{@render children()}
```

### Passo 10 — src/components/sections/ScrollySection.svelte

```svelte
<script>
  import Scrolly from '$components/helpers/Scrolly.svelte';

  let {
    chartComponent,
    steps = [],
    activeStep = $bindable(undefined)
  } = $props();
</script>

<section class="scrolly-section">
  <div class="sticky-chart" style="will-change: transform;">
    <svelte:component this={chartComponent} {activeStep} />
  </div>

  <div class="steps-column">
    <Scrolly bind:value={activeStep}>
      {#each steps as step, i}
        <div class="step" class:active={activeStep === i}>
          <div class="step-card">
            <p>{step.text}</p>
            {#if step.subtext}<p class="subtext">{step.subtext}</p>{/if}
          </div>
        </div>
      {/each}
    </Scrolly>
  </div>
</section>

<style>
  .scrolly-section {
    position: relative;
    display: grid;
    grid-template-columns: 1fr var(--step-width);
    gap: 2rem;
    max-width: var(--chart-max-width);
    margin: 0 auto;
    padding: 0 2rem;
  }
  .sticky-chart {
    position: sticky;
    top: 10vh;
    height: 80vh;
    align-self: start;
  }
  .steps-column { padding: 50vh 0; }
  .step {
    min-height: var(--step-height);
    display: flex;
    align-items: center;
    padding: 1rem 0;
    opacity: 0.25;
    transition: opacity 0.3s ease;
  }
  .step.active { opacity: 1; }
  .step-card {
    background: var(--color-surface);
    border-left: 3px solid var(--color-primary);
    padding: 1.25rem 1.5rem;
    font-size: var(--text-step);
    line-height: var(--line-height-body);
  }
  .subtext {
    margin-top: 0.5rem;
    font-size: var(--text-label);
    color: var(--color-text-muted);
  }
  @media (max-width: 768px) {
    .scrolly-section { grid-template-columns: 1fr; }
    .sticky-chart { position: relative; top: 0; height: 50vh; }
  }
</style>
```

### Passo 11 — Avvia il server

```bash
npm run dev
```

---

## Struttura JSON dei dati

### surface_speed_current.json ✓ PRONTO
Fonte: Tennis Abstract — ultimi 12 mesi (2025-2026).
Scraping effettuato. File già presente in `src/lib/data/`.
63 tornei con campi: `tournament`, `surface`, `speed`.
```json
[
  { "tournament": "Dallas", "surface": "Hard", "speed": 1.46 },
  { "tournament": "Roland Garros", "surface": "Clay", "speed": 0.68 }
]
```

### surface_speed_by_year.json ✓ PRONTO
Fonte: Tennis Abstract — 1991–2025.
Scraping effettuato. File già presente in `src/lib/data/`.
104 record (3 superfici × 35 anni). Campi: `year`, `surface`, `speed_avg`.
**Nota metodologica importante:** gli anni 1991–2009 sono contrassegnati con
`"note": "estimated"` e sono stime basate sui valori chiave citati da Jeff Sackmann
nei suoi articoli (es. "Wimbledon 1991-92 avg ≈ 1.13, Monte Carlo ≈ 0.58").
Gli anni 2010–2025 sono calcolati da dati reali per torneo.
Questa distinzione va menzionata nelle note metodologiche dell'articolo.
```json
[
  { "year": 1991, "surface": "Hard", "speed_avg": 1.08, "note": "estimated" },
  { "year": 2025, "surface": "Clay", "speed_avg": 0.728, "n_tournaments": 20 }
]
```

### rally_length_by_tournament.json ⚠ DA PRODURRE
Fonte: Match Charting Project (JeffSackmann/tennis_MatchChartingProject su GitHub).
File da scaricare: `charting-m-stats-Rally.csv` — disponibile pubblicamente.
Aggregare per torneo (ultimi 3 anni), calcolare media di `RallyLen`.
Unire con `surface_speed_current.json` tramite nome torneo.
Struttura attesa:
```json
[
  { "tournament": "Roland Garros", "surface": "Clay", "speed": 0.68, "rally_avg": 4.2 },
  { "tournament": "Gstaad", "surface": "Clay", "speed": 1.03, "rally_avg": 3.1 }
]
```
**Istruzioni per Claude Code:** scaricare il CSV da GitHub, filtrare per partite
degli ultimi 3 anni, aggregare `RallyLen` per torneo, fare join con i dati di velocità.
Se il file non è disponibile o il join non riesce per più del 30% dei tornei,
segnalarlo e usare solo i dati di velocità per la sezione 2.

> File grezzi originali → `static/data/`
> File processati pronti per i grafici → `src/lib/data/`
> Nessuna chiamata API a runtime — tutti i dati devono essere locali.

---

## Convenzioni di codice

### Svelte 5 — sempre runes

```svelte
<script>
  let { data, activeStep } = $props();
  let visible = $state(false);
  let filtered = $derived(data.filter(d => d.surface === 'Clay'));
  $effect(() => { console.log('step cambiato:', activeStep); });
</script>
```

### Pattern grafico con LayerChart

```svelte
<script>
  import { LayerCake, Svg, Html } from 'layerchart';
  let { data, activeStep } = $props();
</script>

<div class="chart-wrapper" aria-label="Descrizione testuale del grafico per screen reader">
  <LayerCake
    {data}
    x="speed"
    y="rally_avg"
    padding={{ top: 20, right: 20, bottom: 40, left: 40 }}
  >
    <Svg><!-- layer SVG --></Svg>
    <Html><!-- tooltip, label --></Html>
  </LayerCake>
</div>

<style>
  .chart-wrapper { width: 100%; height: 100%; }
</style>
```

### Transizioni D3 tra stati

```js
import { select } from 'd3-selection';

$effect(() => {
  select(svgEl).selectAll('circle').interrupt();  // interrompe animazioni precedenti

  select(svgEl).selectAll('circle')
    .transition().duration(600)
    .attr('fill', d => activeStep >= 1 ? colorBySurface(d.surface) : '#888')
    .attr('opacity', d => activeStep >= 2 ? (isOutlier(d) ? 1 : 0.25) : 0.8);
});
```

---

## Performance e accessibilità

- Animazioni solo su `transform` e `opacity`
- `will-change: transform` solo su `.sticky-chart`
- Ogni grafico deve avere `aria-label` con descrizione testuale del contenuto
- Contrasto minimo WCAG AA: 4.5:1 su testo normale
- Mobile (< 768px): sticky → relative, layout a colonna singola
- Transizioni D3: sempre `.interrupt()` prima di avviarne una nuova

---

## Note operative per Claude Code

- **Svelte 5 sempre** — segnala e correggi qualsiasi uso della vecchia API
- **Non inventare dati** — se un JSON non esiste in `src/lib/data/`, segnalarlo prima di procedere
- **LayerChart come layer principale** — D3 solo per calcoli, scale e transizioni che LayerChart non gestisce nativamente
- **tokens.css è l'unica fonte di verità** per colori, font, spaziature — zero valori hardcoded nei componenti
- **Componenti piccoli e componibili** — preferire 3 semplici a 1 monolitico
- **Prima di scrivere un grafico**: verificare struttura del JSON, range degli assi, variabile CSS del colore
- `Scrolly.svelte` è già nel progetto — non ricrearne uno nuovo
- `ScrollySection.svelte` è il wrapper per ogni sezione scrolly — usarlo sempre
- La sezione BOOTSTRAP va ignorata se `package.json` esiste già
