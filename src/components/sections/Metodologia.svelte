<script>
  import { t } from '$lib/i18n.svelte.js';

  function renderBody(raw) {
    return raw
      .replace('Tennis Abstract (link1)', '<a href="https://www.tennisabstract.com" target="_blank" rel="noopener">Tennis Abstract</a>')
      .replace('Match Charting Project (link2)', '<a href="https://github.com/JeffSackmann/tennis_MatchChartingProject" target="_blank" rel="noopener">Match Charting Project</a>');
  }

  function paragraphs(raw) {
    return raw.split('\n\n').filter(p => p.trim()).map(p => renderBody(p.trim()));
  }
</script>

<section class="metodologia">
  <div class="inner">
    <h2 class="title">{t('metodo_title')}</h2>
    <div class="body">
      {#each paragraphs(t('metodo_body')) as para}
        <p>{@html para}</p>
      {/each}
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
      color: var(--color-highlight);
      text-decoration: underline;
      text-underline-offset: 3px;

      &:hover { color: var(--color-text); }
    }
  }
</style>
