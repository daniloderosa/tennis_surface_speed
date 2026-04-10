<script>
  import { getLang, setLang } from '$lib/i18n.svelte.js';

  let dark    = $state(false);
  let open    = $state(false);
  let visible = $state(true);
  let wrapEl;

  $effect(() => {
    if (typeof window === 'undefined') return;
    function onScroll() { visible = window.scrollY < 80; }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  $effect(() => {
    if (!open) return;
    function onOutside(e) {
      if (wrapEl && !wrapEl.contains(e.target)) open = false;
    }
    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  });

  function toggleTheme() {
    dark = !dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  const FLAG = { it: '🇮🇹', en: '🇺🇸' };
</script>

<div class="topbar" class:hidden={!visible} bind:this={wrapEl}>

  <!-- Dropdown lingua -->
  <div class="lang-wrap">
    <button
      class="pill-btn lang-trigger"
      onclick={() => open = !open}
      aria-label="Lingua / Language"
    >
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

  <!-- Toggle tema -->
  <div class="pill theme-pill" role="group" aria-label="Tema">
    <button
      class:active={!dark}
      onclick={() => { if (dark) toggleTheme(); }}
      aria-label="Modalità chiara"
      title="Modalità chiara"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
    </button>
    <button
      class:active={dark}
      onclick={() => { if (!dark) toggleTheme(); }}
      aria-label="Modalità scura"
      title="Modalità scura"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>

</div>

<style lang="scss">
  /* Dimensione condivisa */
  $h: 2.2rem;

  .topbar {
    position: fixed;
    top: 1.25rem;
    right: 1.5rem;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: opacity 0.3s ease, transform 0.3s ease;

    &.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(-8px);
    }
  }

  /* ── Dropdown lingua ──────────────────────────── */
  .lang-wrap { position: relative; }

  .lang-trigger {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    height: $h;
    padding: 0 0.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 50em;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    transition: background 0.2s, color 0.2s;

    &:hover { background: var(--color-surface-2); color: var(--color-text); }
  }

  .flag { font-size: 1.05rem; line-height: 1; }

  .caret {
    width: 13px;
    height: 13px;
    transition: transform 0.2s ease;
    &.rotated { transform: rotate(180deg); }
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 0.4rem);
    right: 0;
    min-width: 140px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.35rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }

  .item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    height: $h;
    padding: 0 0.65rem;
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
  }

  /* ── Toggle tema ──────────────────────────────── */
  .theme-pill {
    display: flex;
    align-items: center;
    height: $h;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 50em;
    overflow: hidden;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: $h;
      height: $h;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--color-text-faint);
      transition: background 0.2s, color 0.2s;

      &:hover { color: var(--color-text); }
      &.active { background: var(--color-surface-2); color: var(--color-text); }

      svg { width: 1rem; height: 1rem; }
    }
  }
</style>
