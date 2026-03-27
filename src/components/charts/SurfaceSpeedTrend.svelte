<script>
  import * as d3 from 'd3';
  import { untrack } from 'svelte';
  import rawData from '$data/surface_speed_by_year.json';

  const COLORS  = { Hard: '#3a6080', Clay: '#c1622e', Grass: '#4a7c3f' };
  const SURFACES = ['Grass', 'Hard', 'Clay'];
  const LABELS   = { Grass: 'Erba', Hard: 'Cemento', Clay: 'Terra' };
  const M = { top: 40, right: 30, bottom: 50, left: 55 };
  const H = 380;

  const grouped = d3.group(rawData, d => d.surface);
  const byYear  = d3.group(rawData, d => d.year);

  const MODES = {
    speed: {
      field: 'speed_avg',
      domain: [0.5, 1.45],
      fmt:   d3.format('.2f'),
      desc:  'Ace rate aggiustato per la qualità dei giocatori, indicizzato alla media del tour (1.0 = media). Misura la velocità fisica della superficie.',
    },
    ace: {
      field: 'ace_rate_avg',
      domain: [0.02, 0.18],
      fmt:   d => d3.format('.1%')(d),
      desc:  'Percentuale grezza di ace su tutti i punti giocati. Sale su tutte le superfici nel tempo: i giocatori servono meglio, non i campi cambiano.',
    },
  };

  let containerEl;
  let svgEl;
  let width = $state(700);
  let mode  = $state('speed');

  // Tooltip state
  let tooltip = $state(null); // { x, year, rows: [{surf, value}] }

  $effect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(containerEl);
    return () => ro.disconnect();
  });

  function styleAxis(sel) {
    sel.select('.domain').attr('stroke', '#4C566A');
    sel.selectAll('.tick line').attr('stroke', '#4C566A');
    sel.selectAll('.tick text')
      .attr('fill', '#8a9ab5').attr('font-size', '11px')
      .attr('font-family', 'Roboto Mono, monospace');
  }

  function makeYScale(m, innerH) {
    return d3.scaleLinear().domain(MODES[m].domain).range([innerH, 0]).nice();
  }

  function makeLineGen(xS, yS, field) {
    return d3.line()
      .x(d => xS(d.year))
      .y(d => yS(d[field]))
      .curve(d3.curveMonotoneX)
      .defined(d => d[field] != null);
  }

  function makeXScale(w) {
    return d3.scaleLinear().domain([1991, 2025]).range([0, w - M.left - M.right]);
  }

  // Rebuild da zero su cambio width
  $effect(() => {
    if (!svgEl || width === 0) return;
    const w = width;
    const m = untrack(() => mode);
    buildChart(w, m);
  });

  // Transizione su cambio mode
  $effect(() => {
    const m = mode;
    if (!svgEl) return;
    const root = d3.select(svgEl);
    if (root.select('g.inner').empty()) return;
    const w = untrack(() => width);
    updateMode(w, m);
  });

  function buildChart(w, m) {
    const innerW = w - M.left - M.right;
    const innerH = H - M.top - M.bottom;
    const xS  = makeXScale(w);
    const yS  = makeYScale(m, innerH);
    const cfg = MODES[m];
    const lg  = makeLineGen(xS, yS, cfg.field);

    const root = d3.select(svgEl);
    root.selectAll('*').remove();
    root.attr('width', w).attr('height', H);

    const g = root.append('g').attr('class', 'inner')
      .attr('transform', `translate(${M.left},${M.top})`);

    // Grid
    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(yS).ticks(5).tickSize(-innerW).tickFormat(''))
      .call(ax => {
        ax.select('.domain').remove();
        ax.selectAll('.tick line').attr('stroke', '#3B4252').attr('stroke-dasharray', '3,3');
      });

    // X axis
    g.append('g').attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xS).ticks(8).tickFormat(d3.format('d')))
      .call(styleAxis);

    // Y axis
    g.append('g').attr('class', 'y-axis')
      .call(d3.axisLeft(yS).ticks(5).tickFormat(cfg.fmt))
      .call(styleAxis);

    // Linee per superficie
    SURFACES.forEach(surf => {
      const sd = (grouped.get(surf) ?? []).sort((a, b) => a.year - b.year);
      g.append('path')
        .datum(sd)
        .attr('class', `line-${surf}`)
        .attr('fill', 'none')
        .attr('stroke', COLORS[surf])
        .attr('stroke-width', 2)
        .attr('d', lg);
    });

    // Crosshair (inizialmente nascosto)
    const ch = g.append('g').attr('class', 'crosshair').attr('display', 'none');
    ch.append('line').attr('class', 'ch-line')
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#D8DEE9').attr('stroke-width', 1).attr('stroke-dasharray', '4,3');
    SURFACES.forEach(surf => {
      ch.append('circle').attr('class', `ch-dot-${surf}`)
        .attr('r', 4).attr('fill', COLORS[surf])
        .attr('stroke', '#2E3440').attr('stroke-width', 1.5);
    });

    // Overlay invisibile per catturare eventi mouse/touch
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerW).attr('height', innerH)
      .attr('fill', 'none').attr('pointer-events', 'all')
      .on('mousemove touchmove', function(event) {
        event.preventDefault();
        const [px] = event.touches
          ? [event.touches[0].clientX - svgEl.getBoundingClientRect().left - M.left]
          : [d3.pointer(event, this)[0]];
        updateCrosshair(px, w, m);
      })
      .on('mouseleave touchend', () => {
        d3.select(svgEl).select('.crosshair').attr('display', 'none');
        tooltip = null;
      });

    // Legenda
    const leg = root.append('g').attr('transform', `translate(${M.left}, 8)`);
    SURFACES.forEach((surf, i) => {
      const lx = i * 110;
      leg.append('rect').attr('x', lx).attr('y', 0)
        .attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', COLORS[surf]);
      leg.append('text').attr('x', lx + 16).attr('y', 10)
        .attr('fill', '#D8DEE9').attr('font-size', '12px')
        .attr('font-family', 'Roboto, sans-serif').text(LABELS[surf]);
    });
  }

  function updateMode(w, m) {
    const innerW = w - M.left - M.right;
    const innerH = H - M.top - M.bottom;
    const xS  = makeXScale(w);
    const yS  = makeYScale(m, innerH);
    const cfg = MODES[m];
    const lg  = makeLineGen(xS, yS, cfg.field);
    const root = d3.select(svgEl);
    const t    = root.transition().duration(400);

    root.select('.y-axis').transition(t)
      .call(d3.axisLeft(yS).ticks(5).tickFormat(cfg.fmt))
      .call(styleAxis);

    root.select('.grid').transition(t)
      .call(d3.axisLeft(yS).ticks(5).tickSize(-innerW).tickFormat(''))
      .call(ax => {
        ax.select('.domain').remove();
        ax.selectAll('.tick line').attr('stroke', '#3B4252').attr('stroke-dasharray', '3,3');
      });

    SURFACES.forEach(surf => {
      const sd = (grouped.get(surf) ?? []).sort((a, b) => a.year - b.year);
      root.select(`.line-${surf}`).datum(sd).transition(t).attr('d', lg);
    });

    // Nascondi crosshair durante la transizione
    root.select('.crosshair').attr('display', 'none');
    tooltip = null;

    // Aggiorna ch-line altezza se innerH fosse cambiato (non cambia qui ma per robustezza)
    root.select('.ch-line').attr('y2', innerH);
  }

  function updateCrosshair(px, w, m) {
    const innerH = H - M.top - M.bottom;
    const xS  = makeXScale(w);
    const yS  = makeYScale(m, innerH);
    const cfg = MODES[m];

    const year = Math.round(xS.invert(px));
    if (year < 1991 || year > 2025) { tooltip = null; return; }

    const yearData = byYear.get(year) ?? [];
    const xPos = xS(year);

    const ch = d3.select(svgEl).select('.crosshair');
    ch.attr('display', null);
    ch.select('.ch-line').attr('x1', xPos).attr('x2', xPos);

    const rows = [];
    SURFACES.forEach(surf => {
      const pt = yearData.find(d => d.surface === surf);
      const val = pt?.[cfg.field];
      ch.select(`.ch-dot-${surf}`)
        .attr('cx', xPos)
        .attr('cy', val != null ? yS(val) : -999)
        .attr('display', val != null ? null : 'none');
      rows.push({ surf, value: val != null ? cfg.fmt(val) : '—' });
    });

    // Posizione tooltip in pixel assoluti nel container
    const svgRect = svgEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    const absX = svgRect.left - containerRect.left + M.left + xPos;

    tooltip = { x: absX, year, rows };
  }
