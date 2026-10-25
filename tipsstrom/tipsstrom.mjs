// TIPSSTRØM – henter nye meldinger fra åpne kilder og sender en oversikt på e-post til redaksjonen.
// Kjøres av GitHub Actions kl. 06 og 12 norsk tid. Publiserer ingenting på nettstedet.
//
// Miljøvariabler:
//   RESEND_API_KEY  – nøkkel til Resend (GitHub-hemmelighet). Uten nøkkel sendes ingenting.
//   SALO_KUNDER     – kommaseparert liste med navn som skal holdes utenfor (GitHub-hemmelighet, ikke i koden).
//   TIPS_TIL        – mottaker (standard kontakt@tidindi.no)
//   TIPS_FRA        – avsender (standard «Tidindi tipsstrøm <onboarding@resend.dev>»)
//   TIDSSJEKK=1     – kjør bare hvis klokken i Oslo er 06 eller 12 (planlagte kjøringer, håndterer sommertid)
//   TEST=1          – sjekk kildene og lag e-posten, men ikke send. Skriver tipsstrom.html.
//   VINDU_TIMER     – overstyrer hvor mange timer bakover meldinger hentes

import { writeFileSync } from 'node:fs';
import { kilder, grupper } from './kilder.mjs';

const TZ = 'Europe/Oslo';
const env = process.env;
const naa = new Date();
const osloTime = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: TZ }).format(naa));

if (env.TIDSSJEKK === '1' && osloTime !== 6 && osloTime !== 12) {
  console.log(`Klokken er ${osloTime} i Oslo – ikke tidspunkt for tipsstrøm. Avslutter.`);
  process.exit(0);
}

// Morgenutgaven dekker tiden siden forrige middag (18 t), middagsutgaven siden morgenen (6 t).
const vinduTimer = Number(env.VINDU_TIMER) || (osloTime < 9 ? 18 : 6);
const fra = new Date(naa.getTime() - vinduTimer * 3600 * 1000);

// ---------- Henting og tolking av RSS/Atom ----------

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
      ingress: rens(felt(b, 'description', 'summary', 'content:encoded', 'content')).slice(0, 260),
    };
  }).filter((x) => x.tittel && x.lenke);
}

async function hent(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'TidindiTipsstrom/1.0 (+https://tidindi.no)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5' } });
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
    forsok.push(`${url} → ${svar.feil}`);
  }
  return { ...k, feil: forsok };
}

// ---------- Utvalg ----------

