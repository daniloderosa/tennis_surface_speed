<script>
  import * as d3 from 'd3';
  import { untrack } from 'svelte';
  import rawData from '$data/rally_length_by_year_surface.json';

  const COLORS   = { Hard: '#3a6080', Clay: '#c1622e', Grass: '#5eaa42' };
  const SURFACES = ['Grass', 'Hard', 'Clay'];
  const LABELS   = { Grass: 'Erba', Hard: 'Cemento', Clay: 'Terra' };
  const M = { top: 40, right: 30, bottom: 65, left: 65 };
  const H = 380;

  const MIN_YEAR = 1990;
  const MAX_YEAR = d3.max(rawData, d => d.year);

  const filtered = rawData.filter(d => d.year >= MIN_YEAR);
  const grouped  = d3.group(filtered, d => d.surface);
  const byYear   = d3.group(filtered, d => d.year);
  const MAX_N    = d3.max(filtered, d => d.n_matches);

  const yDomain = [
    Math.floor(d3.min(filtered, d => d.rally_avg) * 10) / 10 - 0.2,
    Math.ceil( d3.max(filtered, d => d.rally_avg) * 10) / 10 + 0.2,
  ];

  let containerEl;
  let svgEl;
  let width = $state(700);
  let tooltip = $state(null);

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
      .style('fill', 'var(--color-text-muted)').attr('font-size', '14px')
      .attr('font-family', 'Roboto Mono, monospace');
  }

  function makeXScale(w) {
    return d3.scaleLinear()
      .domain([MIN_YEAR, MAX_YEAR])
      .range([0, w - M.left - M.right]);
  }

  function makeYScale(innerH) {
    return d3.scaleLinear().domain(yDomain).range([innerH, 0]).nice();
  }

  function withGaps(data) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      result.push(data[i]);
      const next = data[i + 1];
      if (next && next.year - data[i].year > 1) {
        result.push({ year: data[i].year + 1 });
      }
    }
    return result;
  }

  function makeLineGen(xS, yS) {
    return d3.line()
      .x(d => xS(d.year))
      .y(d => yS(d.rally_avg))
      .curve(d3.curveMonotoneX)
      .defined(d => d.rally_avg != null);
  }

  $effect(() => {
    if (!svgEl || width === 0) return;
    buildChart(width);
  });

  function buildChart(w) {
    const innerW = w - M.left - M.right;
    const innerH = H - M.top - M.bottom;
    const xS  = makeXScale(w);
    const yS  = makeYScale(innerH);
    const lg  = makeLineGen(xS, yS);

    // Scala raggio: ridotta del 70% su mobile
    const isMobile = w < 768;
    const rRange = isMobile ? [1, 5] : [2, 10];
    const rScale = d3.scaleSqrt().domain([1, MAX_N]).range(rRange).clamp(true);

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
      .call(d3.axisLeft(yS).ticks(5).tickFormat(d3.format('.1f')))
      .call(styleAxis);

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2).attr('y', -52)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text-muted)').attr('font-size', '14px')
      .attr('font-family', 'Roboto Mono, monospace')
      .text('Durata media degli scambi');

    // Linee e dot per superficie
    SURFACES.forEach(surf => {
      const sd = withGaps((grouped.get(surf) ?? []).sort((a, b) => a.year - b.year));

      // Linea
      g.append('path')
        .datum(sd)
        .attr('class', `line-${surf}`)
        .attr('fill', 'none')
        .attr('stroke', COLORS[surf])
        .attr('stroke-width', 2)
        .attr('d', lg);

      // Dot su ogni punto, raggio proporzionale a n_matches
      g.append('g').attr('class', `dots-${surf}`)
        .selectAll('circle')
        .data(sd.filter(d => d.rally_avg != null))
        .join('circle')
        .attr('cx', d => xS(d.year))
        .attr('cy', d => yS(d.rally_avg))
        .attr('r',  d => rScale(d.n_matches))
        .attr('fill', COLORS[surf])
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#2E3440')
        .attr('stroke-width', 1);
    });

    // Crosshair
    const ch = g.append('g').attr('class', 'crosshair').attr('display', 'none');
    ch.append('line').attr('class', 'ch-line')
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#D8DEE9').attr('stroke-width', 1).attr('stroke-dasharray', '4,3');
    SURFACES.forEach(surf => {
      ch.append('circle').attr('class', `ch-dot-${surf}`)
        .attr('r', 5).attr('fill', COLORS[surf])
        .attr('stroke', '#2E3440').attr('stroke-width', 1.5);
    });

    // Overlay eventi
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerW).attr('height', innerH)
      .attr('fill', 'none').attr('pointer-events', 'all')
      .on('mousemove touchmove', function(event) {
        event.preventDefault();
        const [px] = event.touches
          ? [event.touches[0].clientX - svgEl.getBoundingClientRect().left - M.left]
          : [d3.pointer(event, this)[0]];
        updateCrosshair(px, w);
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
        .attr('fill', '#666666').attr('font-size', '14px')
        .attr('font-family', 'Roboto, sans-serif').text(LABELS[surf]);
    });
  }

  function updateCrosshair(px, w) {
    const innerH = H - M.top - M.bottom;
    const xS = makeXScale(w);
    const yS = makeYScale(innerH);

    const year = Math.round(xS.invert(px));
    if (year < MIN_YEAR || year > MAX_YEAR) { tooltip = null; return; }

    const yearData = byYear.get(year) ?? [];
    const xPos = xS(year);

    const ch = d3.select(svgEl).select('.crosshair');
    ch.attr('display', null);
    ch.select('.ch-line').attr('x1', xPos).attr('x2', xPos);

    const rows = [];
    SURFACES.forEach(surf => {
      const pt  = yearData.find(d => d.surface === surf);
      const val = pt?.rally_avg;
      ch.select(`.ch-dot-${surf}`)
        .attr('cx', xPos)
        .attr('cy', val != null ? yS(val) : -999)
        .attr('display', val != null ? null : 'none');
      rows.push({
        surf,
        value:    val != null ? d3.format('.2f')(val) : '—',
        nMatches: pt?.n_matches ?? null,
      });
    });

    const svgRect = svgEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    const absX = svgRect.left - containerRect.left + M.left + xPos;

    tooltip = { x: absX, year, rows };
  }
</script>

<div class="rally-outer">
  <div class="chart-area" bind:this={containerEl} aria-label="Andamento lunghezza media degli scambi per superficie">
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
            {#if row.nMatches != null}
              <span class="tt-n">({row.nMatches} match)</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .rally-outer { width: 100%; }
  .chart-area  { position: relative; }
  svg          { display: block; overflow: visible; }

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
  .tt-dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .tt-label { flex: 1; }
  .tt-val   { color: var(--color-text); font-weight: 500; }
  .tt-n     { color: var(--color-text-faint); font-size: 0.72rem; }
</style>
