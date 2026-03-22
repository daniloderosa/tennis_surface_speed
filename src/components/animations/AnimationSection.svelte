<script>
  import CourtAnimation from '$components/animations/CourtAnimation.svelte';

  /*
   * Costanti di layout e timing
   * ─────────────────────────────────────────────────────────────────────────
   * SCENE_LEN    : vh di scroll dedicati a ogni scena
   * ENTER        : frazione di entrata — entrata LINEARE (no easing), 1:1 con scroll
   *                SVG parte da translateY=72 (visual=100vh) → 0 in ENTER*200=72vh di scroll
   *                → velocità uguale al normale scroll della pagina ("scroll naturale")
   * EXIT_START   : inizio uscita
   * SCENE_OFF    : = EXIT_START × SCENE_LEN
   *                quando scena[i] inizia a uscire, scena[i+1] inizia a entrare
   *
   * Fasi di ogni scena:
   *   0          → ENTER      : SVG entra LINEAR da sotto (72vh, 1:1 scroll); testo fermo sotto
   *   ENTER      → EXIT_START : SVG fermo, testo sale da 100vh → top≈16vh  (56vh)
   *   EXIT_START → 1.0        : SVG + testo escono verso l'alto (easing)   (60vh)
   *
   * ► Per rallentare/velocizzare l'USCITA: modifica EXIT_START
   *   verso valori più bassi (es. 0.60) = uscita più lenta.
   * ► Per cambiare durata entrata: modifica ENTER (ma perdendo la sincronia 1:1 scroll).
   *
   * Compare (i=3): nessuna exit transform → scorre via naturalmente.
   *
   * Layout (in vh, dentro lo sticky-stage 100vh):
   *   SVG panel:  top=28vh, height=46vh → bottom=74vh
   *   SVG_OFF=72  (= 100 - 28): parte da visual=100vh (fondo viewport)
   *   Compare:    top=10vh, height=68vh
   *   Text panel: top=78vh
   *   TEXT_OFF=22 (= 100 - 78): parte da visual=100vh con SVG
   *   Testo sale a top≈16vh tramite TEXT_RISE=62
   */

  const SCENE_LEN  = 200;
  const ENTER      = 0.36;  // entrata lineare: 72vh di scroll = 1:1 con SVG che parte da 100vh
  const EXIT_START = 0.70;  // uscita: 60vh
  const SCENE_OFF  = 125; // anticipo overlap: prossima scena entra a metà fase di riposo della corrente
  const TOTAL_VH   = 650;

  const SVG_OFF    = 72;    // translateY iniziale SVG  (100vh - CSS top 28vh)
  const CMP_OFF    = 90;    // translateY iniziale compare (100vh - CSS top 10vh)
  const TEXT_OFF   = 22;    // translateY iniziale testo (100vh - CSS top 78vh)
  const TEXT_RISE  = 62;    // vh: testo sale da 78vh → 16vh (sopra l'SVG a 28vh)
  const TEXT_START = 0.20;  // p a cui il testo inizia a muoversi (< ENTER=0.36 → anticipo)
  const TEXT_ENTER = ENTER; // p a cui il testo finisce di entrare e inizia a salire
  const EXIT_DELTA = 112;   // vh uscita (stessa per SVG e testo → escono insieme)

  // La pallina parte quasi subito durante l'entrata (SVG appena entrato nella view)
  const BALL_P = 0.06;

  const surfaces = ['clay', 'hard', 'grass', 'compare'];

  const stepTexts = [
    {
      color: '#c1622e',
      text: 'La terra rossa è la superficie più lenta del circuito. I rimbalzi sono alti e lenti, i rally si allungano.',
    },
    {
      color: '#3a6080',
      text: 'Il cemento è la superficie più diffusa. Rimbalzo medio, velocità media, il campo di tutti.',
    },
    {
      color: '#4a7c3f',
      text: "L'erba è la superficie più veloce. Il rimbalzo è basso e rapido, i punti si decidono in pochi scambi.",
    },
  ];

  // ─── Stato reattivo ────────────────────────────────────────────────────────
  let outerEl      = $state(null);
  let scrollY      = $state(0);
  let innerH       = $state(typeof window !== 'undefined' ? window.innerHeight : 800);
  let containerTop = $state(1e6);

  /*
   * Latch anti-bounce: rafLatched è un array NON reattivo.
   * Una volta che la pallina parte per la scena i, non viene mai riavviata
   * (il prop `playing[i]` passa da false a true una volta sola).
   * Questo impedisce che ogni evento scroll riavvii il RAF loop.
   */
  let rafLatched = [false, false, false]; // non $state: Svelte non lo traccia
  let playing    = $state([false, false, false, false]);

  // ─── Listener scroll / resize ──────────────────────────────────────────────
  $effect(() => {
    if (typeof window === 'undefined') return;
    function onScroll() { scrollY = window.scrollY; }
    function onResize()  { innerH = window.innerHeight; refreshTop(); }
    function refreshTop() {
      if (outerEl) containerTop = outerEl.getBoundingClientRect().top + window.scrollY;
    }
    scrollY = window.scrollY;
    innerH  = window.innerHeight;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  });

  $effect(() => {
    if (!outerEl) return;
    containerTop = outerEl.getBoundingClientRect().top + window.scrollY;
  });

  // ─── Latch effect ──────────────────────────────────────────────────────────
  // Dipende da scrollY/containerTop/innerH (via sceneP).
  // NON legge rafLatched (non reattivo) né playing (scrive solo).
  // → nessun loop infinito, nessun riavvio del RAF per fluttuazioni di p.
  $effect(() => {
    for (let i = 0; i < 3; i++) {
      if (!rafLatched[i] && sceneP(i) >= BALL_P) {
        rafLatched[i] = true;
        playing[i] = true;
      }
    }
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function eio(t) {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function lerp(a, b, t)  { return a + (b - a) * eio(t); }   // eased
  function lerpL(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); } // lineare

  function sceneP(i) {
    if (!outerEl) return -2;
    const offPx = SCENE_OFF * innerH / 100;
    const lenPx = SCENE_LEN * innerH / 100;
    return (scrollY - containerTop - i * offPx) / lenPx;
  }

  /*
   * SVG transform Y (in vh, riferito a CSS top:28vh):
   *   parte da visual=100vh (SVG_OFF=72) → entra LINEAR 1:1 con scroll → fermo → esce eased
   *   compare: non esce mai con transform
   */
  function svgTY(p, isCompare = false) {
    const off = isCompare ? CMP_OFF : SVG_OFF; // offset diverso per compare (top:10vh)
    if (p <= 0)           return off;
    if (p < ENTER)        return lerpL(off, 0, p / ENTER);   // LINEARE — scroll naturale
    if (isCompare)        return 0;
    if (p < EXIT_START)   return 0;
    if (p < 1.0)          return lerp(0, -EXIT_DELTA, (p - EXIT_START) / (1 - EXIT_START));
    return -EXIT_DELTA;
  }

  /*
   * Text transform Y (in vh, riferito a CSS top:78vh):
   *   aspetta SVG fermo → sale da sotto (100vh) fino a -TEXT_RISE → esce con SVG
   *   Tutto in un unico moto continuo, parte solo quando SVG è completamente entrato.
   */
  function textTY(p) {
    if (p < TEXT_START)   return TEXT_OFF;  // aspetta
    if (p < TEXT_ENTER)   return lerpL(TEXT_OFF, 0, (p - TEXT_START) / (TEXT_ENTER - TEXT_START)); // lineare — entra con SVG
    if (p < EXIT_START)   return lerp(0, -TEXT_RISE, (p - TEXT_ENTER) / (EXIT_START - TEXT_ENTER)); // eased — sale
    if (p < 1.0)          return lerp(-TEXT_RISE, -TEXT_RISE - EXIT_DELTA,
                                       (p - EXIT_START) / (1 - EXIT_START));
    return -TEXT_RISE - EXIT_DELTA;
  }

  // ─── Derived: trasformate per ogni scena ──────────────────────────────────
  let scenes = $derived(
    surfaces.map((_, i) => {
      const p = sceneP(i);
      return {
        svgT:  `translateY(${svgTY(p, i === 3)}vh)`,
        textT: `translateX(-50%) translateY(${textTY(p)}vh)`,
      };
    })
  );
</script>

<div class="anim-outer" bind:this={outerEl} style="height: {TOTAL_VH}vh">

  <div class="sticky-stage">
    <div class="stage-inner">

      <!-- SVG panels: uno per superficie, animati con transform -->
      {#each surfaces as surf, i}
        <div class="svg-panel {i === 3 ? 'svg-panel--compare' : ''}" style="transform: {scenes[i].svgT}">
          <CourtAnimation surface={surf} playing={playing[i]} />
        </div>
      {/each}

      <!-- Text panels: solo step 0-2 -->
      {#each stepTexts as step, i}
        <div
          class="text-panel"
          style="transform: {scenes[i].textT}; border-left-color: {step.color}"
        >
          <p>{step.text}</p>
        </div>
      {/each}

    </div>
  </div>
</div>

<!-- Bridge text: segue naturalmente dopo la fine dell'anim-outer -->
<div class="bridge-text">
  <p>
    Ma le superfici sono davvero così diverse? Negli ultimi trent'anni qualcosa
    è cambiato nel modo in cui i giocatori le affrontano.
  </p>
</div>

<style lang="scss">
  @use 'variables' as *;
  @use 'mixins' as *;

  .anim-outer {
    position: relative;
    margin-top: -100vh; // si sovrappone all'hero: SVG entra da sotto mentre hero scorre via
  }

  .sticky-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    background: transparent;
  }

  .stage-inner {
    position: relative;
    width: 100%;
    height: 100%;
    max-width: $chart-max-width;
    margin: 0 auto;
  }

  /*
   * SVG panel: top=28vh, height=46vh → bottom=74vh (posizione di riposo).
   * Compare override: top=10vh, height=68vh per ospitare lo slider.
   */
  .svg-panel {
    position: absolute;
    left: 2rem;
    right: 2rem;
    top: 28vh;
    height: 46vh;
    will-change: transform;
  }

  .svg-panel--compare {
    top: 10vh;
    height: 68vh;
  }

  /*
   * Text panel: base a top=78vh (4vh sotto il bottom SVG a 74vh).
   * Sale a top≈16vh tramite translateY(-62vh) durante la fase di risalita.
   */
  .text-panel {
    position: absolute;
    top: 78vh;
    left: 50%;
    width: calc(100% - 4rem);
    max-width: 520px;
    will-change: transform;
    background: $color-surface;
    border-left: 3px solid;
    padding: 2rem;
    font-size: 1.1rem;
    line-height: 1.7;
    color: $color-text;
  }

  /* Bridge text: nessun margin, segue anim-outer senza spazio vuoto */
  .bridge-text {
    max-width: 640px;
    margin: 0 auto;
    padding: 3rem 2rem 0;
    font-size: 1.1rem;
    line-height: 1.7;
    color: $color-text;
  }

  @include mobile {
    .svg-panel {
      left: 1rem;
      right: 1rem;
      top: 15vh;
      height: 38vh;
    }
    .svg-panel--compare {
      top: 5vh;
      height: 60vh;
    }
    .text-panel {
      top: 57vh;
      width: calc(100% - 2rem);
      padding: 1.25rem;
      font-size: 1rem;
    }
  }
</style>