const kunder = (env.SALO_KUNDER || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const erKunde = (s) => kunder.length > 0 && kunder.some((k) => (s.tittel + ' ' + s.ingress).toLowerCase().includes(k));

const resultater = await Promise.all(kilder.map(hentKilde));
const sett = new Set();
let utelatt = 0;
const perGruppe = new Map(grupper.map((g) => [g.id, []]));
const feilet = [];

for (const r of resultater) {
  if (r.feil) { feilet.push(r); continue; }
  const nye = r.saker
    .filter((s) => !s.dato || isNaN(s.dato) || s.dato >= fra) // uten dato: ta med
    .filter((s) => !s.dato || isNaN(s.dato) ? r.saker.indexOf(s) < 10 : true)
    .filter((s) => {
      const nokkel = s.lenke.split('?')[0] || s.tittel;
      if (sett.has(nokkel)) return false;
      sett.add(nokkel);
      return true;
    })
    .filter((s) => { if (erKunde(s)) { utelatt++; return false; } return true; })
    .sort((a, b) => (b.dato?.getTime() || 0) - (a.dato?.getTime() || 0))
    .slice(0, r.maks ?? 12);
  if (nye.length) perGruppe.get(r.gruppe).push({ kilde: r.navn, saker: nye });
}

const antall = [...perGruppe.values()].flat().reduce((n, k) => n + k.saker.length, 0);

// ---------- E-posten ----------

const esc = (s = '') => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const kl = (d) => (d && !isNaN(d) ? new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(d) : '');
const datoTekst = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(naa);
const utgave = osloTime < 9 ? 'morgen' : 'middag';
const emne = `Tidindi tipsstrøm – ${datoTekst}, ${utgave} (${antall} meldinger)`;

const ETIKETT = "font-family:'Barlow Condensed','Arial Narrow',Arial,sans-serif;text-transform:uppercase;letter-spacing:.12em;";
let html = `<!doctype html><html lang="nb"><body style="margin:0;background:#F5F4EF;color:#1C1E20;font-family:Georgia,'Source Serif 4',serif;">
<div style="max-width:680px;margin:0 auto;">
<div style="background:#1C1E20;color:#F5F4EF;padding:20px 24px;">
  <div style="${ETIKETT}font-size:13px;color:#A9ADB3;">Tidindi tipsstrøm · ${esc(datoTekst)} · ${utgave}</div>
  <div style="font-size:22px;margin-top:6px;">${antall} nye meldinger siste ${vinduTimer} timer</div>
</div>
<div style="padding:8px 24px 24px;">`;
let tekst = `${emne}\n\n`;

for (const g of grupper) {
  const blokker = perGruppe.get(g.id);
  if (!blokker.length) continue;
  html += `<h2 style="${ETIKETT}font-size:15px;margin:28px 0 4px;padding-top:12px;border-top:3px solid #1C1E20;">${esc(g.navn)}</h2>`;
  tekst += `\n== ${g.navn} ==\n`;
  for (const b of blokker) {
    html += `<div style="${ETIKETT}font-size:12px;color:#5C616A;margin:16px 0 4px;">${esc(b.kilde)}</div>`;
    tekst += `\n-- ${b.kilde} --\n`;
    for (const s of b.saker) {
      html += `<div style="padding:10px 0;border-bottom:1px solid #D3D5D8;">
  <a href="${esc(s.lenke)}" style="color:#1C1E20;font-size:17px;font-weight:bold;text-decoration:none;">${esc(s.tittel)}</a>
  ${s.dato && !isNaN(s.dato) ? `<span style="${ETIKETT}font-size:11px;color:#5C616A;"> · ${esc(kl(s.dato))}</span>` : ''}
  ${s.ingress ? `<div style="font-size:14px;line-height:1.45;color:#2A2A28;margin-top:4px;">${esc(s.ingress)}${s.ingress.length >= 260 ? '…' : ''}</div>` : ''}
</div>`;
      tekst += `* ${s.tittel}${s.dato && !isNaN(s.dato) ? ` (${kl(s.dato)})` : ''}\n  ${s.lenke}\n`;
    }
  }
}

if (!antall) html += `<p style="margin-top:24px;">Ingen nye meldinger i perioden.</p>`;

const notat = [
  'Husk: sjekk avsender (SALOs kunder omtales ikke), bildevilkår (bildene vises i sort-hvitt) og eventuell embargo. Skriv saken i egne ord og oppgi kilden.',
  utelatt ? `${utelatt} melding(er) er holdt utenfor fordi de nevner SALO-kunder.` : '',
  feilet.length ? `Kilder som ikke svarte denne gangen: ${feilet.map((f) => f.navn).join(', ')}.` : '',
].filter(Boolean);
html += `<div style="margin-top:28px;padding:16px;background:#E3E4E6;font-size:13px;line-height:1.5;">${notat.map((n) => `<p style="margin:0 0 8px;">${esc(n)}</p>`).join('')}</div>
<div style="${ETIKETT}font-size:11px;color:#5C616A;margin-top:16px;">Automatisk oversikt til redaksjonen. Ingenting publiseres uten redaksjonell behandling.</div>
</div></div></body></html>`;
tekst += `\n${notat.join('\n')}\n`;

// ---------- Rapport og sending ----------

console.log(`Oslo kl. ${osloTime}, vindu ${vinduTimer} t, ${antall} meldinger, ${utelatt} utelatt.`);
for (const r of resultater) {
  if (r.feil) console.log(`✗ ${r.navn}\n    ${r.feil.join('\n    ')}`);
  else console.log(`✓ ${r.navn} – ${r.saker.length} i strømmen (${r.url})`);
}

if (env.TEST === '1' || !env.RESEND_API_KEY) {
  writeFileSync('tipsstrom.html', html);
  console.log(env.TEST === '1' ? 'Testkjøring – ingenting sendt. Se tipsstrom.html.' : 'RESEND_API_KEY mangler – ingenting sendt.');
  process.exit(0);
}

const svar = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: env.TIPS_FRA || 'Tidindi tipsstrøm <onboarding@resend.dev>',
    to: [env.TIPS_TIL || 'kontakt@tidindi.no'],
    subject: emne,
    html,
    text: tekst,
  }),
});
const kropp = await svar.text();
if (!svar.ok) {
  console.error(`Sending feilet: HTTP ${svar.status} ${kropp}`);
  process.exit(1);
}
console.log(`Sendt: ${kropp}`);
