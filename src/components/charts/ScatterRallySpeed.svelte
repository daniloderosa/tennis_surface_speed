<script>
  import * as d3 from 'd3';
  import { t, getLang } from '$lib/i18n.svelte.js';
  import rawData from '$data/rally_scatter_multiyear.json';

  const COLORS_LIGHT = { Hard: '#3a6080', Clay: '#c1622e', Grass: '#5eaa42' };
  const COLORS_DARK  = { Hard: '#5E81AC', Clay: '#c1622e', Grass: '#5eaa42' };
  function getColors() {
    const dark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
    return dark ? COLORS_DARK : COLORS_LIGHT;
  }
  function getLabels() { return { Grass: t('label_grass'), Hard: t('label_hard'), Clay: t('label_clay') }; }
  const SURFACES = ['Grass', 'Hard', 'Clay'];
  const M = { top: 40, right: 30, bottom: 65, left: 65 };

  // Bridge derived for lang reactivity
  const lang = $derived(getLang());

  // Available years (descending)
  const years = [...new Set(rawData.map(d => d.year))].sort((a, b) => b - a);

  // Selected year — default 2025
  let selectedYear = $state(2025);

  // Filtered data reactive on year
  const filteredData = $derived(rawData.filter(d => d.year === selectedYear));

  // Fixed domain over ALL years for stable axes
  const xDomainAll = d3.extent(rawData, d => d.speed);
  const yDomainAll = d3.extent(rawData, d => d.rally_avg);

  let containerEl;
  let svgEl;
  let width  = $state(600);
  let height = $state(420);
  let tooltip = $state(null);

  $effect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver(([e]) => {
      width  = e.contentRect.width;
      height = e.contentRect.height;
    });
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

  $effect(() => {
    void lang;
    const fd = filteredData; // reactive on selectedYear + lang
    if (!svgEl || width === 0 || height === 0) return;
    draw(width, height, fd);
  });

  function draw(w, h, data) {
    const C = getColors();
    const L = getLabels();
    const W = w - M.left - M.right;
    const H = h - M.top  - M.bottom;

    const xScale = d3.scaleLinear()
      .domain([xDomainAll[0] - 0.05, xDomainAll[1] + 0.05])
      .range([0, W]);
    const yScale = d3.scaleLinear()
      .domain([yDomainAll[0] - 0.1, yDomainAll[1] + 0.1])
      .range([H, 0]);

    const root = d3.select(svgEl);
    root.selectAll('*').remove();
    root.attr('width', w).attr('height', h);

    const g = root.append('g').attr('transform', `translate(${M.left},${M.top})`);

    // Grid
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-W).tickFormat(''))
      .call(ax => {
        ax.select('.domain').remove();
        ax.selectAll('.tick line').attr('stroke', '#3B4252').attr('stroke-dasharray', '3,3');
      });

    // X axis
    const isMobile = w < 768;
    g.append('g')
      .attr('transform', `translate(0,${H})`)
      .call(isMobile
        ? d3.axisBottom(xScale).ticks(4).tickFormat(d3.format('.2f'))
        : d3.axisBottom(xScale).ticks(6).tickFormat(d3.format('.2f')))
      .call(styleAxis);

    g.append('text')
      .attr('x', W / 2).attr('y', H + 56)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text-muted)').attr('font-size', '14px')
      .attr('font-family', 'Roboto Mono, monospace')
      .text(t('axis_speed'));

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.1f')))
      .call(styleAxis);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -H / 2).attr('y', -52)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text-muted)').attr('font-size', '14px')
      .attr('font-family', 'Roboto Mono, monospace')
      .text(t('axis_rally'));

    // Dots
    const DOT_R = isMobile ? 7 : 10;
    g.append('g').selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.speed))
      .attr('cy', d => yScale(d.rally_avg))
      .attr('r', DOT_R)
      .attr('fill', d => C[d.surface])
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#2E3440')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', DOT_R + 2).attr('stroke', '#D8DEE9').attr('stroke-width', 1.5);
        const svgRect = svgEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        const cx = svgRect.left - containerRect.left + M.left + xScale(d.speed);
        const cy = svgRect.top  - containerRect.top  + M.top  + yScale(d.rally_avg);
        tooltip = { x: cx, y: cy, d };
      })
      .on('mouseleave', function() {
        d3.select(this).attr('r', DOT_R).attr('stroke', '#2E3440').attr('stroke-width', 1);
        tooltip = null;
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        const svgRect = svgEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        const cx = svgRect.left - containerRect.left + M.left + xScale(d.speed);
        const cy = svgRect.top  - containerRect.top  + M.top  + yScale(d.rally_avg);
        const isSame = tooltip && tooltip.d?.tournament === d.tournament;
        tooltip = isSame ? null : { x: cx, y: cy, d };
      });

    // Legend
    const leg = root.append('g').attr('transform', `translate(${M.left}, 8)`);
    SURFACES.forEach((surf, i) => {
      const lx = [0, 80, 175][i];
      leg.append('rect').attr('x', lx).attr('y', 0)
        .attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', C[surf]);
      leg.append('text').attr('x', lx + 16).attr('y', 10)
        .style('fill', 'var(--color-text-muted)').attr('font-size', '14px')
        .attr('font-family', 'Roboto, sans-serif').text(L[surf]);
    });
  }
