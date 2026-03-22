<script>
  import CourtAnimation from '$components/animations/CourtAnimation.svelte';

  /*
   * Costanti di layout e timing
   * ─────────────────────────────────────────────────────────────────────────
   * SCENE_LEN    : vh di scroll dedicati a ogni scena
   * ENTER        : frazione di entrata  (= EXIT fraction, simmetrico)
   * MID          : punto in cui il testo inizia a salire sopra l'SVG
   * EXIT_START   : = 1 - ENTER  → entrata e uscita durano uguale
   * SCENE_OFF    : = EXIT_START × SCENE_LEN
   *                quando scena[i] inizia a uscire, scena[i+1] inizia a entrare
   *
   * Fasi di ogni scena:
   *   0          → ENTER      : SVG + testo entrano insieme da sotto  (60vh)
   *   ENTER      → MID        : entrambi fermi (pallina gira)         (40vh)
   *   MID        → EXIT_START : testo sale sopra l'SVG, SVG fermo    (40vh)
   *   EXIT_START → 1.0        : entrambi escono verso l'alto          (60vh)
   *
   * ► Per rallentare/velocizzare entrata E uscita: modifica ENTER
   *   (più alto = più lento; EXIT_START si aggiorna di conseguenza).
   *   Esempi: 0.25 → veloce (50vh), 0.35 → lento (70vh).
   *
   * Compare (i=3): nessuna exit transform → scorre via naturalmente.
   *
   * Layout (in vh, dentro lo sticky-stage 100vh):
   *   SVG panel:  top=28vh, height=46vh → bottom=74vh
   *   Compare:    top=10vh, height=68vh
   *   Text panel: top=78vh (4vh gap)    → sale a top≈16vh (sopra SVG)
   */

  const SCENE_LEN  = 200;
  const ENTER      = 0.30;  // entrata e uscita simmetriche: 60vh ciascuna
  const MID        = 0.50;  // testo inizia a salire
  const EXIT_START = 1 - ENTER; // 0.70
  const SCENE_OFF  = Math.round(EXIT_START * SCENE_LEN); // 140
  const TOTAL_VH   = 650;

  const TEXT_RISE  = 62;    // vh: testo sale da 78vh → 16vh (sopra l'SVG a 28vh)
  const EXIT_DELTA = 112;   // vh uscita SVG (stessa per SVG e testo → escono insieme)

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
  function lerp(a, b, t) { return a + (b - a) * eio(t); }

  function sceneP(i) {
    if (!outerEl) return -2;
    const offPx = SCENE_OFF * innerH / 100;
    const lenPx = SCENE_LEN * innerH / 100;
    return (scrollY - containerTop - i * offPx) / lenPx;
  }

  /*
   * SVG transform Y (in vh, riferito a CSS top:28vh):
   *   off-screen sotto → entra → fermo → esce
   *   compare: non esce mai con transform
   */
  function svgTY(p, isCompare = false) {
    if (p <= 0)           return 92;
    if (p < ENTER)        return lerp(92, 0, p / ENTER);
    if (isCompare)        return 0;
    if (p < EXIT_START)   return 0;
    if (p < 1.0)          return lerp(0, -EXIT_DELTA, (p - EXIT_START) / (1 - EXIT_START));
    return -EXIT_DELTA;
  }

  /*
   * Text transform Y (in vh, riferito a CSS top:78vh):
   *   entra insieme a SVG → si FERMA sotto l'SVG → sale sopra → esce con SVG
   */
  function textTY(p) {
    if (p <= 0)           return 92;
    if (p < ENTER)        return lerp(92, 0, p / ENTER);          // entra con SVG
    if (p < MID)          return 0;                                // fermo sotto SVG
    if (p < EXIT_START)   return lerp(0, -TEXT_RISE, (p - MID) / (EXIT_START - MID)); // sale
    if (p < 1.0)          return lerp(-TEXT_RISE, -TEXT_RISE - EXIT_DELTA,
                                       (p - EXIT_START) / (1 - EXIT_START));           // esce
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
