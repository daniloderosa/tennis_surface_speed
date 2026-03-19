import adapterStatic from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';

export default {
  compilerOptions: { runes: true },
  preprocess: sveltePreprocess({ postcss: { plugins: [autoprefixer] } }),
  kit: {
    adapter: adapterStatic({ strict: false }),
    paths: {
      base: '/tennis_surface_speed'
    },
    alias: {
      '$components': './src/components',
      '$data':       './src/lib/data',
      '$styles':     './src/lib/styles',
      '$utils':      './src/lib/utils'
    }
  }
};
