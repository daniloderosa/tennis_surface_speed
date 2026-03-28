<script>
  import CourtAnimation from '$components/animations/CourtAnimation.svelte';

  /*
   * ENTER      : fine entrata SVG → il testo compare immediatamente in posizione sopra l'SVG
   * EXIT_START : inizio uscita SVG + testo insieme
   *
   * Il testo NON ha più la fase di risalita animata: appare direttamente a top≈16vh
   * non appena l'SVG è completamente entrato (p = ENTER).
   */

  const SCENE_LEN  = 200;
  const ENTER      = 0.36;
  const EXIT_START = 0.60;
  const SCENE_OFF  = 120;
  const CLAY_DELAY = 25;
  const TOTAL_VH   = CLAY_DELAY + 3 * SCENE_OFF + Math.ceil(ENTER * SCENE_LEN) + 125;

  const SVG_OFF    = 72;
  const CMP_OFF    = 90;
  const TEXT_OFF   = 22;
  const TEXT_RISE  = 62;
  const TEXT_START = 0.35;
  const TEXT_ENTER = 0.40;
  const EXIT_DELTA = (1 - EXIT_START) * SCENE_LEN; // = svgTY exitDist → stessa velocità

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

  let rafLatched = [false, false, false];
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

  // ─── Latch pallina ─────────────────────────────────────────────────────────
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
  function lerp(a, b, t)  { return a + (b - a) * eio(t); }
  function lerpL(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

  function sceneP(i) {
    if (!outerEl) return -2;
    const offPx   = SCENE_OFF * innerH / 100;
    const lenPx   = SCENE_LEN * innerH / 100;
    const delayPx = CLAY_DELAY * innerH / 100;
    return (scrollY - containerTop - i * offPx - delayPx) / lenPx;
  }

  function svgTY(p, isCompare = false) {
    const off      = isCompare ? CMP_OFF : SVG_OFF;
    const exitDist = (1 - EXIT_START) * SCENE_LEN;
    if (p <= 0)           return off;
    if (p < ENTER)        return lerpL(off, 0, p / ENTER);
    if (isCompare)        return 0;
    if (p < EXIT_START)   return 0;
    if (p < 1.0)          return lerpL(0, -exitDist, (p - EXIT_START) / (1 - EXIT_START));
    return -exitDist;
  }

  /*
   * textTY: il testo compare direttamente in posizione sopra l'SVG (top≈16vh)
   * non appena l'SVG ha finito di entrare (p = ENTER). Nessuna transizione di salita.
   * Poi esce insieme all'SVG.
   */
  function textTY(p) {
    if (p < TEXT_START)   return TEXT_OFF;
    if (p < TEXT_ENTER)   return lerpL(TEXT_OFF, 0, (p - TEXT_START) / (TEXT_ENTER - TEXT_START));
    if (p < EXIT_START)   return lerpL(0, -TEXT_RISE, (p - TEXT_ENTER) / (EXIT_START - TEXT_ENTER));
    if (p < 1.0)          return lerpL(-TEXT_RISE, -TEXT_RISE - EXIT_DELTA,
                                        (p - EXIT_START) / (1 - EXIT_START));
    return -TEXT_RISE - EXIT_DELTA;
  }

  // ─── Derived ───────────────────────────────────────────────────────────────
  let scenes = $derived(
    surfaces.map((_, i) => {
      const p = sceneP(i);
      return {
        svgT:  `translateY(${svgTY(p, i === 3)}vh)`,
        textT: `translateX(-50%) translateY(${textTY(p)}vh)`,
      };
    })
  );

  const CMP_CTRL_P = ENTER * (1 - (100 - 10 - 68) / CMP_OFF);
  let compareSettled = $derived(sceneP(3) > CMP_CTRL_P);
</script>

<div class="anim-outer" bind:this={outerEl} style="height: {TOTAL_VH}vh">

  <div class="sticky-stage">
    <div class="stage-inner">

      {#each surfaces as surf, i}
        <div class="svg-panel {i === 3 ? 'svg-panel--compare' : ''}" style="transform: {scenes[i].svgT}">
          <CourtAnimation surface={surf} playing={playing[i]} />
        </div>
      {/each}

      {#each stepTexts as step, i}
        <div
          class="text-panel"
          style="transform: {scenes[i].textT}; border-left-color: {step.color}"
        >
          <p>{step.text}</p>
        </div>
      {/each}

      <div class="cta-hint" class:visible={compareSettled}>
        ↔ Trascina per confrontare le superfici
      </div>

    </div>
  </div>
</div>

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
    margin-top: -100vh;
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

  .bridge-text {
    max-width: 640px;
    margin: 0 auto;
    padding: 3rem 2rem 0;
    font-size: 1.1rem;
    line-height: 1.7;
    color: $color-text;
  }

  .cta-hint {
    position: absolute;
    top: 16vh;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.6s ease;
    background: $color-surface-2;
    border: 1px solid $color-border;
    border-radius: 50em;
    padding: 0.55rem 1.5rem;
    font-size: 0.9rem;
    font-family: $font-sans;
    color: $color-text-muted;
    white-space: nowrap;
    pointer-events: none;
    z-index: 5;
  }

  .cta-hint.visible {
    animation: cta-blink 3s ease-in-out 0.6s infinite;
  }

  @keyframes cta-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }

  @include mobile {
    .cta-hint { top: 12vh; font-size: 0.82rem; padding: 0.45rem 1.25rem; }
    .svg-panel {
      left: 1rem;
      right: 1rem;
      top: 35vh;
      height: 38vh;
    }
    .svg-panel--compare {
      top: 5vh;
      height: 60vh;
    }
    .text-panel {
      top: 78vh;
      width: calc(100% - 2rem);
      padding: 1.25rem;
      font-size: 1rem;
    }
  }
</style>
