// E-POSTMALER for Tidindi Morgenbrief og Tidindi Varde.
//
// Prinsipper (lærdom fra tipsstrømmen):
//   – 600 px, én kolonne, tabellbasert HTML med innebygde stiler (Outlook-sikkert).
//   – Webskrifter lastes fra tidindi.no der e-postprogrammet tillater det (Apple Mail, iOS).
//     Ellers faller det tilbake til Georgia og Arial.
//   – Logo er PNG på egen mørk flate, så den tåler mørk modus. All tekst er ekte tekst,
//     så e-posten kan leses med bilder av.
//   – Neongult brukes bare på sort.
//
// Hver mal returnerer { emne, forhandsvisning, html, tekst }.
// opts.bilde(navn) gir adressen til et bilde (standard: https://tidindi.no/epost/<navn>).
// opts.prove = true legger på en linje om at innholdet er fiktivt.

const FARGE = {
  blyhvit: '#F5F4EF',
  kull: '#1C1E20',
  graa: '#828892',
  sekundaer: '#5C616A',
  paaMork: '#A9ADB3',
  linje: '#D3D5D8',
  linjeMork: '#3A3D41',
  flate: '#E3E4E6',
  neon: '#E6FF2B',
};

const SKRIFT = {
  overskrift: "'Playfair Display',Georgia,'Times New Roman',serif",
  brod: "'Source Serif 4',Georgia,'Times New Roman',serif",
  etikett: "'Barlow Condensed','Arial Narrow',Arial,Helvetica,sans-serif",
};

const ETIKETT = `font-family:${SKRIFT.etikett};text-transform:uppercase;letter-spacing:0.14em;font-weight:600;`;
const UTGIVER = 'Utgitt av SALO Kommunikasjon, Brodtkorbs vei 6, 7017 Trondheim.';

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const standardBilde = (navn) => `https://tidindi.no/epost/${navn}`;

// ---------- Felles skall ----------

function skall({ tittel, forhandsvisning, innhold, prove }) {
  const fonter = 'https://tidindi.no/fonter/';
  return `<!doctype html>
<html lang="nb" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(tittel)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>td,p,a,span,div{font-family:Georgia,'Times New Roman',serif;}</style><![endif]-->
<style>
@font-face{font-family:'Playfair Display';font-style:normal;font-weight:400 900;src:url(${fonter}playfair-display-latin-wght-normal.woff2) format('woff2');}
@font-face{font-family:'Playfair Display';font-style:italic;font-weight:400 900;src:url(${fonter}playfair-display-latin-wght-italic.woff2) format('woff2');}
@font-face{font-family:'Source Serif 4';font-style:normal;font-weight:200 900;src:url(${fonter}source-serif-4-latin-opsz-normal.woff2) format('woff2');}
@font-face{font-family:'Barlow Condensed';font-style:normal;font-weight:600;src:url(${fonter}barlow-condensed-latin-600-normal.woff2) format('woff2');}
body{margin:0;padding:0;width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table{border-collapse:collapse;}
img{border:0;outline:none;text-decoration:none;display:block;}
a{text-decoration:none;}
u + #kropp a{color:inherit;}
@media screen and (max-width:620px){
  .px{padding-left:20px !important;padding-right:20px !important;}
  .ord{font-size:44px !important;}
  .stor{font-size:26px !important;}
  .tall{font-size:28px !important;}
}
</style>
</head>
<body id="kropp" style="margin:0;padding:0;background:${FARGE.blyhvit};">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(forhandsvisning)}${'&#847;&zwnj;&nbsp;'.repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${FARGE.blyhvit};" bgcolor="${FARGE.blyhvit}">
<tr><td align="center" style="padding:0;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
${prove ? `<tr><td class="px" style="padding:10px 32px;${ETIKETT}font-size:11px;color:${FARGE.sekundaer};">Prøveutgave · fiktivt innhold</td></tr>` : ''}
${innhold}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

// Mørk topp med logo og linjer under.
function topp({ logo, logoAlt, logoBredde, linjer = '' }) {
  return `<tr><td class="px" bgcolor="${FARGE.kull}" style="background:${FARGE.kull};padding:28px 32px 28px;">
<img src="${esc(logo)}" width="${logoBredde}" height="40" alt="${esc(logoAlt)}" style="width:${logoBredde}px;height:40px;color:${FARGE.blyhvit};font-family:Georgia,serif;font-size:24px;line-height:40px;">
${linjer}
</td></tr>`;
}

// Blokkmønsteret fra nettstedet: 3 px strek → etikett → innhold.
function blokkStart(etikett, hoyre = '') {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:3px solid ${FARGE.kull};">
<tr>
<td style="padding:12px 0 0;${ETIKETT}font-size:13px;color:${FARGE.kull};">${esc(etikett)}</td>
${hoyre ? `<td align="right" style="padding:12px 0 0;${ETIKETT}font-size:13px;color:${FARGE.sekundaer};">${esc(hoyre)}</td>` : ''}
</tr>
</table>`;
}

