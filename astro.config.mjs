import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://lastagous.com',
  base: '/discARd',
  output: 'static',
  integrations: [
    svelte(),
    tailwind({ applyBaseStyles: false }),
  ],
  build: {
    assets: 'assets',
  },
});
