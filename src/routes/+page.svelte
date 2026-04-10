<script>
  import { t } from '$lib/i18n.svelte.js';

  import Hero              from '$components/sections/Hero.svelte';
  import Metodologia       from '$components/sections/Metodologia.svelte';
  import ScrollySection    from '$components/sections/ScrollySection.svelte';
  import RallyTrend        from '$components/charts/RallyTrend.svelte';
  import ScatterRallySpeed from '$components/charts/ScatterRallySpeed.svelte';
  import AnimationSection  from '$components/animations/AnimationSection.svelte';
  import SurfaceSpeedDotPlot from '$components/charts/SurfaceSpeedDotPlot.svelte';
  import SurfaceSpeedTrend   from '$components/charts/SurfaceSpeedTrend.svelte';

  let activeStepDot = $state(undefined);

  const stepsDot = $derived([
    {
      text:    t('step_dot_0_text'),
      subtext: t('step_dot_0_subtext'),
    },
    {
      text: t('step_dot_1_text'),
    },
  ]);
</script>

<svelte:head>
  <title>{t('hero_title')} — Tennis Surface Speed</title>
</svelte:head>

<Hero />

<AnimationSection />

<div class="bridge-text">
  {#each t('bridge1').split('\n\n').filter(p => p.trim()) as para}
    <p>{para.trim()}</p>
  {/each}
</div>

<div class="section-wrapper dot-section">
  <div class="section-label">{t('section_speed')}</div>
  <ScrollySection
    chartComponent={SurfaceSpeedDotPlot}
    steps={stepsDot}
    bind:activeStep={activeStepDot}
    scrollyBottom={typeof window !== 'undefined' ? window.innerHeight * 0.85 : 0}
  />
</div>

<div class="bridge-text">
  {#each t('bridge2').split('\n\n').filter(p => p.trim()) as para}
    <p>{para.trim()}</p>
  {/each}
</div>

<div class="section-wrapper">
  <div class="section-label">{t('section_30years')}</div>
  <div class="trend-wrapper">
    <SurfaceSpeedTrend />
  </div>
</div>

<div class="bridge-text">
  {#each t('bridge3').split('\n\n').filter(p => p.trim()) as para}
    <p>{para.trim()}</p>
  {/each}
</div>

<div class="section-wrapper">
  <div class="section-label">{t('section_rally')}</div>
  <div class="trend-wrapper">
    <RallyTrend />
  </div>
</div>

<div class="bridge-text">
  {#each t('bridge4').split('\n\n').filter(p => p.trim()) as para}
    <p>{@html para.trim().replace(
      'Secondo Sackmann (link)',
      '<a href="https://www.tennisabstract.com/blog/2025/12/10/surface-speed-convergence-one-more-time/" target="_blank" rel="noopener">Secondo Sackmann</a>'
    )}</p>
  {/each}
</div>

<div class="section-wrapper">
  <div class="section-label">{t('section_scatter')}</div>
  <div class="trend-wrapper scatter-wrapper">
    <ScatterRallySpeed />
  </div>
</div>

<Metodologia />

<style>
  .section-wrapper {
    margin-top: var(--section-gap);
  }

  .section-label {
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
    background: var(--color-bg);
    max-width: var(--chart-max-width);
    margin: 0 auto;
    padding: 0.9rem 2rem;
    font-family: var(--font-mono);
    font-size: 1rem;
    color: var(--color-highlight);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--color-border);
    transition: background 0.3s ease;
  }

  .bridge-text {
    max-width: 640px;
    margin: 0 auto;
    padding: 3rem 2rem 0;
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--color-text);
  }

  .bridge-text p {
    margin-bottom: 1.4em;
  }

  .bridge-text p:last-child {
    margin-bottom: 0;
  }

  .bridge-text a {
    color: var(--color-highlight);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /* Override spaziature solo per la sezione dot plot */
  .dot-section :global(.scrolly-section) { padding-top: 13vh; padding-bottom: 10vh; }
  .dot-section :global(.sticky-chart)    { top: 20vh; height: 60vh; }
  .dot-section :global(.steps-overlay)   { margin-top: -55vh; padding-top: 0; padding-bottom: 85vh; }
  .dot-section :global(.step)            { align-items: flex-end; padding-bottom: 0; min-height: 100vh; }

  .trend-wrapper {
    max-width: var(--chart-max-width);
    margin: 0 auto;
    padding: 2rem 2rem 4rem;
  }

  .scatter-wrapper {
    height: 552px;
  }

  @media (max-width: 768px) {
    .trend-wrapper {
      padding: 1rem 0.25rem 2rem;
    }
    .scatter-wrapper {
      height: 380px;
    }
    .bridge-text {
      padding: 2rem 1rem 0;
    }
    .section-label {
      padding: 0.9rem 1rem;
    }
  }
</style>
