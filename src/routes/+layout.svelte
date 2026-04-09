<script>
  import '$lib/styles/app.scss';
  import ThemeToggle from '$components/ui/ThemeToggle.svelte';
  import BackToTop from '$components/ui/BackToTop.svelte';
  let { children } = $props();
</script>

<ThemeToggle />
<BackToTop />
{@render children()}
