<script>
  let scrolled = $state(false);

  $effect(() => {
    if (typeof window === 'undefined') return;
    function onScroll() {
      if (window.scrollY > 40) {
        scrolled = true;
        window.removeEventListener('scroll', onScroll);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<section class="hero">
  <div class="hero-inner">
    <h1 class="title">Non tutte le superfici sono uguali</h1>
    <div class="rule" aria-hidden="true"></div>
    <p class="subtitle">
      Nel tennis professionistico, il nome della superficie
      conta meno di quanto pensi.
    </p>
    <p class="pub-date">Marzo 2026</p>
  </div>

  <div class="scroll-hint" class:hidden={scrolled} aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>Scorri</span>
  </div>
</section>

<style lang="scss">
  @use 'variables' as *;
  @use 'mixins' as *;

  .hero {
    position: relative;
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
    line-height: 1.1;
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
    color: $color-text-faint;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .scroll-hint {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    color: $color-text-muted;
    font-family: $font-mono;
    font-size: $text-label;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    animation: bounce 2s ease-in-out infinite;
    transition: opacity 400ms ease;
    pointer-events: none;

    svg {
      width: 20px;
      height: 20px;
    }

    &.hidden {
      opacity: 0;
      animation-play-state: paused;
    }
  }

  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
    50%       { transform: translateX(-50%) translateY(8px); opacity: 0.5; }
  }
</style>
