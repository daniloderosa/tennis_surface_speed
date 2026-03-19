<script>
  // nessuno stato — componente statico
</script>

<section class="hero">
  <div class="hero-inner">
    <p class="kicker">Tennis · Superfici · Dati</p>
    <h1 class="title">Non tutte le<br>superfici sono<br>uguali</h1>
    <p class="subtitle">
      Nel tennis professionistico, il nome della superficie<br>
      conta meno di quanto pensi.
    </p>
    <p class="scroll-hint" aria-hidden="true">↓ Scorri per esplorare</p>
  </div>
</section>

<style>
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: var(--color-bg);
    position: relative;
  }

  .hero-inner {
    max-width: 680px;
    text-align: center;
  }

  .kicker {
    font-family: var(--font-mono);
    font-size: var(--text-label);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-primary);
    margin-bottom: 1.5rem;
  }

  .title {
    font-size: var(--text-hero);
    color: var(--color-text);
    margin-bottom: 1.5rem;
    line-height: 1.05;
  }

  .subtitle {
    font-size: 1.15rem;
    color: var(--color-text-muted);
    line-height: 1.7;
    margin-bottom: 3rem;
    font-family: var(--font-sans);
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
  }

  .scroll-hint {
    font-family: var(--font-mono);
    font-size: var(--text-label);
    color: var(--color-border);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: translateY(0); }
    50%       { opacity: 1;   transform: translateY(4px); }
  }
</style>
