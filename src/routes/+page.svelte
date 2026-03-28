<script>
  import Hero             from '$components/sections/Hero.svelte';
  import Outro            from '$components/sections/Outro.svelte';
  import ScrollySection   from '$components/sections/ScrollySection.svelte';
  import StripPlot        from '$components/charts/StripPlot.svelte';
  import ScatterRallySpeed from '$components/charts/ScatterRallySpeed.svelte';
  import LineHistorical   from '$components/charts/LineHistorical.svelte';
  import AnimationSection from '$components/animations/AnimationSection.svelte';
  import SurfaceSpeedDotPlot from '$components/charts/SurfaceSpeedDotPlot.svelte';
  import SurfaceSpeedTrend   from '$components/charts/SurfaceSpeedTrend.svelte';

  let activeStepDot = $state(undefined);
  let activeStep2 = $state(undefined);
  let activeStep3 = $state(undefined);
  let activeStep4 = $state(undefined);

  const steps2 = [
    {
      text: 'Se la velocità conta, dovrebbe determinare la lunghezza dei rally: più lento = più colpi. Ogni punto è un torneo.',
      subtext: 'La correlazione c\'è — ma non è tutta la storia.'
    },
    {
      text: 'Gstaad è terra veloce con rally corti come se fosse erba. Paris Masters è hard lento con rally lunghi come Roland Garros.',
      subtext: 'La superficie dice dove sei. La velocità dice come giochi.'
    }
  ];

  const steps3 = [
    {
      text: 'Dal 1991 al 2025: le tre superfici mantengono distanze stabili. L\'erba rallenta leggermente, la terra accelera poco, l\'hard oscilla.',
      subtext: 'Le linee non convergono.'
    },
    {
      text: 'Il periodo 2005–2010 è spesso citato come momento di "convergenza". I dati mostrano variazioni, non rivoluzione.',
      subtext: 'La percezione ha amplificato il cambiamento.'
    },
    {
      text: 'I rally si allungano su tutte le superfici — in modo quasi identico. Non sono le superfici a cambiare: è il modo di giocare.',
      subtext: 'Giocatori più forti, più resistenti, più tattici su qualsiasi manto.'
    }
  ];

  const steps4 = [
    {
      text: 'La mappa reale dei tornei ATP: ogni torneo al suo posto, ordinato per velocità. Le eccezioni non sono errori — sono la regola.',
      subtext: 'Scorri i label per esplorare.'
    },
    {
      text: 'Perché tanta variazione? Altitudine (Gstaad a 1.000m), temperatura, marca delle palline, tipo di manto — ogni fattore contribuisce.',
      subtext: 'La categoria di superficie è un punto di partenza, non una destinazione.'
    }
  ];

  const stepsDot = [
    {
      text: 'Ogni punto è un torneo. Sull\'asse orizzontale, la velocità della superficie: più a destra, più ace vengono prodotti rispetto alla media.',
      subtext: 'Tutti insieme, per ora.'
    },
    {
      text: 'Separando i tornei per tipo di superficie, emerge subito qualcosa di inatteso: le tre categorie si sovrappongono. Alcuni tornei su terra sono più veloci di molti tornei su cemento.',
      subtext: 'La categoria di superficie è un punto di partenza, non una destinazione.'
    }
  ];
</script>

<svelte:head>
  <title>Non tutte le superfici sono uguali — Tennis Surface Speed</title>
</svelte:head>

<Hero />

<AnimationSection />

<div class="section-wrapper dot-section">
  <div class="section-label">
    <span>A</span> La velocità reale dei tornei
  </div>
  <ScrollySection
    chartComponent={SurfaceSpeedDotPlot}
    steps={stepsDot}
    bind:activeStep={activeStepDot}
    scrollyBottom={typeof window !== 'undefined' ? window.innerHeight * 0.85 : 0}
  />
</div>

<div class="bridge-text">
  <p>Ma questa è solo una fotografia del 2025. Per capire se le superfici si sono davvero avvicinate nel tempo, bisogna guardare indietro di trent'anni.</p>
</div>

<div class="section-wrapper">
  <div class="section-label">
    <span>B</span> Trent'anni di velocità
  </div>
  <div class="trend-wrapper">
    <SurfaceSpeedTrend />
  </div>
</div>

<div class="section-wrapper">
  <div class="section-label">
    <span>02</span> Cosa cambia davvero in campo?
  </div>
  <ScrollySection
    chartComponent={ScatterRallySpeed}
    steps={steps2}
    bind:activeStep={activeStep2}
  />
</div>

<div class="section-wrapper">
  <div class="section-label">
    <span>03</span> Com'è cambiato nel tempo?
  </div>
  <ScrollySection
    chartComponent={LineHistorical}
    steps={steps3}
    bind:activeStep={activeStep3}
  />
</div>

<div class="section-wrapper">
  <div class="section-label">
    <span>04</span> Oggi: la mappa reale dei tornei
  </div>
  <ScrollySection
    chartComponent={StripPlot}
    steps={steps4}
    bind:activeStep={activeStep4}
  />
</div>

<Outro />

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
    padding: 0.75rem 2rem;
    font-family: var(--font-mono);
    font-size: var(--text-label);
    color: var(--color-primary);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: baseline;
    gap: 1rem;
  }

  .section-label span {
    font-size: 2rem;
    font-family: var(--font-display);
    color: var(--color-border);
    line-height: 1;
  }

  .bridge-text {
    max-width: 640px;
    margin: 4rem auto;
    padding: 0 2rem;
    font-size: 1.1rem;
    line-height: var(--line-height-body);
    color: var(--color-text-muted);
    font-family: var(--font-serif);
    font-style: italic;
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
</style>
