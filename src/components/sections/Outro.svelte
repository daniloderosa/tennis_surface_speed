<script>
  import { t } from '$lib/i18n.svelte.js';
</script>

<section class="outro">
  <div class="outro-inner">
    <h2>{t('outro_title')}</h2>
    <p>{t('outro_p1')}</p>
    <p>{t('outro_p2')}</p>
    <p class="byline">
      {t('outro_data')}:
      <a href="https://www.tennisabstract.com" target="_blank" rel="noopener">Tennis Abstract</a>
      · <a href="https://github.com/JeffSackmann/tennis_atp" target="_blank" rel="noopener">tennis_atp</a>
      · <a href="https://github.com/JeffSackmann/tennis_MatchChartingProject" target="_blank" rel="noopener">Match Charting Project</a>
      — Jeff Sackmann
    </p>
  </div>
</section>

<style>
  .outro {
    max-width: 680px;
    margin: 0 auto;
    padding: 8rem 2rem 6rem;
  }

  h2 {
    font-size: var(--text-section-title);
    color: var(--color-text);
    margin-bottom: 2rem;
  }

  p {
    font-size: 1.05rem;
    color: var(--color-text);
    line-height: var(--line-height-body);
    margin-bottom: 1.25rem;
    font-family: var(--font-sans);
    text-transform: none;
    letter-spacing: 0;
    font-weight: 400;
  }

  .byline {
    margin-top: 3rem;
    font-family: var(--font-mono);
    font-size: var(--text-label);
    color: var(--color-border);
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
  }

  a:hover { text-decoration: underline; }
</style>
