// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tidindi.no',
  integrations: [
    sitemap({
      // Morgenbrief-siden ligger som statisk fil og skal også med
      customPages: ['https://tidindi.no/morgenbrief/'],
    }),
  ],
  build: { format: 'directory' },
});
