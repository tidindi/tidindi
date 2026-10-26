// Nettstedskart for søkemotorer. Lages ved hver publisering (nettstedet bygges på nytt fra Sanity).
//   /sitemap-index.xml – oversikten Search Console og Bing leser
//   /sitemap-0.xml     – alle sider, med tidspunkt for siste endring (lastmod)
//   /news-sitemap.xml  – saker fra de siste 48 timene, i Google News-format
import { hentArtikler, artikkelUrl, type Artikkel } from './innhold';
import { seksjoner } from './seksjoner';

export const NETTSTED = 'https://tidindi.no';
const PUBLIKASJON = 'Tidindi';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const endret = (a: Artikkel) => a.oppdatert ?? a.publisert;
const nyest = (liste: Artikkel[]) => liste.map(endret).sort().at(-1);

export const xmlSvar = (xml: string) =>
  new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });

export function indeks(): string {
  const naa = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${NETTSTED}/sitemap-0.xml</loc><lastmod>${naa}</lastmod></sitemap>
  <sitemap><loc>${NETTSTED}/news-sitemap.xml</loc><lastmod>${naa}</lastmod></sitemap>
</sitemapindex>
`;
}

export async function alleSider(): Promise<string> {
  const artikler = await hentArtikler();
  const sider: { sti: string; lastmod?: string }[] = [
    { sti: '/', lastmod: nyest(artikler) },
    ...seksjoner.map((s) => ({ sti: `/${s.slug}/`, lastmod: nyest(artikler.filter((a) => a.seksjon === s.slug)) })),
    ...artikler.map((a) => ({ sti: artikkelUrl(a), lastmod: endret(a) })),
    { sti: '/morgenbrief/' }, { sti: '/varde/' },
    { sti: '/om/' }, { sti: '/redaksjonelle-prinsipper/' }, { sti: '/personvern/' },
  ];
  const linjer = sider.map((s) => `  <url><loc>${NETTSTED}${s.sti}</loc>${s.lastmod ? `<lastmod>${new Date(s.lastmod).toISOString()}</lastmod>` : ''}</url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${linjer.join('\n')}
</urlset>
`;
}

// Google News: bare saker publisert de siste 48 timene (Googles regel). Tom liste er gyldig.
export async function nyheter(): Promise<string> {
  const grense = Date.now() - 48 * 3600 * 1000;
  const artikler = (await hentArtikler()).filter((a) => new Date(a.publisert).getTime() >= grense);
  const linjer = artikler.map((a) => `  <url>
    <loc>${NETTSTED}${artikkelUrl(a)}</loc>
    <news:news>
      <news:publication><news:name>${PUBLIKASJON}</news:name><news:language>no</news:language></news:publication>
      <news:publication_date>${new Date(a.publisert).toISOString()}</news:publication_date>
      <news:title>${esc(a.tittel)}</news:title>
    </news:news>
  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${linjer.join('\n')}
</urlset>
`;
}
