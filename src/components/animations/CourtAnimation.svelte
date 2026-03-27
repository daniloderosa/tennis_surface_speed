<script>
  let { surface = 'clay', playing = false } = $props();
  // surface: 'clay' | 'hard' | 'grass' | 'compare'
  // playing: ball animation active (ignored in compare mode)

  const G = 360;

  function cb(p0, p1, p2, p3, t) {
    const m = 1 - t;
    return m*m*m*p0 + 3*m*m*t*p1 + 3*m*t*t*p2 + t*t*t*p3;
  }

  function norm(segs) {
    const tot = segs.reduce((s, sg) => s + sg.w, 0);
    return segs.map(sg => ({ ...sg, w: sg.w / tot }));
  }

  const segs_clay = norm([
    { x0:130, y0:G,   cx1:200, cy1:55,  cx2:680, cy2:55,  x1:780, y1:G,   w:0.72 },
    { x0:780, y0:G,   cx1:820, cy1:218, cx2:865, cy2:257, x1:880, y1:258, w:0.28 },
  ]);

  const segs_grass = norm([
    { x0:130, y0:G,   cx1:280, cy1:230, cx2:620, cy2:230, x1:708, y1:G,   w:0.72 },
    { x0:708, y0:G,   cx1:708, cy1:311, cx2:865, cy2:320, x1:880, y1:320, w:0.28 },
  ]);

  const segs_hard = norm([
    { x0:130, y0:G,   cx1:200, cy1:208, cx2:680, cy2:208, x1:780, y1:G,   w:0.72 },
    { x0:780, y0:G,   cx1:780, cy1:265, cx2:865, cy2:291, x1:880, y1:292, w:0.28 },
  ]);

  function getBallPos(segs, t) {
    let cum = 0;
    let active = segs[segs.length - 1];
    let tSeg = 1;
    for (const sg of segs) {
      if (t <= cum + sg.w) {
        tSeg = (t - cum) / sg.w;
        active = sg;
        break;
      }
      cum += sg.w;
    }
    return {
      x: cb(active.x0, active.cx1, active.cx2, active.x1, tSeg),
      y: cb(active.y0, active.cy1, active.cy2, active.y1, tSeg),
    };
  }

  function getShadow(x, y, r) {
    const height = Math.max(0, G - y);
    const scale = Math.max(0.08, 1 - (height / 340) * 0.92);
    return {
      cx: x,
      rx: r * scale,
      opacity: Math.max(0.05, scale * 0.75),
    };
  }

  let ball_clay  = $state({ x: 130, y: G });
  let ball_grass = $state({ x: 130, y: G });
  let ball_hard  = $state({ x: 130, y: G });
  let t_current  = $state(0); // parametro animazione corrente (0-1), per il trail

  let sliderVal = $state(0);

  const CYCLE_MS = 4700;

  // Loop RAF per superfici singole — parte solo quando playing=true
  $effect(() => {
    if (surface === 'compare') return;
    if (!playing) return;

    const segsMap = { clay: segs_clay, grass: segs_grass, hard: segs_hard };
    const segs = segsMap[surface];
    if (!segs) return;

    let rafId;
    let t0 = null;

    function frame(ts) {
      if (!t0) t0 = ts;
      const raw = ((ts - t0) % CYCLE_MS) / CYCLE_MS;
      const t = raw < 0.65 ? raw / 0.65 : 1.0;
      const pos = getBallPos(segs, t);
      t_current = t;

      if (surface === 'clay')  ball_clay  = pos;
      if (surface === 'grass') ball_grass = pos;
      if (surface === 'hard')  ball_hard  = pos;

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  });

  // Modalità compare: slider controlla la posizione di tutte le palline
  $effect(() => {
    if (surface !== 'compare') return;
    const t = sliderVal / 1000;
    ball_clay  = getBallPos(segs_clay,  t);
    ball_grass = getBallPos(segs_grass, t);
    ball_hard  = getBallPos(segs_hard,  t);
  });

  const courtColors = { clay: '#c1622e', grass: '#4a7c3f', hard: '#3a6080' };

  function courtColor() {
    if (surface === 'compare') return '#8a8a7a';
    return courtColors[surface] ?? '#8a8a7a';
  }
</script>

<div class="court-wrap" aria-label="Animazione pallina da tennis su {surface}">
  <svg viewBox="0 0 1000 {surface === 'compare' ? 650 : 500}" preserveAspectRatio="xMidYMid meet">

    <!-- Sfondo bianco: pannello solido quando entra nella view -->
    <rect width="1000" height="500" fill="white"/>

    <!-- Campo -->
    <rect x="50" y="360" width="900" height="55" rx="2"
      fill={courtColor()}
      opacity={surface === 'compare' ? 0.4 : 1}
    />

    <!-- Linee campo -->
    <line x1="180" y1="355" x2="180" y2="420" stroke="rgba(255,255,255,0.75)" stroke-width="2.5"/>
    <line x1="820" y1="355" x2="820" y2="420" stroke="rgba(255,255,255,0.75)" stroke-width="2.5"/>
    <line x1="180" y1="415" x2="820" y2="415" stroke="rgba(255,255,255,0.2)"  stroke-width="1.5"/>
    <line x1="340" y1="360" x2="340" y2="415" stroke="rgba(255,255,255,0.3)"  stroke-width="1.5"/>
    <line x1="660" y1="360" x2="660" y2="415" stroke="rgba(255,255,255,0.3)"  stroke-width="1.5"/>

    <!-- Rete -->
    <line x1="500" y1="322" x2="500" y2="362" stroke="#cccccc" stroke-width="3"/>
    <rect x="491" y="318" width="18" height="7" rx="2" fill="#dddddd"/>
    <line x1="491" y1="327" x2="509" y2="327" stroke="#bbb" stroke-width="1"/>
    <line x1="491" y1="334" x2="509" y2="334" stroke="#bbb" stroke-width="1"/>
    <line x1="491" y1="341" x2="509" y2="341" stroke="#bbb" stroke-width="1"/>
    <line x1="491" y1="348" x2="509" y2="348" stroke="#bbb" stroke-width="1"/>
    <line x1="491" y1="355" x2="509" y2="355" stroke="#bbb" stroke-width="1"/>

    <!-- Trail tratteggiato che segue la pallina -->
    {#if surface === 'compare'}
      {@const tCmp = sliderVal / 1000}
      {#if tCmp > 0}
        {@const N = 50}
        {@const trailGrass = Array.from({length: N}, (_, i) => getBallPos(segs_grass, (i / (N-1)) * tCmp))}
        {@const trailHard  = Array.from({length: N}, (_, i) => getBallPos(segs_hard,  (i / (N-1)) * tCmp))}
        {@const trailClay  = Array.from({length: N}, (_, i) => getBallPos(segs_clay,  (i / (N-1)) * tCmp))}
        <polyline points={trailGrass.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(0,0,0,0.10)" stroke-width="2" stroke-dasharray="7 5" stroke-linecap="round"/>
        <polyline points={trailHard.map( p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(0,0,0,0.10)" stroke-width="2" stroke-dasharray="7 5" stroke-linecap="round"/>
        <polyline points={trailClay.map( p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(0,0,0,0.10)" stroke-width="2" stroke-dasharray="7 5" stroke-linecap="round"/>
      {/if}
    {:else if t_current > 0}
      {@const segsActive = surface === 'clay' ? segs_clay : surface === 'grass' ? segs_grass : segs_hard}
      {@const N = 50}
      {@const trail = Array.from({length: N}, (_, i) => getBallPos(segsActive, (i / (N-1)) * t_current))}
      <polyline points={trail.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(0,0,0,0.10)" stroke-width="2.5" stroke-dasharray="7 5" stroke-linecap="round"/>
    {/if}

    {#if surface === 'compare'}
      {@const shGrass = getShadow(ball_grass.x, ball_grass.y, 9)}
      {@const shHard  = getShadow(ball_hard.x,  ball_hard.y,  9)}
      {@const shClay  = getShadow(ball_clay.x,  ball_clay.y,  9)}
      <ellipse cx={shGrass.cx} cy={G+2} rx={shGrass.rx} ry="3" fill="rgba(0,0,0,0.15)" opacity={shGrass.opacity}/>
      <ellipse cx={shHard.cx}  cy={G+2} rx={shHard.rx}  ry="3" fill="rgba(0,0,0,0.15)" opacity={shHard.opacity}/>
      <ellipse cx={shClay.cx}  cy={G+2} rx={shClay.rx}  ry="3" fill="rgba(0,0,0,0.15)" opacity={shClay.opacity}/>
      <circle cx={ball_grass.x} cy={ball_grass.y} r="9" fill="#4a7c3f" stroke="#2d5a28" stroke-width="1.5"/>
      <circle cx={ball_hard.x}  cy={ball_hard.y}  r="9" fill="#3a6080" stroke="#1e3d55" stroke-width="1.5"/>
      <circle cx={ball_clay.x}  cy={ball_clay.y}  r="9" fill="#c1622e" stroke="#8a3d18" stroke-width="1.5"/>
    {:else}
      {@const pos = surface === 'clay' ? ball_clay : surface === 'grass' ? ball_grass : ball_hard}
      {@const sh  = getShadow(pos.x, pos.y, 10)}
      <ellipse cx={sh.cx} cy={G+2} rx={sh.rx} ry="3.5" fill="rgba(0,0,0,0.2)" opacity={sh.opacity}/>
      <circle cx={pos.x} cy={pos.y} r="10" fill="#c8e04a" stroke="#9aad28" stroke-width="1.5"/>
    {/if}
  </svg>

  {#if surface === 'compare'}
    <div class="compare-controls">
      <div class="slider-wrap">
        <span class="slider-label">← A</span>
        <input type="range" min="0" max="1000" bind:value={sliderVal} aria-label="Posizione pallina"/>
        <span class="slider-label">B →</span>
      </div>
      <div class="legend">
        <span><span class="dot" style="background:#4a7c3f"></span>Erba</span>
        <span><span class="dot" style="background:#3a6080"></span>Cemento</span>
        <span><span class="dot" style="background:#c1622e"></span>Terra</span>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @use 'variables' as *;

  .court-wrap {
    position: relative;
    width: 100%;
    height: 100%;
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  /* Controls sovrapposti in basso — non sottraggono spazio all'SVG */
  .compare-controls {
    position: absolute;
    bottom: 1.25rem;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    pointer-events: all;
  }

  .slider-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
  }

  .slider-label {
    font-family: $font-mono;
    font-size: $text-label;
    color: $color-text-muted;
    white-space: nowrap;
  }

  input[type=range] {
    flex: 1;
    height: 3px;
    accent-color: $color-primary;
    cursor: pointer;
  }

  .legend {
    display: flex;
    gap: 1.25rem;
    font-family: $font-mono;
    font-size: $text-label;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: $color-text-muted;

    span {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }
</style>
