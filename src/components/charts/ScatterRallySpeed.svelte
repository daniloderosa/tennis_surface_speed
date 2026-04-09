<script>
  import * as d3 from 'd3';
  import data from '$data/rally_length_by_tournament_2025.json';

  const COLORS  = { Hard: '#3a6080', Clay: '#c1622e', Grass: '#5eaa42' };
  const LABELS  = { Grass: 'Erba', Hard: 'Cemento', Clay: 'Terra' };
  const SURFACES = ['Grass', 'Hard', 'Clay'];
  const M = { top: 40, right: 30, bottom: 65, left: 65 };

  let containerEl;
  let svgEl;
  let width  = $state(600);
  let height = $state(420);
  let tooltip = $state(null); // { x, y, d }

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
    if (!svgEl || width === 0 || height === 0) return;
    draw(width, height);
  });

  function draw(w, h) {
    const W = w - M.left - M.right;
    const H = h - M.top  - M.bottom;

    const xExt = d3.extent(data, d => d.speed);
    const yExt = d3.extent(data, d => d.rally_avg);

    const xScale = d3.scaleLinear()
      .domain([xExt[0] - 0.05, xExt[1] + 0.05]).range([0, W]);
    const yScale = d3.scaleLinear()
      .domain([yExt[0] - 0.1, yExt[1] + 0.1]).range([H, 0]);

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
    g.append('g')
      .attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format('.2f')))
      .call(styleAxis);

    g.append('text')
      .attr('x', W / 2).attr('y', H + 56)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text-muted)').attr('font-size', '14px')
      .attr('font-family', 'Roboto Mono, monospace')
      .text('Surface Speed Rating');

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
      .text('Durata media degli scambi');

    // Punti
    g.append('g').selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.speed))
      .attr('cy', d => yScale(d.rally_avg))
      .attr('r', 5)
      .attr('fill', d => COLORS[d.surface])
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#2E3440')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 7).attr('stroke', '#D8DEE9').attr('stroke-width', 1.5);
        const svgRect = svgEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        const cx = svgRect.left - containerRect.left + M.left + xScale(d.speed);
        const cy = svgRect.top  - containerRect.top  + M.top  + yScale(d.rally_avg);
        tooltip = { x: cx, y: cy, d };
      })
      .on('mouseleave', function() {
        d3.select(this).attr('r', 5).attr('stroke', '#2E3440').attr('stroke-width', 1);
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
</script>

<div class="scatter-outer" bind:this={containerEl} aria-label="Scatterplot velocità superficie vs lunghezza media rally per torneo ATP 2025.">
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
        <span class="tt-dot" style="background:{COLORS[tooltip.d.surface]}"></span>
        {tooltip.d.tournament}
      </div>
      <div class="tt-row">
        <span class="tt-label">Speed Rating</span>
        <span class="tt-val">{d3.format('.2f')(tooltip.d.speed)}</span>
      </div>
      <div class="tt-row">
        <span class="tt-label">Durata media degli scambi</span>
        <span class="tt-val">{d3.format('.2f')(tooltip.d.rally_avg)}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .scatter-outer { position: relative; width: 100%; height: 100%; }
  svg { display: block; overflow: visible; width: 100%; height: 100%; }

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
  .tt-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
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
