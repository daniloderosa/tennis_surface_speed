<script>
  import * as d3 from 'd3';
  import { untrack } from 'svelte';
  import rawData from '$data/surface_speed_current.json';

  let { activeStep = 0 } = $props();

  const data = rawData.filter(d => ['Hard', 'Clay', 'Grass'].includes(d.surface));
  const COLORS = { Hard: '#3a6080', Clay: '#c1622e', Grass: '#4a7c3f' };
  const SURFACES = ['Grass', 'Hard', 'Clay'];
  const LABELS  = { Grass: 'Erba', Hard: 'Cemento', Clay: 'Terra' };
  const M = { top: 20, right: 20, bottom: 40, left: 70 };
  const H0 = 220, H1 = 320;

  let containerEl;
  let svgEl;
  let width = $state(600);

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
    sel.selectAll('.tick text').attr('fill', '#8a9ab5').attr('font-size', '11px').attr('font-family', 'Roboto Mono, monospace');
  }

  $effect(() => {
    if (!svgEl || width === 0) return;
    const w = width;
    const step = untrack(() => activeStep);
    const h = step === 0 ? H0 : H1;
    const innerW = w - M.left - M.right;
    const innerH = h - M.top - M.bottom;
    const xS = d3.scaleLinear().domain([0.35, 1.55]).range([0, innerW]);

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
      .attr('x', innerW / 2).attr('y', innerH + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6c757d').attr('font-size', '11px')
      .attr('font-family', 'Roboto Mono, monospace')
      .text('Surface Speed Rating');

    g.append('g').attr('class', 'dots')
      .selectAll('circle')
      .data(data, d => d.tournament)
      .enter().append('circle')
      .attr('r', 5)
      .attr('cx', d => xS(d.speed))
      .attr('cy', d => getY(d.surface, step, innerH))
      .attr('fill', d => COLORS[d.surface])
      .attr('opacity', 0.75);

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
    const step = activeStep;
    if (!svgEl) return;
    const root = d3.select(svgEl);
    if (root.select('g.inner').empty()) return;

    const h = step === 0 ? H0 : H1;
    const innerH = h - M.top - M.bottom;

    root.transition().duration(400).attr('height', h);

    root.select('.x-axis')
      .transition().duration(400)
      .attr('transform', `translate(0,${innerH})`);

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

<div bind:this={containerEl} class="chart-outer" aria-label="Dot plot velocità superfici tennis">
  <svg bind:this={svgEl}></svg>
</div>

<style>
  .chart-outer { width: 100%; }
  svg { display: block; overflow: visible; }
</style>
