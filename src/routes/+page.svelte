<script>
  import Hero             from '$components/sections/Hero.svelte';
  import Outro            from '$components/sections/Outro.svelte';
  import ScrollySection   from '$components/sections/ScrollySection.svelte';
  import StripPlot        from '$components/charts/StripPlot.svelte';
  import RallyTrend from '$components/charts/RallyTrend.svelte';
  import ScatterRallySpeed from '$components/charts/ScatterRallySpeed.svelte';
  import AnimationSection from '$components/animations/AnimationSection.svelte';
  import SurfaceSpeedDotPlot from '$components/charts/SurfaceSpeedDotPlot.svelte';
  import SurfaceSpeedTrend   from '$components/charts/SurfaceSpeedTrend.svelte';

  let activeStepDot = $state(undefined);


  const stepsDot = [
    {
      text: 'Ogni cerchio è un torneo. Più a destra si trova il cerchio, più ace sono stati registrati rispetto al previsto.',
      subtext: 'Passa il mouse o clicca su un cerchio per conoscere il suo rating.'
    },
    {
      text: 'In alcuni casi le tre superfici si sovrappongono: alcuni tornei su terra sono più veloci di tornei sul cemento (la superficie più diffusa), mentre l\'erba è mediamente la più veloce.',
  
    }
  ];
</script>

<svelte:head>
  <title>Non tutte le superfici sono uguali — Tennis Surface Speed</title>
</svelte:head>

<Hero />

<AnimationSection />

<div class="bridge-text">
    <p>
    L'esistenza di superfici così diverse ha portato, nel corso dei decenni, allo sviluppo di giocatori specialisti
    su alcune superfici: c'era chi sapeva giocare bene "da fondo" e prediligeva la terra, e chi invece amava sfruttare
    la velocità dell'erba facendo serve&volley ad ogni punto. 
    <br><br>
    Negli ultimi 10-15 anni, però, nella comunità di appassionati si discute sempre più di una 'omologazione' delle superfici:
    i giocatori giocano tutti da fondo con molto topspin e il serve&volley è scomparso dal circuito (almeno fino a qualche anno fa), perché tanto le superfici sono tutte simili
    e quindi il modo di giocare può essere uno solo. È davvero così? 
    <br><br>
    Jeff Sackmann, creatore del sito TennisAbstract, ha ideato un modo per misurare la velocità dei diversi tornei: il Surface Speed Rating. Questo indice supera il problema 
    che, se avessimo due giocatori molto forti al servizio, a prescindere dalla superficie ci ritroveremmo con un numero di ace o servizi vincenti molto più alto del normale. 
        <br><br>
    Il surface speed rating funziona così: per ogni partita, il modello stima quanti ace il servitore avrebbe fatto su una superficie teoricamente neutra - la media del tour in quell'anno - 
    contro quel particolare avversario. Questo numero atteso tiene conto della qualità del servitore, della capacità di risposta del ricevitore, e di come entrambi si comportano storicamente.
Poi confronta l'atteso con gli ace realmente prodotti. Se Wimbledon genera più ace del previsto, il suo rating sale sopra 1. Se il Roland Garros ne genera meno, il suo rating scende sotto 1.
Il risultato è un numero indicizzato: 1 è la media del tour in quell'anno. Un rating di 1.25 significa che su quel campo vengono prodotti il 25% di ace in più del previsto; 0.75 significa il 25% in meno.

  </p>
</div>

<div class="section-wrapper dot-section">
  <div class="section-label">
    <span>A</span> La velocità dei tornei nel 2025
  </div>
  <ScrollySection
    chartComponent={SurfaceSpeedDotPlot}
    steps={stepsDot}
    bind:activeStep={activeStepDot}
    scrollyBottom={typeof window !== 'undefined' ? window.innerHeight * 0.85 : 0}
  />
</div>

<div class="bridge-text">
  <p>Proviamo ad allargare lo sguardo: per capire se le superfici si sono davvero avvicinate nel tempo, allarghiamo l'analisi agli ultimi trent'anni.</p>
</div>

<div class="section-wrapper">
  <div class="section-label">
    <span>B</span> Trent'anni di velocità
  </div>
  <div class="trend-wrapper">
    <SurfaceSpeedTrend />
  </div>
</div>

<div class="bridge-text">
  <p>Nel corso degli anni, le tre linee non convergono: l'erba e il cemento sono in modo costante più veloci della terra. L'ace rate,
    invece, mostra come si serve sempre meglio: se nei primi anni Novanta si faceva un ace circa ogni 20 punti, negli ultimi anni succede 
    ogni 13 punti. 
    <br><br>
    Ma la terra non si è velocizzata (continua a essere la solita superficie: un mix di mattoni e terracotta), sono cambiati i giocatori: 
    più forti fisicamente, più bravi tecnicamente e, soprattutto, con delle racchette che permettono di tirare più forte (e quindi di fare più ace). 
    <br><br>
    Quindi non è cambiato niente negli ultimi decenni, e il tennis è rimasto uguale? Ovviamente no, chiunque sia appassionato o apra YouTube 
    per vedere un video degli anni Novanta si accorgerà di come il gioco è mutato profondamente: più topspin, più scambi da fondo, colpi potenti 
    e movimenti degli atleti più rapidi. Una buona sintesi di tutto questo potrebbe essere la durata media degli scambi, che si è allungata 
    in modo costante per tutti questi motivi.  
  </p>
</div>

<div class="section-wrapper">
  <div class="section-label">
    <span>02</span> Cosa cambia davvero in campo?
  </div>
  <div class="trend-wrapper">
    <RallyTrend />
  </div>
</div>

<div class="bridge-text">
  <p>hard, terra, erba — le etichette restano.</p>
</div>

<div class="section-wrapper">
  <div class="section-label">
    <span>C</span> Velocità e durata degli scambi nel 2025
  </div>
  <div class="trend-wrapper scatter-wrapper">
    <ScatterRallySpeed />
  </div>
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
    margin: 0 auto;
    padding: 3rem 2rem 0;
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--color-text);
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
    height: 460px;
  }
</style>
