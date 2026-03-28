<script>
  import * as d3 from 'd3';
  import { untrack } from 'svelte';
  import rawData from '$data/surface_speed_current.json';

  let { activeStep = 0 } = $props();

  const data = rawData.filter(d => ['Hard', 'Clay', 'Grass'].includes(d.surface));
  const COLORS  = { Hard: '#3a6080', Clay: '#c1622e', Grass: '#4a7c3f' };
  const SURFACES = ['Clay', 'Hard', 'Grass']; // ordine Y: terra, cemento, erba
  const LABELS  = { Grass: 'Erba', Hard: 'Cemento', Clay: 'Terra' };
  const M = { top: 20, right: 20, bottom: 40, left: 70 };
  const H0 = 220, H1 = 320;

  let containerEl;
  let svgEl;
  let width        = $state(600);
  let tooltip      = $state({ visible: false, x: 0, y: 0, d: null });
  let latchedStep = $state(0); // parte da 0
  let firstDraw = true;        // prima render sempre in step 0
  let lastScrollY = 0;
  let isScrollingUp = false;

  $effect(() => {
    if (typeof window === 'undefined') return;
    function onScroll() {
      isScrollingUp = window.scrollY < lastScrollY;
      lastScrollY = window.scrollY;
    }
    lastScrollY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  $effect(() => {
    if (activeStep === undefined) return;
    if (activeStep > latchedStep) {
      latchedStep = activeStep;                          // avanti: apri sempre
    } else if (activeStep < latchedStep && isScrollingUp) {
      latchedStep = activeStep;                          // indietro: chiudi solo scrollando su
    }
  });

  $effect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(containerEl);
    return () => ro.disconnect();
  });

  function getY(surface, step, innerH) {
    if (step === 0) return innerH / 2;
    const idx = SURFACES.indexOf(surface);
    return (innerH / (SURFACES.length + 1)) * (idx + 1);
  }

  function styleAxis(sel) {
    sel.select('.domain').attr('stroke', '#4C566A');
    sel.selectAll('.tick line').attr('stroke', '#4C566A');
    sel.selectAll('.tick text')
      .attr('fill', '#8a9ab5').attr('font-size', '11px')
      .attr('font-family', 'Roboto Mono, monospace');
  }

  function showTooltip(event, d) {
    const rect = containerEl.getBoundingClientRect();
    tooltip = { visible: true, x: event.clientX - rect.left, y: event.clientY - rect.top, d };
  }

  function moveTooltip(event) {
    const rect = containerEl.getBoundingClientRect();
    tooltip = { ...tooltip, x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function hideTooltip() { tooltip = { ...tooltip, visible: false }; }

  $effect(() => {
    if (!svgEl || width === 0) return;
    const w    = width;
    const step = firstDraw ? 0 : untrack(() => latchedStep);
    firstDraw = false;
    const h    = step === 0 ? H0 : H1;
    const innerW = w - M.left - M.right;
    const innerH = h - M.top - M.bottom;
    const xS   = d3.scaleLinear().domain([0.35, 1.55]).range([0, innerW]);

    const root = d3.select(svgEl);
    root.selectAll('*').remove();
    root.attr('width', w).attr('height', h);

    const g = root.append('g').attr('class', 'inner')
      .attr('transform', `translate(${M.left},${M.top})`);

    g.append('g').attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xS).ticks(8).tickFormat(d3.format('.2f')))
      .call(styleAxis);

    g.append('text')
      .attr('class', 'x-label')
      .attr('x', innerW / 2).attr('y', innerH + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6c757d').attr('font-size', '11px')
      .attr('font-family', 'Roboto Mono, monospace')
      .text('Surface Speed Rating');

    g.append('g').attr('class', 'dots')
      .selectAll('circle')
      .data(data, d => d.tournament)
      .enter().append('circle')
      .attr('r', 20)
      .attr('cx', d => xS(d.speed))
      .attr('cy', d => getY(d.surface, step, innerH))
      .attr('fill', d => COLORS[d.surface])
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.88)
      .style('cursor', 'pointer')
      .on('mouseover', showTooltip)
      .on('mousemove', moveTooltip)
      .on('mouseout', hideTooltip)
      .on('click', (event, d) => {
        event.stopPropagation();
        const rect = containerEl.getBoundingClientRect();
        const isSame = tooltip.visible && tooltip.d?.tournament === d.tournament;
        tooltip = {
          visible: !isSame,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          d,
        };
      });

    const lG = g.append('g').attr('class', 'cat-labels');
    SURFACES.forEach(surf => {
      lG.append('text')
        .datum({ surface: surf })
        .attr('x', -8)
        .attr('y', getY(surf, step, innerH))
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', COLORS[surf])
        .attr('font-size', 12)
        .attr('font-family', 'Roboto Mono, monospace')
        .attr('opacity', step >= 1 ? 1 : 0)
        .text(LABELS[surf]);
    });
  });

  $effect(() => {
    const step = latchedStep;
    if (!svgEl) return;
    const root = d3.select(svgEl);
    if (root.select('g.inner').empty()) return;

    const h      = step === 0 ? H0 : H1;
    const innerH = h - M.top - M.bottom;

    root.transition().duration(400).attr('height', h);

    root.select('.x-axis')
      .transition().duration(400)
      .attr('transform', `translate(0,${innerH})`);

    root.select('.x-label')
      .transition().duration(400)
      .attr('y', innerH + 35);

    root.select('.dots').selectAll('circle')
      .interrupt()
      .transition().duration(600).ease(d3.easeCubicInOut)
      .attr('cy', d => getY(d.surface, step, innerH));


    root.select('.cat-labels').selectAll('text')
      .interrupt()
      .transition().duration(300)
      .attr('opacity', step >= 1 ? 1 : 0)
      .attr('y', d => getY(d.surface, step, innerH));
  });
</script>

<div
  bind:this={containerEl}
  class="chart-outer"
  aria-label="Dot plot velocità superfici tennis"
  onclick={hideTooltip}
  role="img"
>
  <svg bind:this={svgEl}></svg>

  {#if tooltip.visible && tooltip.d}
    <div
      class="tooltip"
      style="left: {tooltip.x + 14}px; top: {tooltip.y - 14}px;"
      role="tooltip"
    >
      <strong>{tooltip.d.tournament}</strong>
      <span>{LABELS[tooltip.d.surface] ?? tooltip.d.surface}</span>
      <span>Rating: {tooltip.d.speed.toFixed(2)}</span>
    </div>
  {/if}
</div>

<style>
  .chart-outer {
    width: 100%;
    position: relative;
  }

  svg {
    display: block;
    overflow: visible;
  }

  .tooltip {
    position: absolute;
    pointer-events: none;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--color-text);
    line-height: 1.6;
    white-space: nowrap;
    z-index: var(--z-tooltip);
    display: flex;
    flex-direction: column;
  }

  .tooltip strong {
    font-weight: 500;
  }

  .tooltip span {
    color: var(--color-text-muted);
  }
</style>
