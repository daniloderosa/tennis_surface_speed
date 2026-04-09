<script>
  let visible = $state(false);

  $effect(() => {
    if (typeof window === 'undefined') return;
    function onScroll() { visible = window.scrollY > 80; }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<button
  class="back-to-top"
  class:visible
  onclick={scrollToTop}
  aria-label="Torna in cima"
  title="Torna in cima"
>
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</button>

<style lang="scss">
  .back-to-top {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 100;
    width: 2.4rem;
    height: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 50%;
    cursor: pointer;
    color: var(--color-text-muted);
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s, color 0.2s;

    &.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }

    &:hover {
      color: var(--color-text);
      background: var(--color-surface-2);
    }

    svg {
      width: 1.1rem;
      height: 1.1rem;
    }
  }
</style>
