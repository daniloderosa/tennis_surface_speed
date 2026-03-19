<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import data from '$data/rally_length_by_tournament.json';

  let { activeStep = undefined } = $props();

  let svg;
  let width  = $state(600);
  let height = $state(400);

  const MARGIN = { top: 20, right: 40, bottom: 55, left: 55 };

  const COLORS = {
    Hard:  '#5E81AC',
    Clay:  '#BF616A',
    Grass: '#A3BE8C',
  };

  const OUTLIERS = new Set([
    'Gstaad', 'Paris Masters', 'Indian Wells Masters 2025', 'Roland Garros'
  ]);

  function draw() {
    if (!svg || width === 0) return;

    const W = width  - MARGIN.left - MARGIN.right;
    const H = height - MARGIN.top  - MARGIN.bottom;

    const xExt = d3.extent(data, d => d.speed);
    const yExt = d3.extent(data, d => d.rally_avg);

    const xScale = d3.scaleLinear()
      .domain([xExt[0] - 0.05, xExt[1] + 0.05])
      .range([0, W]);

    const yScale = d3.scaleLinear()
      .domain([yExt[0] - 0.1, yExt[1] + 0.1])
      .range([H, 0]);

    const root = d3.select(svg);
    root.selectAll('*').remove();

    const g = root.append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Griglia
    g.append('g').call(
      d3.axisLeft(yScale).ticks(5).tickSize(-W).tickFormat('')
    ).call(ax => {
      ax.select('.domain').remove();
      ax.selectAll('.tick line').attr('stroke', '#4C566A').attr('stroke-dasharray', '3,3');
    });

    // Asse X
    g.append('g')
      .attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format('.2f')))
      .call(ax => {
        ax.select('.domain').attr('stroke', '#4C566A');
        ax.selectAll('.tick text').attr('fill', '#D8DEE9').attr('font-size', '11px').attr('font-family', "'Roboto Mono', monospace");
        ax.selectAll('.tick line').attr('stroke', '#4C566A');
      });

    g.append('text')
      .attr('x', W / 2).attr('y', H + 45)
      .attr('text-anchor', 'middle').attr('fill', '#D8DEE9')
      .attr('font-size', '12px').attr('font-family', "'Roboto', sans-serif")
      .text('Surface Speed Rating');

    // Asse Y
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call(ax => {
        ax.select('.domain').attr('stroke', '#4C566A');
        ax.selectAll('.tick text').attr('fill', '#D8DEE9').attr('font-size', '11px').attr('font-family', "'Roboto Mono', monospace");
        ax.selectAll('.tick line').attr('stroke', '#4C566A');
      });

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -H / 2).attr('y', -42)
      .attr('text-anchor', 'middle').attr('fill', '#D8DEE9')
      .attr('font-size', '12px').attr('font-family', "'Roboto', sans-serif")
      .text('Lunghezza media rally (colpi)');

    // Linea di tendenza
    const lrData = data.map(d => [d.speed, d.rally_avg]);
    const xMean  = d3.mean(lrData, d => d[0]);
    const yMean  = d3.mean(lrData, d => d[1]);
    const slope  = d3.sum(lrData, d => (d[0] - xMean) * (d[1] - yMean)) /
                   d3.sum(lrData, d => (d[0] - xMean) ** 2);
    const intercept = yMean - slope * xMean;
    const xMin = xExt[0] - 0.05, xMax = xExt[1] + 0.05;

    g.append('line')
      .attr('x1', xScale(xMin)).attr('y1', yScale(slope * xMin + intercept))
      .attr('x2', xScale(xMax)).attr('y2', yScale(slope * xMax + intercept))
      .attr('stroke', '#4C566A').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4').attr('opacity', 0.6);

    // Punti
    data.forEach(d => {
      const isOut = OUTLIERS.has(d.tournament);
      const highlighted = activeStep >= 1;

      const opacity = highlighted
        ? (isOut ? 1 : 0.3)
        : 0.75;

      const r = isOut && highlighted ? 7 : 5;

      g.append('circle')
        .attr('cx', xScale(d.speed))
        .attr('cy', yScale(d.rally_avg))
        .attr('r', r)
        .attr('fill', COLORS[d.surface])
        .attr('opacity', opacity)
        .attr('stroke', isOut && highlighted ? '#ECEFF4' : 'none')
        .attr('stroke-width', 1.5);

      if (isOut && highlighted) {
        const labelPos = {
          'Gstaad':                   { dx: 8,  dy: -10, anchor: 'start' },
          'Paris Masters':            { dx: 8,  dy:  4,  anchor: 'start' },
          'Indian Wells Masters 2025':{ dx: -8, dy: -10, anchor: 'end'   },
          'Roland Garros':            { dx: 8,  dy:  4,  anchor: 'start' },
        };
        const lp = labelPos[d.tournament] ?? { dx: 8, dy: -8, anchor: 'start' };
        const short = { 'Indian Wells Masters 2025': 'IW 2025' };

        g.append('text')
          .attr('x', xScale(d.speed) + lp.dx)
          .attr('y', yScale(d.rally_avg) + lp.dy)
          .attr('text-anchor', lp.anchor)
          .attr('fill', '#ECEFF4')
          .attr('font-size', '11px')
          .attr('font-family', "'Roboto Mono', monospace")
          .text(short[d.tournament] ?? d.tournament);
      }
    });
  }

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

<div class="chart-wrapper" aria-label="Scatterplot velocità superficie vs lunghezza media rally per torneo ATP. Correlazione negativa visibile: più la superficie è lenta, più i rally si allungano.">
  <svg bind:this={svg} width={width} height={height}></svg>
</div>

<style>
  .chart-wrapper { width: 100%; height: 100%; display: flex; align-items: center; }
  svg { overflow: visible; }
</style>
