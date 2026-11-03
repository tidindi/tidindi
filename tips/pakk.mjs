// «Tips til saker» – lager e-posten fra en Markdown-fil, krypterer den og ber GitHub sende den.
//
// Kjøres av Claude etter idérunden:
//   node tips/pakk.mjs tips.md            → krypterer og starter arbeidsflyten «Tips til saker»
//   PROVE=1 node tips/pakk.mjs tips.md    → lager bare tips.html lokalt (ingen sending)
//
// Repoet er offentlig. Derfor sendes innholdet aldri i klartekst: HTML-en komprimeres og krypteres
// med den offentlige age-nøkkelen i tips/mottaker.txt. Bare arbeidsflyten kan dekryptere, med den
// private nøkkelen i GitHub-hemmeligheten TIPS_NOKKEL.
//
// Markdown som støttes: «## » og «### » (mellomtitler), «- » (punkter), tomme linjer (avsnitt),
// **fet**, [tekst](https://…) og nakne https-lenker.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HER = dirname(fileURLToPath(import.meta.url));
const fil = process.argv[2];
if (!fil) { console.error('Bruk: node tips/pakk.mjs <fil.md>'); process.exit(1); }

const nå = new Date();
const dato = new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', day: 'numeric', month: 'long', year: 'numeric' }).format(nå);
const emne = `Tips til saker, ${dato}, Claude`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LENKE = 'color:#1C1E20;text-decoration:underline;text-decoration-color:#A9ADB3';
function inline(s) {
  let t = esc(s);
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, a, u) => `<a href="${u}" style="${LENKE}">${a}</a>`);
  t = t.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_, f, u) => `${f}<a href="${u}" style="${LENKE};word-break:break-all">${u}</a>`);
  return t;
}

const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "'Arial Narrow',Arial,sans-serif";
const linjer = readFileSync(fil, 'utf8').replace(/\r/g, '').split('\n');
const deler = [];
let avsnitt = [], liste = [];
const tømAvsnitt = () => { if (avsnitt.length) { deler.push(`<p style="margin:0 0 14px;font-family:${SERIF};font-size:16px;line-height:1.5;color:#1C1E20">${inline(avsnitt.join(' '))}</p>`); avsnitt = []; } };
const tømListe = () => { if (liste.length) { deler.push(`<ul style="margin:0 0 16px;padding-left:20px;font-family:${SERIF};font-size:16px;line-height:1.5;color:#1C1E20">${liste.map((l) => `<li style="margin:0 0 6px">${inline(l)}</li>`).join('')}</ul>`); liste = []; } };
for (const l of linjer) {
  if (/^##\s/.test(l)) { tømAvsnitt(); tømListe(); deler.push(`<h2 style="margin:28px 0 12px;padding-top:10px;border-top:3px solid #1C1E20;font-family:${SANS};font-size:15px;letter-spacing:.12em;text-transform:uppercase;color:#1C1E20">${inline(l.replace(/^##\s+/, ''))}</h2>`); }
  else if (/^###\s/.test(l)) { tømAvsnitt(); tømListe(); deler.push(`<h3 style="margin:22px 0 8px;font-family:${SERIF};font-size:20px;line-height:1.25;color:#1C1E20">${inline(l.replace(/^###\s+/, ''))}</h3>`); }
  else if (/^\s*-\s/.test(l)) { tømAvsnitt(); liste.push(l.replace(/^\s*-\s+/, '')); }
  else if (!l.trim()) { tømAvsnitt(); tømListe(); }
  else { tømListe(); avsnitt.push(l.trim()); }
}
tømAvsnitt(); tømListe();

const html = `<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="color-scheme" content="light only"><title>${esc(emne)}</title></head>
<body style="margin:0;padding:0;background:#F5F4EF">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4EF"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#FFFFFF">
<tr><td style="background:#1C1E20;padding:14px 24px;font-family:${SANS};font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#E6FF2B">Tips til saker · ${esc(dato)} · Claude</td></tr>
<tr><td style="padding:8px 24px 24px">${deler.join('\n')}</td></tr>
<tr><td style="padding:14px 24px;background:#E3E4E6;font-family:${SANS};font-size:13px;line-height:1.5;color:#5C616A">Idérunde laget av Claude for Tidindi. Sjekk førstehåndskildene før bruk, og hold saker som berører SALOs kunder utenfor. Kriterier: norsk relevans, sjokkfaktor, ikke dekket i Norge.</td></tr>
</table></td></tr></table></body></html>`;

if (process.env.PROVE === '1') { writeFileSync('tips.html', html); console.log(`Prøve: tips.html (${html.length} tegn), emne «${emne}»`); process.exit(0); }

const mottaker = readFileSync(join(HER, 'mottaker.txt'), 'utf8').trim();
const kryptert = execFileSync('age', ['-r', mottaker], { input: gzipSync(Buffer.from(html, 'utf8'), { level: 9 }) });
const innhold = kryptert.toString('base64');
if (innhold.length > 60000) { console.error(`For stort (${innhold.length} tegn base64, maks 60 000). Kort ned teksten.`); process.exit(1); }
execFileSync('gh', ['api', '-X', 'POST', 'repos/tidindi/tidindi/actions/workflows/tips-til-saker.yml/dispatches',
  '-f', 'ref=main', '-f', `inputs[innhold]=${innhold}`, '-f', `inputs[emne]=${emne}`], { stdio: 'inherit' });
console.log(`Startet «Tips til saker» (${innhold.length} tegn kryptert), emne «${emne}».`);