function bunn({ bilde, linjer, lenker }) {
  return `<tr><td class="px" style="padding:8px 32px 0;">
<img src="${esc(bilde('tidindi-sluttmerke.png'))}" width="28" height="28" alt="" style="width:28px;height:28px;">
</td></tr>
<tr><td class="px" style="padding:24px 32px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${FARGE.linje};">
<tr><td style="padding-top:16px;font-family:${SKRIFT.brod};font-size:13px;line-height:1.55;color:${FARGE.sekundaer};">
${linjer.map((l) => `<p style="margin:0 0 6px;">${l}</p>`).join('\n')}
<p style="margin:12px 0 0;${ETIKETT}font-size:12px;">${lenker.map(([t, h]) => `<a href="${esc(h)}" style="color:${FARGE.sekundaer};text-decoration:underline;">${esc(t)}</a>`).join(' &nbsp;·&nbsp; ')}</p>
</td></tr>
</table>
</td></tr>`;
}

// ---------- Tidindi Morgenbrief ----------
//
// utgave = {
//   dato: Date, nummer?: number, lesetid: 3,
//   ord: 'Tillit',
//   syntese: ['avsnitt', ...],            // 2–3 avsnitt
//   saker: [{ medium, setning, lenke }],  // ti saker, ti ulike redaksjoner
//   folgMed: 'én setning',
//   lenker: { nettleser, abonnement, avmelding }
// }

