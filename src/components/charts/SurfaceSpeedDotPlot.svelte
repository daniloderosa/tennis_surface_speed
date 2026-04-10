<script>
  import * as d3 from 'd3';
  import { untrack } from 'svelte';
  import { t, getLang } from '$lib/i18n.svelte.js';
  import rawData from '$data/surface_speed_current.json';

  let { activeStep = 0 } = $props();

  const data = rawData.filter(d => ['Hard', 'Clay', 'Grass'].includes(d.surface));
  const COLORS_LIGHT = { Hard: '#3a6080', Clay: '#c1622e', Grass: '#5eaa42' };
  const COLORS_DARK  = { Hard: '#5E81AC', Clay: '#c1622e', Grass: '#5eaa42' };
  function getColors() {
    const dark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
    return dark ? COLORS_DARK : COLORS_LIGHT;
  }
  function getLabels() {
    return { Clay: t('label_clay'), Hard: t('label_hard'), Grass: t('label_grass') };
  }
  const SURFACES = ['Clay', 'Hard', 'Grass']; // ordine Y desktop / ordine X mobile
  const M_DSK = { top: 20, right: 20, bottom: 55, left: 70 };
  const M_MOB = { top: 20, right: 15, bottom: 55, left: 55 };
  const H0 = 264, H1 = 384;
  const H0_MOB = 230, H1_MOB = 270;

  // Bridge derived: garantisce rebuild al cambio lingua
  const lang = $derived(getLang());

  let containerEl;
  let svgEl;
  let width        = $state(600);
  let tooltip      = $state({ visible: false, x: 0, y: 0, d: null });
  let latchedStep  = $state(0);
  let firstDraw    = true;
  let lastScrollY  = 0;
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
      latchedStep = activeStep;
    } else if (activeStep < latchedStep && isScrollingUp) {
      latchedStep = activeStep;
    }
  });

  $effect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(containerEl);
    return () => ro.disconnect();
  });

  // ── desktop helpers ────────────────────────────────────────────────────────
  function getDeskY(surface, step, innerH) {
    if (step === 0) return innerH / 2;
    const idx = SURFACES.indexOf(surface);
    return (innerH / (SURFACES.length + 1)) * (idx + 1);
  }

  // ── mobile helpers ────────────────────────────────────────────────────────
  function getMobX(surface, step, innerW) {
    if (step === 0) return innerW / 2;
    const idx = SURFACES.indexOf(surface);
    return (innerW / (SURFACES.length + 1)) * (idx + 1);
  }

  function styleAxis(sel) {
    sel.select('.domain').attr('stroke', '#4C566A');
    sel.selectAll('.tick line').attr('stroke', '#4C566A');
    sel.selectAll('.tick text')
      .style('fill', 'var(--color-text-muted)').attr('font-size', '14px')
      .attr('font-family', 'Roboto Mono, monospace');
  }

  function styleAxisMob(sel) {
    sel.select('.domain').attr('stroke', '#4C566A');
    sel.selectAll('.tick line').attr('stroke', '#4C566A');
    sel.selectAll('.tick text')
      .style('fill', 'var(--color-text-muted)').attr('font-size', '12px')
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

  // ── Main draw effect ───────────────────────────────────────────────────────
  $effect(() => {
    void lang; // legge il derived → dipendenza garantita su cambio lingua
    if (!svgEl || width === 0) return;
    const C  = getColors();
    const L  = getLabels();
    const w  = width;
    const step = firstDraw ? 0 : untrack(() => latchedStep);
    firstDraw = false;
    const isMobile = w < 768;

    if (isMobile) {
      drawMobile(w, step, C, L);
    } else {
      drawDesktop(w, step, C, L);
    }
  });

  function drawDesktop(w, step, C, L) {
    const M = M_DSK;
    const h = step === 0 ? H0 : H1;
    const innerW = w - M.left - M.right;
    const innerH = h - M.top - M.bottom;
    const xS = d3.scaleLinear().domain([0.35, 1.55]).range([0, innerW]);

    const root = d3.select(svgEl);
    root.selectAll('*').remove();
    root.attr('width', w).attr('height', h);
    const g = root.append('g').attr('class', 'inner').attr('transform', `translate(${M.left},${M.top})`);

    g.append('g').attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xS).ticks(8).tickFormat(d3.format('.2f')))
      .call(styleAxis);

    g.append('text')
      .attr('class', 'x-label')
      .attr('x', innerW / 2).attr('y', innerH + 46)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text-muted)').attr('font-size', '14px')
      .attr('font-family', 'Roboto Mono, monospace')
      .text(t('axis_speed'));

    const r = 10;
    g.append('g').attr('class', 'dots')
      .selectAll('circle')
      .data(data, d => d.tournament)
      .enter().append('circle')
      .attr('r', r)
      .attr('cx', d => xS(d.speed))
      .attr('cy', d => getDeskY(d.surface, step, innerH))
      .attr('fill', d => C[d.surface])
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.75)
      .style('cursor', 'pointer')
      .on('mouseover', showTooltip)
      .on('mousemove', moveTooltip)
      .on('mouseout', hideTooltip)
      .on('click', (event, d) => {
        event.stopPropagation();
        const rect = containerEl.getBoundingClientRect();
        const isSame = tooltip.visible && tooltip.d?.tournament === d.tournament;
        tooltip = { visible: !isSame, x: event.clientX - rect.left, y: event.clientY - rect.top, d };
      });

    const lG = g.append('g').attr('class', 'cat-labels');
    SURFACES.forEach(surf => {
      lG.append('text')
        .datum({ surface: surf })
        .attr('x', -8)
        .attr('y', getDeskY(surf, step, innerH))
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', C[surf])
        .attr('font-size', 14)
        .attr('font-family', 'Roboto Mono, monospace')
        .attr('opacity', step >= 1 ? 1 : 0)
        .text(L[surf]);
    });
  }

  function drawMobile(w, step, C, L) {
    const M = M_MOB;
    const h = step === 0 ? H0_MOB : H1_MOB;
    const innerW = w - M.left - M.right;
    const innerH = h - M.top - M.bottom;
    const yS = d3.scaleLinear().domain([0.35, 1.55]).range([innerH, 0]);

    const root = d3.select(svgEl);
    root.selectAll('*').remove();
    root.attr('width', w).attr('height', h);
    const g = root.append('g').attr('class', 'inner').attr('transform', `translate(${M.left},${M.top})`);

    // Y axis: speed rating ticks fissi
    g.append('g').attr('class', 'y-axis')
      .call(d3.axisLeft(yS).tickValues([0.75, 1.00, 1.25]).tickFormat(d3.format('.2f')))
      .call(styleAxisMob);

    // Linea di riferimento a 1 (media tour)
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', yS(1)).attr('y2', yS(1))
      .attr('stroke', '#4C566A').attr('stroke-width', 1).attr('stroke-dasharray', '4,3');

    // Dots: cx = banda superficie, cy = speed
    const r = 5;
    g.append('g').attr('class', 'dots')
      .selectAll('circle')
      .data(data, d => d.tournament)
      .enter().append('circle')
      .attr('r', r)
      .attr('cx', d => getMobX(d.surface, step, innerW))
      .attr('cy', d => yS(d.speed))
      .attr('fill', d => C[d.surface])
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.75)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        const rect = containerEl.getBoundingClientRect();
        const isSame = tooltip.visible && tooltip.d?.tournament === d.tournament;
        tooltip = { visible: !isSame, x: event.clientX - rect.left, y: event.clientY - rect.top, d };
      })
      .on('touchend', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const touch = event.changedTouches[0];
        const rect = containerEl.getBoundingClientRect();
        const d = d3.select(this).datum();
        const isSame = tooltip.visible && tooltip.d?.tournament === d.tournament;
        tooltip = { visible: !isSame, x: touch.clientX - rect.left, y: touch.clientY - rect.top, d };
      });

    // Label superfici in basso (visibili solo allo step 1)
    const lG = g.append('g').attr('class', 'cat-labels');
    SURFACES.forEach(surf => {
      lG.append('text')
        .datum({ surface: surf })
        .attr('x', getMobX(surf, 1, innerW))
        .attr('y', innerH + 38)
        .attr('text-anchor', 'middle')
        .attr('fill', C[surf])
        .attr('font-size', 13)
        .attr('font-family', 'Roboto Mono, monospace')
        .attr('opacity', step >= 1 ? 1 : 0)
        .text(L[surf]);
    });
  }

  // ── Transition effect (step change only) ──────────────────────────────────
  $effect(() => {
    const step = latchedStep;
    if (!svgEl) return;
    const root = d3.select(svgEl);
    if (root.select('g.inner').empty()) return;

    const w = untrack(() => width);
    const isMobile = w < 768;

    if (isMobile) {
      const M = M_MOB;
      const h = step === 0 ? H0_MOB : H1_MOB;
      const innerW = w - M.left - M.right;

      root.transition().duration(400).attr('height', h);

      root.select('.dots').selectAll('circle')
        .interrupt()
        .transition().duration(600).ease(d3.easeCubicInOut)
        .attr('cx', d => getMobX(d.surface, step, innerW));

      root.select('.cat-labels').selectAll('text')
        .interrupt()
        .transition().duration(300)
        .attr('opacity', step >= 1 ? 1 : 0);

    } else {
      const M = M_DSK;
      const h = step === 0 ? H0 : H1;
      const innerH = h - M.top - M.bottom;

      root.transition().duration(400).attr('height', h);

      root.select('.x-axis')
        .transition().duration(400)
        .attr('transform', `translate(0,${innerH})`);

      root.select('.x-label')
        .transition().duration(400)
        .attr('y', innerH + 46);

      root.select('.dots').selectAll('circle')
        .interrupt()
        .transition().duration(600).ease(d3.easeCubicInOut)
        .attr('cy', d => getDeskY(d.surface, step, innerH));

      root.select('.cat-labels').selectAll('text')
        .interrupt()
        .transition().duration(300)
        .attr('opacity', step >= 1 ? 1 : 0)
        .attr('y', d => getDeskY(d.surface, step, innerH));
    }
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
      <span>{getLabels()[tooltip.d.surface] ?? tooltip.d.surface}</span>
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
