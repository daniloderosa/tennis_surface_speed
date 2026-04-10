<script>
  import { getLang, setLang } from '$lib/i18n.svelte.js';

  let open    = $state(false);
  let visible = $state(true);
  let btnEl;

  $effect(() => {
    if (typeof window === 'undefined') return;
    function onScroll() { visible = window.scrollY < 80; }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  $effect(() => {
    if (!open) return;
    function onOutside(e) {
      if (btnEl && !btnEl.contains(e.target)) open = false;
    }
    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  });

  const FLAG = { it: '🇮🇹', en: '🇺🇸' };
</script>

<div class="lang-control" class:hidden={!visible} bind:this={btnEl}>
  <button class="trigger" onclick={() => open = !open} aria-label="Lingua / Language">
    <span class="flag">{FLAG[getLang()]}</span>
    <svg class="caret" class:rotated={open} viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  {#if open}
    <div class="dropdown" role="menu">
      <button
        class="item" class:active={getLang() === 'it'}
        onclick={() => { setLang('it'); open = false; }}
        role="menuitem"
      >
        <span>🇮🇹</span> Italiano
      </button>
      <button
        class="item" class:active={getLang() === 'en'}
        onclick={() => { setLang('en'); open = false; }}
        role="menuitem"
      >
        <span>🇺🇸</span> English
      </button>
    </div>
  {/if}
</div>

<style lang="scss">
  .lang-control {
    position: fixed;
    top: 1.25rem;
    right: 5.5rem;   /* lascia spazio al ThemeToggle sulla destra */
    z-index: 100;
    transition: opacity 0.3s ease, transform 0.3s ease;

    &.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(-8px);
    }
  }

  .trigger {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.4rem 0.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 50em;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 1rem;
    transition: background 0.2s, color 0.2s;

    &:hover { background: var(--color-surface-2); color: var(--color-text); }
  }

  .flag { font-size: 1.1rem; line-height: 1; }

  .caret {
    width: 14px;
    height: 14px;
    transition: transform 0.2s ease;
    &.rotated { transform: rotate(180deg); }
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 160px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.5rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }

  .group-label {
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-faint);
    padding: 0.3rem 0.5rem 0.2rem;
    font-family: var(--font-mono);
  }

  .item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.45rem 0.65rem;
    border: none;
    border-radius: 5px;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    font-family: var(--font-sans);
    text-align: left;
    transition: background 0.15s, color 0.15s;

    &:hover { background: var(--color-surface-2); color: var(--color-text); }
    &.active { color: var(--color-text); font-weight: 500; }

    svg { width: 14px; height: 14px; flex-shrink: 0; }
  }

  .sep {
    height: 1px;
    background: var(--color-border);
    margin: 0.4rem 0;
  }
</style>
