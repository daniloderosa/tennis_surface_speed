<script>
  import { t } from '$lib/i18n.svelte.js';
</script>

<section class="metodologia">
  <div class="inner">
    <h2 class="title">{t('metodo_title')}</h2>
    <div class="body">
      <p>
        Fonti: <a href="https://www.tennisabstract.com" target="_blank" rel="noopener">Tennis Abstract</a>
        e il progetto <a href="https://github.com/JeffSackmann/tennis_MatchChartingProject" target="_blank" rel="noopener">Match Charting Project</a>
        di Jeff Sackmann sono stati il cuore di questo articolo. Il progetto MCP è gestito da volontari
        che registrano per ciascuna partita i dati relativi a punti, servizi, scambi. Essendo un progetto
        volontario, non tutte le partite sono mappate e questo si potrebbe rispecchiare nella mancanza di
        alcuni dati (per esempio sull'erba negli anni Novanta).
      </p>
      <p>Testi: Danilo De Rosa</p>
      <p>Codice: Danilo De Rosa, con il supporto di Claude Code.</p>
      <p>Si ringrazia Salvatore Tramontano per l'aiuto e i consigli.</p>
    </div>
  </div>
</section>

<style lang="scss">
  @use 'variables' as *;

  .metodologia {
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    margin-top: 6rem;
    padding: 5rem 2rem 6rem;
    transition: background 0.3s ease;
  }

  .inner {
    max-width: 720px;
    margin: 0 auto;
  }

  .title {
    font-family: $font-display;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text);
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .body {
    p {
      font-family: $font-sans;
      font-size: 0.95rem;
      line-height: 1.75;
      color: var(--color-text-muted);
      margin-bottom: 1rem;

      &:last-child { margin-bottom: 0; }
    }

    a {
      color: var(--color-primary);
      text-decoration: underline;
      text-underline-offset: 3px;

      &:hover { color: var(--color-text); }
    }
  }
</style>
