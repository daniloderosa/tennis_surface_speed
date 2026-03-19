import adapterStatic from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  compilerOptions: { runes: true },
  preprocess: sveltePreprocess({
    scss: {
      includePaths: [resolve(__dirname, 'src/lib/styles')]
    }
  }),
  kit: {
    adapter: adapterStatic({ strict: false }),
    paths: {
      base: process.env.BASE_PATH ?? ''
    },
    alias: {
      '$components': './src/components',
      '$data':       './src/lib/data',
      '$styles':     './src/lib/styles',
      '$utils':      './src/lib/utils'
    }
  }
};