export function morgenbrief(u, opts = {}) {
  const bilde = opts.bilde || standardBilde;
  const datoTekst = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Oslo' }).format(u.dato);
  const emne = `Dagens ord: ${u.ord}`;
  const forhandsvisning = u.syntese[0].split(/(?<=\.)\s/)[0];

  const medier = new Set(u.saker.map((s) => s.medium));
  if (medier.size !== u.saker.length) throw new Error('Morgenbrief: hver sak skal komme fra en egen redaksjon.');

  const meta = [datoTekst, u.nummer ? `Utgave ${u.nummer}` : '', `Ca. ${u.lesetid || 3} minutter`].filter(Boolean).join(' · ');

  const toppen = topp({
    logo: bilde('tidindi-morgenbrief.png'), logoAlt: 'Tidindi Morgenbrief', logoBredde: 173,
    linjer: `<p style="margin:14px 0 0;${ETIKETT}font-size:12px;color:${FARGE.paaMork};">${esc(meta)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-top:1px solid ${FARGE.linjeMork};">
<tr><td style="padding-top:28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="32" height="2" bgcolor="${FARGE.neon}" style="width:32px;height:2px;line-height:2px;font-size:2px;background:${FARGE.neon};">&nbsp;</td></tr></table>
<p style="margin:12px 0 0;${ETIKETT}font-size:13px;color:${FARGE.neon};">Dagens ord</p>
<p class="ord" style="margin:6px 0 0;font-family:${SKRIFT.overskrift};font-weight:700;font-size:56px;line-height:1.05;letter-spacing:-0.01em;color:${FARGE.blyhvit};">${esc(u.ord)}</p>
</td></tr>
</table>`,
  });

  const syntese = `<tr><td class="px" style="padding:36px 32px 0;">
${blokkStart('Nyhetsbildet')}
${u.syntese.map((a) => `<p style="margin:14px 0 0;font-family:${SKRIFT.brod};font-size:18px;line-height:1.6;color:${FARGE.kull};">${esc(a)}</p>`).join('\n')}
</td></tr>`;

  const saker = `<tr><td class="px" style="padding:40px 32px 0;">
${blokkStart('Ti saker fra ti redaksjoner')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:4px;">
${u.saker.map((s, i) => `<tr>
<td width="36" valign="top" style="width:36px;padding:16px 0 16px;${i ? `border-top:1px solid ${FARGE.linje};` : ''}font-family:${SKRIFT.overskrift};font-weight:700;font-size:20px;line-height:1.2;color:${FARGE.graa};">${i + 1}</td>
<td valign="top" style="padding:16px 0 16px;${i ? `border-top:1px solid ${FARGE.linje};` : ''}">
<a href="${esc(s.lenke)}" style="display:block;color:${FARGE.kull};text-decoration:none;">
<span style="display:block;${ETIKETT}font-size:12px;color:${FARGE.sekundaer};">${esc(s.medium)}</span>
<span style="display:block;margin-top:4px;font-family:${SKRIFT.brod};font-size:17px;line-height:1.45;color:${FARGE.kull};">${esc(s.setning)}&nbsp;<span style="color:${FARGE.graa};">→</span></span>
</a>
</td>
</tr>`).join('\n')}
</table>
</td></tr>`;

  const folgMed = `<tr><td class="px" style="padding:32px 32px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${FARGE.kull}" style="background:${FARGE.kull};">
<tr><td style="padding:24px 24px 26px;">
<p style="margin:0;${ETIKETT}font-size:13px;color:${FARGE.neon};">Følg med på</p>
<p style="margin:10px 0 0;font-family:${SKRIFT.brod};font-size:18px;line-height:1.55;color:${FARGE.blyhvit};">${esc(u.folgMed)}</p>
</td></tr>
</table>
</td></tr>`;

  const l = u.lenker || {};
  const bunnen = bunn({
    bilde,
    linjer: [
      'Tidindi Morgenbrief er en kuratert morgenorientering fra Tidindi. Sakene er valgt av redaksjonen, og lenkene går til mediene som publiserte dem.',
      esc(UTGIVER),
    ],
    lenker: [['Les i nettleseren', l.nettleser || 'https://tidindi.no/morgenbrief/'], ['Endre abonnement', l.abonnement || 'https://tidindi.no/morgenbrief/'], ['Meld deg av', l.avmelding || 'https://tidindi.no/morgenbrief/']],
  });

  const html = skall({ tittel: emne, forhandsvisning, prove: opts.prove, innhold: toppen + syntese + saker + folgMed + bunnen });

  const tekst = [
    opts.prove ? 'PRØVEUTGAVE – FIKTIVT INNHOLD\n' : '',
    `TIDINDI MORGENBRIEF`,
    meta,
    '',
    `DAGENS ORD: ${u.ord.toUpperCase()}`,
    '',
    'NYHETSBILDET',
    ...u.syntese.flatMap((a) => [a, '']),
    'TI SAKER FRA TI REDAKSJONER',
    ...u.saker.map((s, i) => `${i + 1}. ${s.medium}: ${s.setning}\n   ${s.lenke}`),
    '',
    'FØLG MED PÅ',
    u.folgMed,
    '',
    '—',
    'Tidindi Morgenbrief er en kuratert morgenorientering fra Tidindi. Sakene er valgt av redaksjonen, og lenkene går til mediene som publiserte dem.',
    UTGIVER,
    `Meld deg av: ${l.avmelding || 'https://tidindi.no/morgenbrief/'}`,
  ].join('\n');

  return { emne, forhandsvisning, html, tekst };
}

// ---------- Tidindi Varde: morgenrapport ----------
//
// r = {
//   dato: Date, timer: 24, virksomhet: 'Navn AS', tema: 'Havvind',
//   egne:    [{ medium, tid, tittel, setning, lenke }],
//   temaSaker: [...],
//   aktorer: [{ navn, saker: [...] }],   // opptil to
//   lenker: { overvaking }
// }

