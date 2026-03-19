<script>
  // nessuno stato — componente statico
</script>

<section class="hero">
  <div class="hero-inner">
    <h1 class="title">Non tutte le superfici sono uguali</h1>
    <div class="rule" aria-hidden="true"></div>
    <p class="subtitle">
      Nel tennis professionistico, il nome della superficie
      conta meno di quanto pensi.
    </p>
    <p class="pub-date">19 marzo 2026</p>
  </div>
</section>

<style lang="scss">
  @use 'variables' as *;
  @use 'mixins' as *;

  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background-color: $color-bg;
  }

  .hero-inner {
    max-width: 680px;
    width: 100%;
  }

  .title {
    font-family: $font-display;
    font-size: $text-hero;
    font-weight: 700;
    color: $color-text;
    line-height: 1.05;
    text-transform: uppercase;
    letter-spacing: 0.01em;
    margin-bottom: 1rem;
  }

  .rule {
    width: 3rem;
    height: 3px;
    background-color: $color-primary;
    margin-bottom: 1.25rem;
  }

  .subtitle {
    font-family: $font-sans;
    font-size: 1.15rem;
    font-weight: 400;
    color: $color-text-muted;
    line-height: 1.7;
    text-transform: none;
    letter-spacing: 0;
    margin-bottom: 1rem;
  }

  .pub-date {
    font-family: $font-mono;
    font-size: $text-label;
    color: $color-border;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
</style>
