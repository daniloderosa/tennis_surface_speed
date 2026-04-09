<script>
  let dark = $state(false);
  let visible = $state(true);

  $effect(() => {
    if (typeof window === 'undefined') return;
    function onScroll() { visible = window.scrollY < 80; }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  function toggle() {
    dark = !dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
</script>

<div class="theme-toggle" class:hidden={!visible} role="group" aria-label="Tema">
  <button
    class:active={!dark}
    onclick={() => { if (dark) toggle(); }}
    aria-label="Modalità chiara"
    title="Modalità chiara"
  >
    <!-- Sole -->
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
    </svg>
  </button>
  <button
    class:active={dark}
    onclick={() => { if (!dark) toggle(); }}
    aria-label="Modalità scura"
    title="Modalità scura"
  >
    <!-- Luna -->
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</div>

<style lang="scss">
  .theme-toggle {
    position: fixed;
    top: 1.25rem;
    right: 1.5rem;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 50em;
    overflow: hidden;
    transition: opacity 0.3s ease, transform 0.3s ease;

    &.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(-8px);
    }
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--color-text-faint);
    transition: background 0.2s, color 0.2s;

    &:hover {
      color: var(--color-text);
    }

    &.active {
      background: var(--color-surface-2);
      color: var(--color-text);
    }

    svg {
      width: 1rem;
      height: 1rem;
    }
  }
</style>
