<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import rawData from '$data/surface_speed_current.json';

  let { activeStep = undefined } = $props();

  let svg;
  let width  = $state(600);
  let height = $state(400);

  // Costanti layout
  const MARGIN = { top: 20, right: 40, bottom: 50, left: 20 };
  const SURFACE_ORDER = ['Clay', 'Grass', 'Hard'];

  // Colori da CSS custom properties (letti una volta al mount)
  const COLORS = {
    Hard:    '#5E81AC',
    Clay:    '#BF616A',
    Grass:   '#A3BE8C',
    neutral: '#6c757d',
    highlight: '#EBCB8B',
  };

  // Tornei anomali da etichettare al passo 2 / sezione 4
  const ANOMALY_LABELS = new Set([
    'Gstaad', 'Rio de Janeiro', 'Roland Garros',
    'Indian Wells Masters 2025', 'Paris Masters',
    'Monte Carlo Masters', 'Bucharest'
  ]);

  // Aggiunge jitter deterministico per superficie
  function jitter(d, bandScale, seed = 0) {
    const h = Math.sin(seed * 9301 + 49297) * 233280;
    return (h % 1) * bandScale.bandwidth() * 0.8 + bandScale.bandwidth() * 0.1;
  }

  function draw() {
    if (!svg || width === 0) return;

    const W = width  - MARGIN.left - MARGIN.right;
    const H = height - MARGIN.top  - MARGIN.bottom;

    const xScale = d3.scaleLinear()
      .domain([0.3, 1.6])
      .range([0, W]);

    const yScale = d3.scaleBand()
      .domain(SURFACE_ORDER)
      .range([H, 0])
      .padding(0.15);

    const root = d3.select(svg);
    root.selectAll('*').remove();

    const g = root.append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // ---- zona di sovrapposizione ----
    const overlapRect = g.append('rect')
      .attr('x', xScale(0.65))
      .attr('width', xScale(1.1) - xScale(0.65))
      .attr('y', 0)
      .attr('height', H)
      .attr('fill', COLORS.highlight)
      .attr('opacity', 0);

    // ---- asse X ----
    g.append('g')
      .attr('transform', `translate(0,${H})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(7)
          .tickSize(-H)
          .tickFormat(d3.format('.2f'))
      )
      .call(ax => {
        ax.select('.domain').remove();
        ax.selectAll('.tick line')
          .attr('stroke', '#4C566A')
          .attr('stroke-dasharray', '3,3');
        ax.selectAll('.tick text')
          .attr('fill', '#D8DEE9')
          .attr('font-size', '11px')
          .attr('font-family', "'Roboto Mono', monospace");
      });

    // Label asse X
    g.append('text')
      .attr('x', W / 2)
      .attr('y', H + 42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#D8DEE9')
      .attr('font-size', '12px')
      .attr('font-family', "'Roboto', sans-serif")
      .text('Surface Speed Rating');

    // ---- label superfici (sx) ----
    SURFACE_ORDER.forEach(surf => {
      g.append('text')
        .attr('x', -8)
        .attr('y', yScale(surf) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', activeStep >= 1 ? COLORS[surf] : '#D8DEE9')
        .attr('font-size', '13px')
        .attr('font-weight', '600')
        .attr('font-family', "'Barlow Condensed', sans-serif")
        .attr('letter-spacing', '0.05em')
        .text(surf.toUpperCase());
    });

    // ---- punti ----
    rawData.forEach((d, i) => {
      const cx = xScale(d.speed);
      const cy = yScale(d.surface) + jitter(d, yScale, i);
      const isAnomaly = ANOMALY_LABELS.has(d.tournament);

      // step 0: grigio | step 1+: colore superficie
      const fill = activeStep >= 1 ? COLORS[d.surface] : COLORS.neutral;

      // step 2: attenua i non-anomali
      const opacity = activeStep >= 2
        ? (isAnomaly ? 1 : 0.2)
        : 0.85;

      const r = isAnomaly && activeStep >= 2 ? 6 : 5;

      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', r)
        .attr('fill', fill)
        .attr('opacity', opacity)
        .attr('stroke', isAnomaly && activeStep >= 2 ? '#ECEFF4' : 'none')
        .attr('stroke-width', 1);

      // Label anomalie al passo 2
      if (isAnomaly && activeStep >= 2) {
        const above = ['Gstaad', 'Rio de Janeiro', 'Indian Wells Masters 2025'];
        const dy = above.includes(d.tournament) ? -10 : 14;
        const short = {
          'Indian Wells Masters 2025': 'Indian Wells 2025',
          'Monte Carlo Masters': 'Monte Carlo',
        };
        g.append('text')
          .attr('x', cx)
          .attr('y', cy + dy)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ECEFF4')
          .attr('font-size', '10px')
          .attr('font-family', "'Roboto Mono', monospace")
          .text(short[d.tournament] ?? d.tournament);
      }
    });

    // Zona overlap al passo 2
    overlapRect.transition().duration(500)
      .attr('opacity', activeStep >= 2 ? 0.07 : 0);
  }

  // Ridisegna quando cambiano activeStep o dimensioni
  $effect(() => { activeStep; width; height; draw(); });

  onMount(() => {
    const ro = new ResizeObserver(entries => {
      width  = entries[0].contentRect.width;
      height = entries[0].contentRect.height;
    });
    ro.observe(svg.parentElement);
    return () => ro.disconnect();
  });
</script>

<div class="chart-wrapper" aria-label="Strip plot della velocità di superficie per tutti i tornei ATP. Hard in blu, terra in rosso, erba in verde.">
  <svg bind:this={svg} width={width} height={height}></svg>
</div>

<style>
  .chart-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg { overflow: visible; }
</style>
