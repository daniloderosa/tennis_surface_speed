<script>
  import Scrolly from '$components/helpers/Scrolly.svelte';

  let {
    chartComponent,
    steps = [],
    activeStep = $bindable(undefined)
  } = $props();
</script>

<section class="scrolly-section">
  <div class="sticky-chart" style="will-change: transform;">
    {#if chartComponent}
      {@const Chart = chartComponent}
      <Chart {activeStep} />
    {/if}
  </div>

  <div class="steps-column">
    <Scrolly bind:value={activeStep}>
      {#each steps as step, i}
        <div class="step" class:active={activeStep === i}>
          <div class="step-card">
            <p>{step.text}</p>
            {#if step.subtext}<p class="subtext">{step.subtext}</p>{/if}
          </div>
        </div>
      {/each}
    </Scrolly>
  </div>
</section>

<style>
  .scrolly-section {
    position: relative;
    display: grid;
    grid-template-columns: 1fr var(--step-width);
    gap: 2rem;
    max-width: var(--chart-max-width);
    margin: 0 auto;
    padding: 0 2rem;
  }
  .sticky-chart {
    position: sticky;
    top: 10vh;
    height: 80vh;
    align-self: start;
  }
  .steps-column { padding: 50vh 0; }
  .step {
    min-height: var(--step-height);
    display: flex;
    align-items: center;
    padding: 1rem 0;
    opacity: 0.25;
    transition: opacity 0.3s ease;
  }
  .step.active { opacity: 1; }
  .step-card {
    background: var(--color-surface);
    border-left: 3px solid var(--color-primary);
    padding: 1.25rem 1.5rem;
    font-size: var(--text-step);
    line-height: var(--line-height-body);
  }
  .subtext {
    margin-top: 0.5rem;
    font-size: var(--text-label);
    color: var(--color-text-muted);
  }
  @media (max-width: 768px) {
    .scrolly-section { grid-template-columns: 1fr; }
    .sticky-chart { position: relative; top: 0; height: 50vh; }
  }
</style>