function omtaler(saker, tom) {
  if (!saker.length) {
    return `<p style="margin:10px 0 0;font-family:${SKRIFT.brod};font-style:italic;font-size:15px;line-height:1.5;color:${FARGE.sekundaer};">${esc(tom)}</p>`;
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${saker.map((s, i) => `<tr><td style="padding:14px 0 14px;${i ? `border-top:1px solid ${FARGE.linje};` : ''}">
<p style="margin:0;${ETIKETT}font-size:12px;color:${FARGE.sekundaer};">${esc(s.medium)} &nbsp;·&nbsp; ${esc(s.tid)}</p>
<p style="margin:5px 0 0;font-family:${SKRIFT.brod};font-weight:700;font-size:18px;line-height:1.35;"><a href="${esc(s.lenke)}" style="color:${FARGE.kull};text-decoration:none;">${esc(s.tittel)}</a></p>
<p style="margin:5px 0 0;font-family:${SKRIFT.brod};font-size:15px;line-height:1.5;color:${FARGE.sekundaer};">${esc(s.setning)}</p>
</td></tr>`).join('\n')}
</table>`;
}

const flertall = (n, en, flere) => `${n} ${n === 1 ? en : flere}`;

export function vardeRapport(r, opts = {}) {
  const bilde = opts.bilde || standardBilde;
  const datoTekst = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Oslo' }).format(r.dato);
  const timer = r.timer || 24;
  const nEgne = r.egne.length;
  const nTema = r.temaSaker.length;
  const nAkt = r.aktorer.reduce((n, a) => n + a.saker.length, 0);
  const totalt = nEgne + nTema + nAkt;

  const hovedlinje = totalt ? `${flertall(totalt, 'ny omtale', 'nye omtaler')} siste døgn` : 'Ingen nye omtaler siste døgn';
  const emne = `Varde: ${totalt ? flertall(nEgne, 'omtale', 'omtaler') + ` av ${r.virksomhet}` : `ingen nye omtaler av ${r.virksomhet}`} – ${datoTekst.replace(/ \d{4}$/, '')}`;
  const forhandsvisning = `${flertall(nEgne, 'omtale', 'omtaler')} av ${r.virksomhet} · ${nTema} om ${r.tema.toLowerCase()} · ${nAkt} om aktører`;

  const stat = (tall, etikett) => `<td valign="top" width="33%" style="width:33%;padding:14px 12px 0 0;">
<p class="tall" style="margin:0;font-family:${SKRIFT.overskrift};font-weight:700;font-size:34px;line-height:1;color:${tall ? FARGE.neon : FARGE.graa};">${tall}</p>
<p style="margin:6px 0 0;${ETIKETT}font-size:11px;line-height:1.35;color:${FARGE.paaMork};">${esc(etikett)}</p>
</td>`;

  const toppen = topp({
    logo: bilde('tidindi-varde.png'), logoAlt: 'Tidindi Varde', logoBredde: 131,
    linjer: `<p style="margin:14px 0 0;${ETIKETT}font-size:12px;color:${FARGE.paaMork};">Morgenrapport · ${esc(datoTekst)} · siste ${timer} timer</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-top:1px solid ${FARGE.linjeMork};">
<tr><td style="padding-top:24px;">
<p class="stor" style="margin:0;font-family:${SKRIFT.overskrift};font-weight:700;font-size:30px;line-height:1.15;color:${FARGE.blyhvit};">${esc(hovedlinje)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;"><tr>
${stat(nEgne, r.virksomhet)}
${stat(nTema, `Tema: ${r.tema}`)}
${stat(nAkt, r.aktorer.length === 1 ? r.aktorer[0].navn : 'Aktører')}
</tr></table>
</td></tr>
</table>`,
  });

  const seksjon = (etikett, antall, navn, innhold, forste = false) => `<tr><td class="px" style="padding:${forste ? 36 : 40}px 32px 0;">
${blokkStart(etikett, flertall(antall, 'omtale', 'omtaler'))}
${navn ? `<p style="margin:12px 0 0;font-family:${SKRIFT.overskrift};font-weight:700;font-size:22px;line-height:1.2;color:${FARGE.kull};">${esc(navn)}</p>` : ''}
${innhold}
</td></tr>`;

  const tom = `Ingen nye omtaler siste døgn.`;
  const egne = seksjon('Eget selskap', nEgne, r.virksomhet, omtaler(r.egne, tom), true);
  const tema = seksjon('Valgt tema', nTema, r.tema, omtaler(r.temaSaker, tom));
  const aktorer = `<tr><td class="px" style="padding:40px 32px 0;">
${blokkStart('Aktører', flertall(nAkt, 'omtale', 'omtaler'))}
${r.aktorer.map((a, i) => `<p style="margin:${i ? 24 : 12}px 0 0;font-family:${SKRIFT.overskrift};font-weight:700;font-size:22px;line-height:1.2;color:${FARGE.kull};">${esc(a.navn)}</p>
${omtaler(a.saker, tom)}`).join('\n')}
</td></tr>`;

  const l = r.lenker || {};
  const bunnen = `<tr><td style="height:32px;line-height:32px;font-size:1px;">&nbsp;</td></tr>` + bunn({
    bilde,
    linjer: [
      `Tidindi Varde følger digitale redaksjonelle medier. Sosiale medier inngår ikke. Sanntidsvarsler om ${esc(r.virksomhet)} kommer som egne e-poster.`,
      esc(UTGIVER),
    ],
    lenker: [['Endre overvåking', l.overvaking || 'https://tidindi.no/varde/'], ['Kontakt oss', 'mailto:kontakt@tidindi.no']],
  });

  const html = skall({ tittel: emne, forhandsvisning, prove: opts.prove, innhold: toppen + egne + tema + aktorer + bunnen });

  const tekstSaker = (saker) => (saker.length ? saker.map((s) => `- ${s.medium}, ${s.tid}: ${s.tittel}\n  ${s.setning}\n  ${s.lenke}`) : [`- ${tom}`]);
  const tekst = [
    opts.prove ? 'PRØVEUTGAVE – FIKTIVT INNHOLD\n' : '',
    'TIDINDI VARDE – MORGENRAPPORT',
    `${datoTekst}, siste ${timer} timer`,
    '',
    hovedlinje.toUpperCase(),
    forhandsvisning,
    '',
    `EGET SELSKAP: ${r.virksomhet} (${nEgne})`, ...tekstSaker(r.egne), '',
    `VALGT TEMA: ${r.tema} (${nTema})`, ...tekstSaker(r.temaSaker), '',
    `AKTØRER (${nAkt})`, ...r.aktorer.flatMap((a) => [a.navn, ...tekstSaker(a.saker)]), '',
    '—',
    'Tidindi Varde følger digitale redaksjonelle medier. Sosiale medier inngår ikke.',
    UTGIVER,
  ].join('\n');

  return { emne, forhandsvisning, html, tekst };
}

// ---------- Tidindi Varde: sanntidsvarsel ----------
//
// v = { virksomhet, medium, tid, tittel, setning, lenke }

export function vardeVarsel(v, opts = {}) {
  const bilde = opts.bilde || standardBilde;
  const emne = `Varde: ${v.virksomhet} nevnt i ${v.medium}`;
  const forhandsvisning = v.tittel;

  const toppen = topp({
    logo: bilde('tidindi-varde.png'), logoAlt: 'Tidindi Varde', logoBredde: 131,
    linjer: `<p style="margin:14px 0 0;${ETIKETT}font-size:12px;color:${FARGE.neon};">Sanntidsvarsel <span style="color:${FARGE.paaMork};">· ${esc(v.virksomhet)} er omtalt</span></p>`,
  });

  const innhold = `<tr><td class="px" style="padding:36px 32px 0;">
${blokkStart(v.medium, v.tid)}
<p class="stor" style="margin:14px 0 0;font-family:${SKRIFT.overskrift};font-weight:700;font-size:28px;line-height:1.2;color:${FARGE.kull};"><a href="${esc(v.lenke)}" style="color:${FARGE.kull};text-decoration:none;">${esc(v.tittel)}</a></p>
<p style="margin:12px 0 0;font-family:${SKRIFT.brod};font-size:18px;line-height:1.55;color:${FARGE.kull};">${esc(v.setning)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;"><tr>
<td bgcolor="${FARGE.kull}" style="background:${FARGE.kull};">
<a href="${esc(v.lenke)}" style="display:inline-block;padding:14px 22px;${ETIKETT}font-size:14px;font-weight:700;color:${FARGE.neon};text-decoration:none;">Les saken hos ${esc(v.medium)}</a>
</td></tr></table>
<p style="margin:20px 0 0;font-family:${SKRIFT.brod};font-size:14px;line-height:1.5;color:${FARGE.sekundaer};">Omtalen tas også med i neste morgenrapport.</p>
</td></tr>
<tr><td style="height:32px;line-height:32px;font-size:1px;">&nbsp;</td></tr>`;

  const bunnen = bunn({
    bilde,
    linjer: ['Tidindi Varde følger digitale redaksjonelle medier. Sosiale medier inngår ikke.', esc(UTGIVER)],
    lenker: [['Endre varsler', 'https://tidindi.no/varde/'], ['Kontakt oss', 'mailto:kontakt@tidindi.no']],
  });

  const html = skall({ tittel: emne, forhandsvisning, prove: opts.prove, innhold: toppen + innhold + bunnen });
  const tekst = [
    opts.prove ? 'PRØVEUTGAVE – FIKTIVT INNHOLD\n' : '',
    `TIDINDI VARDE – SANNTIDSVARSEL`,
    `${v.virksomhet} er omtalt i ${v.medium}, ${v.tid}`,
    '',
    v.tittel,
    v.setning,
    v.lenke,
    '',
    '—',
    UTGIVER,
  ].join('\n');

  return { emne, forhandsvisning, html, tekst };
}
