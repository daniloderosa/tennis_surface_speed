<script>
  let {
    root = null,
    top = 0,
    bottom = 0,
    increments = 100,
    value = $bindable(undefined),
    children
  } = $props();

  let steps = [];
  let threshold = [];
  let nodes = [];
  let observers = [];
  let container;

  function mostInView() {
    let maxRatio = 0, maxIndex = 0;
    for (let i = 0; i < steps.length; i++) {
      if (steps[i] > maxRatio) { maxRatio = steps[i]; maxIndex = i; }
    }
    value = maxRatio > 0 ? maxIndex : undefined;
  }

  function createObserver(node, index) {
    const marginTop    = top    ? top    * -1 : 0;
    const marginBottom = bottom ? bottom * -1 : 0;
    const options = { root, rootMargin: `${marginTop}px 0px ${marginBottom}px 0px`, threshold };
    if (observers[index]) observers[index].disconnect();
    const io = new IntersectionObserver((e) => {
      steps[index] = e[0].intersectionRatio;
      mostInView();
    }, options);
    io.observe(node);
    observers[index] = io;
  }

  function update() {
    if (!nodes.length) return;
    nodes.forEach(createObserver);
  }

  $effect(() => {
    for (let i = 0; i <= increments; i++) threshold.push(i / increments);
    nodes = Array.from(container.querySelectorAll(':scope > *:not(iframe)'));
    update();
  });

  $effect(() => { top; bottom; update(); });
</script>

<div bind:this={container}>
  {@render children?.()}
</div>