</script>

<div class="trend-outer">
  <div class="toggle-row">
    <div class="toggle-btns">
      <button class:active={mode === 'speed'} onclick={() => mode = 'speed'}>Speed Rating</button>
      <button class:active={mode === 'ace'}   onclick={() => mode = 'ace'}>Ace Rate %</button>
    </div>
    <p class="mode-desc">{MODES[mode].desc}</p>
  </div>

  <div class="chart-area" bind:this={containerEl} aria-label="Trend velocità superfici 1991–2025">
    <svg bind:this={svgEl}></svg>

    {#if tooltip}
      {@const flipLeft = tooltip.x > (width * 0.65)}
      <div
        class="tooltip"
        class:flip={flipLeft}
        style="left: {tooltip.x}px; top: {M.top}px"
      >
        <div class="tt-year">{tooltip.year}</div>
        {#each tooltip.rows as row}
          <div class="tt-row">
            <span class="tt-dot" style="background:{COLORS[row.surf]}"></span>
            <span class="tt-label">{LABELS[row.surf]}</span>
            <span class="tt-val">{row.value}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .trend-outer  { width: 100%; }
  .chart-area   { position: relative; }
  svg           { display: block; overflow: visible; }

  .toggle-row   { margin-bottom: 1rem; }
  .toggle-btns  { display: flex; gap: 0.5rem; margin-bottom: 0.6rem; }

  button {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.4rem 1rem;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  button.active {
    background: var(--color-surface-2);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
  button:hover:not(.active) {
    border-color: var(--color-text-faint);
    color: var(--color-text);
  }

  .mode-desc {
    font-family: var(--font-sans);
    font-size: 0.82rem;
    color: var(--color-text-muted);
    line-height: 1.5;
    max-width: 580px;
  }

  /* Tooltip */
  .tooltip {
    position: absolute;
    transform: translateX(10px);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    pointer-events: none;
    white-space: nowrap;
    z-index: var(--z-tooltip);
    font-family: var(--font-mono);
    font-size: 0.78rem;
  }
  .tooltip.flip { transform: translateX(calc(-100% - 10px)); }

  .tt-year {
    color: var(--color-text);
    font-size: 0.85rem;
    margin-bottom: 0.35rem;
    letter-spacing: 0.05em;
  }
  .tt-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-text-muted);
    line-height: 1.7;
  }
  .tt-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .tt-label { flex: 1; }
  .tt-val   { color: var(--color-text); font-weight: 500; }
</style>