</script>

<div class="scatter-outer" onclick={() => { tooltip = null; }} role="presentation">
  <!-- Year selector -->
  <div class="controls">
    <label for="scatter-year">{t('scatter_year')}</label>
    <select id="scatter-year" bind:value={selectedYear}>
      {#each years as y}
        <option value={y}>{y}</option>
      {/each}
    </select>
    <span class="count">— {filteredData.length} {t('scatter_tournaments')}</span>
  </div>

  <!-- Chart -->
  <div class="chart-area" bind:this={containerEl} aria-label="Scatterplot velocità superficie vs durata media degli scambi">
    <svg bind:this={svgEl}></svg>

    {#if tooltip}
      {@const flipLeft = tooltip.x > (width * 0.65)}
      {@const flipUp   = tooltip.y > (height * 0.65)}
      <div
        class="tooltip"
        class:flip={flipLeft}
        class:flip-up={flipUp}
        style="left: {tooltip.x}px; top: {tooltip.y}px"
      >
        <div class="tt-name">
          <span class="tt-dot" style="background:{getColors()[tooltip.d.surface]}"></span>
          {tooltip.d.tournament}
        </div>
        <div class="tt-row">
          <span class="tt-label">{getLabels()[tooltip.d.surface]}</span>
        </div>
        <div class="tt-row">
          <span class="tt-label">Speed Rating</span>
          <span class="tt-val">{d3.format('.2f')(tooltip.d.speed)}</span>
        </div>
        <div class="tt-row">
          <span class="tt-label">{t('axis_rally')}</span>
          <span class="tt-val">{d3.format('.2f')(tooltip.d.rally_avg)}</span>
        </div>
        <div class="tt-row">
          <span class="tt-label">Match</span>
          <span class="tt-val">{tooltip.d.n_matches}</span>
        </div>
      </div>
    {/if}
  </div>

  <p class="note">{t('scatter_note')}</p>
</div>

<style>
  .scatter-outer {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* ── Year selector ─────────────────────────────────────────── */
  .controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--color-text-muted);
  }

  label {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.78rem;
  }

  select {
    appearance: none;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: 0.82rem;
    padding: 0.3rem 2rem 0.3rem 0.75rem;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2388C0D0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    transition: border-color 0.2s, background 0.2s;
  }

  select:hover, select:focus {
    border-color: var(--color-primary);
    outline: none;
  }

  .count {
    color: var(--color-text-faint);
    font-size: 0.78rem;
  }

  /* ── Chart ─────────────────────────────────────────────────── */
  .chart-area {
    position: relative;
    flex: 1;
    min-height: 0;
  }

  svg { display: block; overflow: visible; width: 100%; height: 100%; }

  /* ── Note ──────────────────────────────────────────────────── */
  .note {
    margin-top: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--color-text-faint);
    line-height: 1.5;
  }

  /* ── Tooltip ───────────────────────────────────────────────── */
  .tooltip {
    position: absolute;
    transform: translateX(12px) translateY(-50%);
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
  .tooltip.flip    { transform: translateX(calc(-100% - 12px)) translateY(-50%); }
  .tooltip.flip-up { transform: translateX(12px) translateY(calc(-100% - 4px)); }
  .tooltip.flip.flip-up { transform: translateX(calc(-100% - 12px)) translateY(calc(-100% - 4px)); }

  .tt-name {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-text);
    font-size: 0.82rem;
    font-weight: 500;
    margin-bottom: 0.4rem;
  }
  .tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .tt-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-text-muted);
    line-height: 1.7;
  }
  .tt-label { flex: 1; }
  .tt-val   { color: var(--color-text); font-weight: 500; }
</style>
