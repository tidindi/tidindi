// PRØVESENDING av e-postmalene med fiktivt innhold.
//
//   node epost/prove.mjs          – lager HTML-filene i epost/ut/ (ingenting sendes)
//   SEND=1 node epost/prove.mjs   – sender også de tre prøvene via Resend
//
// Miljøvariabler: RESEND_API_KEY, PROVE_TIL (standard ole.winther@tidindi.no),
// BILDER=lenke (bruk https://tidindi.no/epost/ i stedet for innebygde bilder).
//
// Til prøvene bygges logoene inn i e-posten (cid), slik at de vises før bildene er
// publisert på tidindi.no. I drift hentes de fra https://tidindi.no/epost/.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { morgenbrief, vardeRapport, vardeVarsel } from './maler.mjs';
import { morgenbriefProve, vardeRapportProve, vardeVarselProve } from './proveinnhold.mjs';

const her = dirname(fileURLToPath(import.meta.url));
const env = process.env;
const innebygd = env.BILDER !== 'lenke';
const bilde = (navn) => (innebygd ? `cid:${navn}` : `https://tidindi.no/epost/${navn}`);
const opts = { prove: true, bilde };

const prover = [
  ['morgenbrief', morgenbrief(morgenbriefProve, opts)],
  ['varde-rapport', vardeRapport(vardeRapportProve, opts)],
  ['varde-varsel', vardeVarsel(vardeVarselProve, opts)],
];

const ut = join(her, 'ut');
mkdirSync(ut, { recursive: true });
for (const [navn, e] of prover) {
  // Lokale filer peker til bildene i public/ så de kan åpnes direkte i nettleseren.
  writeFileSync(join(ut, `${navn}.html`), e.html.replaceAll('cid:', '../../public/epost/'));
  writeFileSync(join(ut, `${navn}.txt`), e.tekst);
  console.log(`${navn}: «${e.emne}» (${Math.round(Buffer.byteLength(e.html) / 1024)} kB)`);
}

if (env.SEND !== '1') {
  console.log('Ikke sendt (sett SEND=1 for å sende).');
  process.exit(0);
}
if (!env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY mangler – ingenting sendt.');
  process.exit(1);
}

const vedlegg = (html) => [...new Set([...html.matchAll(/cid:([\w.-]+)/g)].map((m) => m[1]))].map((navn) => ({
  filename: navn,
  content_id: navn,
  content: readFileSync(join(her, '..', 'public', 'epost', navn)).toString('base64'),
}));

const avsender = { morgenbrief: 'Tidindi Morgenbrief <morgenbrief@tidindi.no>', 'varde-rapport': 'Tidindi Varde <varde@tidindi.no>', 'varde-varsel': 'Tidindi Varde <varde@tidindi.no>' };
let feil = 0;
for (const [navn, e] of prover) {
  const svar = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: avsender[navn],
      to: [env.PROVE_TIL || 'ole.winther@tidindi.no'],
      subject: `[Prøve] ${e.emne}`,
      html: e.html,
      text: e.tekst,
      ...(innebygd ? { attachments: vedlegg(e.html) } : {}),
    }),
  });
  const kropp = await svar.text();
  if (svar.ok) console.log(`✓ ${navn} sendt: ${kropp}`);
  else { feil++; console.error(`✗ ${navn}: HTTP ${svar.status} ${kropp}`); }
  if (env.GITHUB_ACTIONS) console.log(`::notice title=E-postprøve::${svar.ok ? '✓' : '✗'} ${navn}: ${e.emne}`);
}
process.exit(feil ? 1 : 0);
