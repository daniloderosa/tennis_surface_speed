<script>
  import '$lib/styles/app.scss';
  import Topbar    from '$components/ui/Topbar.svelte';
  import BackToTop from '$components/ui/BackToTop.svelte';
  let { children } = $props();
</script>

<Topbar />
<BackToTop />
{@render children()}
