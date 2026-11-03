// Sender «Tips til saker» via Resend. Kjøres av arbeidsflyten etter dekryptering (tips.html).
import { readFileSync } from 'node:fs';

const { RESEND_API_KEY, EMNE, TIPS_TIL } = process.env;
if (!RESEND_API_KEY) { console.error('RESEND_API_KEY mangler.'); process.exit(1); }
const html = readFileSync('tips.html', 'utf8');
const tekst = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<br\s*\/?>|<\/(p|li|h2|h3|tr)>/g, '\n')
  .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, '$2 ($1)').replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\n{3,}/g, '\n\n').trim();

const svar = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'Tidindi tips til saker <tips@tidindi.no>',
    to: [TIPS_TIL || 'ole.winther@tidindi.no'],
    subject: EMNE || 'Tips til saker, Claude',
    html,
    text: tekst,
  }),
});
const kropp = await svar.text();
if (!svar.ok) { console.error(`Sending feilet: HTTP ${svar.status} ${kropp}`); process.exit(1); }
console.log(`::notice title=Tips til saker::Sendt – ${EMNE}`);
