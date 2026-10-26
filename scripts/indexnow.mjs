// IndexNow: varsler Bing (og andre søkemotorer som bruker IndexNow, f.eks. DuckDuckGo, Yandex, Seznam)
// om nye og endrede sider rett etter hver publisering. Kjøres til slutt i byggesteget på Vercel.
// Nøkkelen er offentlig etter protokollen: den ligger som fil på https://tidindi.no/<nøkkel>.txt.
// Feiler noe, logges det – bygget stoppes aldri.
import { readFileSync } from 'node:fs';

const NOKKEL = '1871b00f54495a2d0325bf988b718739';
const NETTSTED = 'https://tidindi.no';
const VINDU_TIMER = 2; // sider endret de siste to timene sendes

if (process.env.VERCEL_ENV !== 'production') {
  console.log('[indexnow] Ikke produksjon – ingenting sendt.');
  process.exit(0);
}

try {
  const xml = readFileSync('dist/sitemap-0.xml', 'utf8');
  const grense = Date.now() - VINDU_TIMER * 3600 * 1000;
  const sider = [...xml.matchAll(/<loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)]
    .filter(([, , lastmod]) => lastmod && new Date(lastmod).getTime() >= grense)
    .map(([, loc]) => loc);
  if (!sider.length) {
    console.log('[indexnow] Ingen nye eller endrede sider – ingenting sendt.');
    process.exit(0);
  }
  const svar = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: 'tidindi.no', key: NOKKEL, keyLocation: `${NETTSTED}/${NOKKEL}.txt`, urlList: sider }),
    signal: AbortSignal.timeout(15000),
  });
  console.log(`[indexnow] Sendte ${sider.length} adresse(r), svar HTTP ${svar.status}: ${sider.join(', ')}`);
} catch (e) {
  console.log(`[indexnow] Feil (bygget fortsetter): ${e?.message ?? e}`);
}
