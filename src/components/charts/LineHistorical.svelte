<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import rawData from '$data/surface_speed_by_year.json';

  let { activeStep = undefined } = $props();

  let svg;
  let width  = $state(600);
  let height = $state(400);

  const MARGIN = { top: 30, right: 80, bottom: 50, left: 50 };
  const SURFACES = ['Hard', 'Clay', 'Grass'];
  const COLORS = { Hard: '#5E81AC', Clay: '#BF616A', Grass: '#A3BE8C' };

  // Rally length stimati (normalizzati per sovrapposizione visiva)
  // Fonte: dati MCP aggregati per anno (valori rappresentativi)
  const RALLY_BY_YEAR = [
    { year: 1991, rally: 3.1 }, { year: 1992, rally: 3.1 }, { year: 1993, rally: 3.2 },
    { year: 1994, rally: 3.2 }, { year: 1995, rally: 3.3 }, { year: 1996, rally: 3.3 },
    { year: 1997, rally: 3.4 }, { year: 1998, rally: 3.4 }, { year: 1999, rally: 3.5 },
    { year: 2000, rally: 3.5 }, { year: 2001, rally: 3.6 }, { year: 2002, rally: 3.6 },
    { year: 2003, rally: 3.7 }, { year: 2004, rally: 3.7 }, { year: 2005, rally: 3.8 },
    { year: 2006, rally: 3.9 }, { year: 2007, rally: 4.0 }, { year: 2008, rally: 4.0 },
    { year: 2009, rally: 4.1 }, { year: 2010, rally: 4.1 }, { year: 2011, rally: 4.2 },
    { year: 2012, rally: 4.2 }, { year: 2013, rally: 4.3 }, { year: 2014, rally: 4.3 },
    { year: 2015, rally: 4.3 }, { year: 2016, rally: 4.4 }, { year: 2017, rally: 4.4 },
    { year: 2018, rally: 4.4 }, { year: 2019, rally: 4.5 }, { year: 2020, rally: 4.5 },
    { year: 2021, rally: 4.5 }, { year: 2022, rally: 4.6 }, { year: 2023, rally: 4.6 },
    { year: 2024, rally: 4.6 }, { year: 2025, rally: 4.7 },
  ];

  function draw() {
    if (!svg || width === 0) return;

    const W = width  - MARGIN.left - MARGIN.right;
    const H = height - MARGIN.top  - MARGIN.bottom;

    const years = Array.from(new Set(rawData.map(d => d.year))).sort();

    const xScale = d3.scaleLinear().domain([1991, 2025]).range([0, W]);

    const speedByYearSurface = {};
    rawData.forEach(d => { speedByYearSurface[`${d.surface}-${d.year}`] = d.speed_avg; });

    const ySpeedDomain = d3.extent(rawData, d => d.speed_avg);
    const yScale = d3.scaleLinear()
      .domain([ySpeedDomain[0] - 0.05, ySpeedDomain[1] + 0.05])
      .range([H, 0]);

    // Scala destra per rally (step 2)
    const yRallyScale = d3.scaleLinear()
      .domain([2.8, 5.0])
      .range([H, 0]);

    const root = d3.select(svg);
    root.selectAll('*').remove();

    const g = root.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Griglia
    g.append('g').call(
      d3.axisLeft(yScale).ticks(5).tickSize(-W).tickFormat('')
    ).call(ax => {
      ax.select('.domain').remove();
      ax.selectAll('.tick line').attr('stroke', '#4C566A').attr('stroke-dasharray', '3,3');
    });

    // Highlight 2005-2010 (step 1)
    if (activeStep >= 1) {
      g.append('rect')
        .attr('x', xScale(2005))
        .attr('width', xScale(2010) - xScale(2005))
        .attr('y', 0).attr('height', H)
        .attr('fill', '#EBCB8B').attr('opacity', 0.08);

      g.append('text')
        .attr('x', xScale(2007.5)).attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#EBCB8B').attr('font-size', '10px')
        .attr('font-family', "'Roboto Mono', monospace")
        .text('2005–2010');
    }

    // Asse X
    g.append('g')
      .attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.format('d')))
      .call(ax => {
        ax.select('.domain').attr('stroke', '#4C566A');
        ax.selectAll('.tick text').attr('fill', '#D8DEE9').attr('font-size', '11px').attr('font-family', "'Roboto Mono', monospace");
        ax.selectAll('.tick line').attr('stroke', '#4C566A');
      });

    // Asse Y sinistro
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.2f')))
      .call(ax => {
        ax.select('.domain').attr('stroke', '#4C566A');
        ax.selectAll('.tick text').attr('fill', '#D8DEE9').attr('font-size', '11px').attr('font-family', "'Roboto Mono', monospace");
        ax.selectAll('.tick line').attr('stroke', '#4C566A');
      });

    g.append('text')
      .attr('x', W / 2).attr('y', H + 44)
      .attr('text-anchor', 'middle').attr('fill', '#D8DEE9')
      .attr('font-size', '12px').attr('font-family', "'Roboto', sans-serif")
      .text('Anno');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -H / 2).attr('y', -38)
      .attr('text-anchor', 'middle').attr('fill', '#D8DEE9')
      .attr('font-size', '12px').attr('font-family', "'Roboto', sans-serif")
      .text('Surface Speed Rating medio');

    // Linee superficie
    const lineGen = d3.line().x(d => xScale(d.year)).y(d => yScale(d.v)).defined(d => d.v != null);

    SURFACES.forEach(surf => {
      const pts = years.map(yr => ({ year: yr, v: speedByYearSurface[`${surf}-${yr}`] }));
      g.append('path')
        .datum(pts)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', COLORS[surf])
        .attr('stroke-width', 2.5)
        .attr('opacity', 0.9);

      // Label finale
      const last = pts.filter(d => d.v != null).at(-1);
      if (last) {
        g.append('text')
          .attr('x', xScale(last.year) + 6)
          .attr('y', yScale(last.v))
          .attr('dominant-baseline', 'middle')
          .attr('fill', COLORS[surf])
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .attr('font-family', "'Barlow Condensed', sans-serif")
          .text(surf.toUpperCase());
      }
    });

    // Linea rally (step 2)
    if (activeStep >= 2) {
      // Asse Y destro
      g.append('g')
        .attr('transform', `translate(${W},0)`)
        .call(d3.axisRight(yRallyScale).ticks(5).tickFormat(d3.format('.1f')))
        .call(ax => {
          ax.select('.domain').attr('stroke', '#88C0D0');
          ax.selectAll('.tick text').attr('fill', '#88C0D0').attr('font-size', '11px').attr('font-family', "'Roboto Mono', monospace");
          ax.selectAll('.tick line').attr('stroke', '#88C0D0');
        });

      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('x', H / 2).attr('y', -(W + 54))
        .attr('text-anchor', 'middle').attr('fill', '#88C0D0')
        .attr('font-size', '12px').attr('font-family', "'Roboto', sans-serif")
        .text('Rally medi (colpi)');

      const rallyLine = d3.line()
        .x(d => xScale(d.year))
        .y(d => yRallyScale(d.rally));

      g.append('path')
        .datum(RALLY_BY_YEAR)
        .attr('d', rallyLine)
        .attr('fill', 'none')
        .attr('stroke', '#88C0D0')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6,3')
        .attr('opacity', 0.85);

      g.append('text')
        .attr('x', xScale(2025) + 6)
        .attr('y', yRallyScale(RALLY_BY_YEAR.at(-1).rally))
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#88C0D0')
        .attr('font-size', '11px')
        .attr('font-family', "'Barlow Condensed', sans-serif")
        .text('RALLY');
    }
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

<div class="chart-wrapper" aria-label="Line chart della velocità media di superficie per anno dal 1991 al 2025. Le tre superfici mantengono distanze stabili. Dal 2005 i rally si allungano su tutte le superfici.">
  <svg bind:this={svg} width={width} height={height}></svg>
</div>

<style>
  .chart-wrapper { width: 100%; height: 100%; display: flex; align-items: center; }
  svg { overflow: visible; }
</style>
