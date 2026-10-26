// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tidindi.no',
  // Nettstedskartene lages i src/pages/sitemap-index.xml.ts, sitemap-0.xml.ts og news-sitemap.xml.ts
  // (med tidspunkt for siste endring og Google News-kart).
  build: { format: 'directory' },
});
