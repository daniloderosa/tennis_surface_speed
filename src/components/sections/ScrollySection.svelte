<script>
  import Scrolly from '$components/helpers/Scrolly.svelte';

  let {
    chartComponent,
    steps = [],
    activeStep = $bindable(undefined),
    scrollyBottom = 0
  } = $props();
</script>

<section class="scrolly-section">
  <!-- Grafico: sticky, full-width, rimane visibile mentre si scorre -->
  <div class="sticky-chart" style="will-change: transform;">
    {#if chartComponent}
      {@const Chart = chartComponent}
      <Chart {activeStep} />
    {/if}
  </div>

  <!-- Step: scorrono sopra il grafico, centrati, più stretti del grafico -->
  <div class="steps-overlay">
    <Scrolly bind:value={activeStep} bottom={scrollyBottom}>
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

<style lang="scss">
  @use 'variables' as *;
  @use 'mixins' as *;

  .scrolly-section {
    position: relative;
    max-width: $chart-max-width;
    margin: 0 auto;
    padding: 2rem 2rem 0;
  }

  // Grafico: sticky, centrato verticalmente nel viewport
  .sticky-chart {
    position: sticky;
    top: 0;
    height: 100vh;
    width: 100%;
    z-index: 0;
    display: flex;
    align-items: center;
  }

  // Step: si sovrappongono al grafico con margin-top negativo
  .steps-overlay {
    position: relative;
    margin-top: -75vh;
    z-index: $z-overlay;
    padding: 10vh 0 20vh;
    pointer-events: none;
  }

  .step {
    min-height: $step-height;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    opacity: 0.15;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .step.active {
    opacity: 1;
  }

  .step-card {
    max-width: 520px;
    width: 100%;
    background: rgba($color-surface, 0.92);
    border-left: 3px solid $color-primary;
    padding: 1.25rem 1.5rem;
    font-size: $text-step;
    line-height: $line-height-body;
    pointer-events: all;
    backdrop-filter: blur(4px);
  }

  .subtext {
    margin-top: 0.5rem;
    font-size: $text-label;
    color: $color-text-muted;
  }

  @include mobile {
    .sticky-chart {
      position: sticky;
      top: 0;
      height: 45vh;
      align-items: center;
    }

    .steps-overlay {
      margin-top: -40vh;
      padding: 0 0 20vh;
    }

    .step {
      min-height: 80vh;
      align-items: flex-end;
      padding-bottom: 2rem;
    }
  }
</style>
