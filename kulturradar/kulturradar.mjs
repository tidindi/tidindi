// KULTURRADAR – henter de siste artiklene fra internasjonale kultur-, mote-, musikk-, film- og designmagasiner.
// Leses av Claudes daglige idérunde («Tips til saker») som GitHub-merknader. Sender ingenting og publiserer ingenting.
//
// Bruk: node kulturradar/kulturradar.mjs <gruppe>   (musikk | mote | film | kunst; uten gruppe: alle)
//
// Miljøvariabler:
//   VINDU_TIMER  – hvor mange timer bakover artikler tas med (standard 48)
//   MAKS_TEGN    – største lengde på én merknad (standard 3500)
//
// GitHub tillater bare om lag ti merknader per steg, så hver gruppe kjøres i eget steg,
// og artiklene pakkes i noen få lange merknader. Hele listen står også i loggen.

import { kilder, grupper } from './kilder.mjs';

const env = process.env;
const gruppeId = process.argv[2];
const vinduTimer = Number(env.VINDU_TIMER) || 48;
const maksTegn = Number(env.MAKS_TEGN) || 3800;
const fra = new Date(Date.now() - vinduTimer * 3600 * 1000);

// ---------- Henting og tolking av RSS/Atom (samme metode som tipsstrømmen) ----------

const dekod = (s = '') =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

const rens = (s = '') => dekod(dekod(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function felt(blokk, ...navn) {
  for (const n of navn) {
    const m = blokk.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, 'i'));
    if (m && m[1].trim()) return m[1].trim();
  }
  return '';
}

function lenke(blokk) {
  const atom = blokk.match(/<link[^>]*href="([^"]+)"[^>]*\/?>(?:<\/link>)?/i);
  const rss = felt(blokk, 'link');
  return dekod(rss || atom?.[1] || felt(blokk, 'guid')).trim();
}

function tolk(xml) {
  const blokker = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map((m) => m[2]);
  return blokker.map((b) => {
    const dato = felt(b, 'pubDate', 'published', 'updated', 'dc:date', 'dc:created');
    return {
      tittel: rens(felt(b, 'title')),
      lenke: lenke(b),
      dato: dato ? new Date(rens(dato)) : null,
      ingress: rens(felt(b, 'description', 'summary', 'content:encoded', 'content')).slice(0, 160),
    };
  }).filter((x) => x.tittel && x.lenke);
}

async function hent(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'TidindiKulturradar/1.0 (+https://tidindi.no)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5' } });
    if (!r.ok) return { feil: `HTTP ${r.status}` };
    const tekst = await r.text();
    if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(tekst)) return { feil: 'ikke RSS/Atom' };
    return { saker: tolk(tekst) };
  } catch (e) {
    return { feil: e.name === 'AbortError' ? 'tidsavbrudd' : String(e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

async function hentKilde(k) {
  const forsok = [];
  for (const url of k.urls) {
    const svar = await hent(url);
    if (svar.saker) return { ...k, url, saker: svar.saker };
    forsok.push(svar.feil);
  }
  return { ...k, feil: forsok };
}

// ---------- Utvalg og utskrift ----------

const dato = (d) => (d && !isNaN(d) ? d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : 'uten dato');
// Tegn som må kodes i GitHubs arbeidsflytkommandoer.
const kod = (s) => s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
// Egenskaper (som title) må i tillegg kode komma og kolon.
const kodTittel = (s) => kod(s).replace(/:/g, '%3A').replace(/,/g, '%2C');

const valgte = grupper.filter((g) => !gruppeId || g.id === gruppeId);
if (!valgte.length) { console.error(`Ukjent gruppe: ${gruppeId}`); process.exit(1); }

for (const g of valgte) {
  const resultater = await Promise.all(kilder.filter((k) => k.gruppe === g.id).map(hentKilde));
  const status = [];
  const blokker = [];
  let antall = 0;
  const sett = new Set();

  for (const r of resultater) {
    if (r.feil) { status.push(`✗ ${r.navn} (${r.feil.join(' / ')})`); continue; }
    const nye = r.saker
      .filter((s, i) => (s.dato && !isNaN(s.dato) ? s.dato >= fra : i < 8))
      .sort((a, b) => (b.dato?.getTime() || 0) - (a.dato?.getTime() || 0))
      .filter((s) => { const n = s.lenke.split('?')[0]; if (sett.has(n)) return false; sett.add(n); return true; })
      .slice(0, r.maks ?? 10);
    status.push(`✓ ${r.navn}: ${nye.length} nye av ${r.saker.length}`);
    if (!nye.length) continue;
    antall += nye.length;
    blokker.push(`== ${r.navn} ==\n` + nye.map((s) => `* ${s.tittel} [${dato(s.dato)}]\n  ${s.lenke}${s.ingress ? `\n  ${s.ingress}` : ''}`).join('\n'));
  }

  // Loggen får alt.
  console.log(`\n##### ${g.navn}: ${antall} artikler siste ${vinduTimer} t\n${status.join('\n')}\n\n${blokker.join('\n\n')}`);

  if (!env.GITHUB_ACTIONS) continue;

  // Merknadene: én med status, så artiklene pakket i biter på høyst maksTegn tegn (høyst ni biter).
  console.log(`::notice title=${kodTittel(`Kulturradar ${g.navn} – status`)}::${kod(`${antall} artikler siste ${vinduTimer} t\n${status.join('\n')}`)}`);
  const biter = [];
  let bit = '';
  for (const b of blokker) {
    for (const linje of b.split('\n')) {
      if (bit.length + linje.length + 1 > maksTegn) { biter.push(bit); bit = ''; }
      bit += (bit ? '\n' : '') + linje;
    }
    bit += '\n';
  }
  if (bit.trim()) biter.push(bit);
  const vist = biter.slice(0, 9);
  vist.forEach((t, i) => console.log(`::notice title=${kodTittel(`Kulturradar ${g.navn} ${i + 1}/${vist.length}`)}::${kod(t.trim())}`));
  if (biter.length > vist.length) console.log(`::warning title=${kodTittel(`Kulturradar ${g.navn}`)}::${biter.length - vist.length} biter fikk ikke plass i merknadene (se loggen).`);
}
