// Starter tipsstrømmen i GitHub Actions på et fast klokkeslett.
//
// Kalles av Vercel Cron (se "crons" i vercel.json), som holder tiden på minuttet.
// GitHubs egne planlagte jobber blir forsinket eller droppet, så vi bruker dem bare som reserve.
//
// Funksjonen sender selv ingen e-post. Den ber GitHub kjøre arbeidsflyten «Tipsstrøm» som en
// planlagt kjøring (planlagt=true). Arbeidsflyten sjekker utgavevinduet og merkelappen i
// Actions-cachen, så hver utgave sendes én gang per dag selv om funksjonen kalles flere ganger.
//
// Miljøvariabler i Vercel (legges inn av Ole, aldri i koden):
//   GITHUB_DISPATCH_TOKEN – finkornet GitHub-token med «Actions: Read and write» for tidindi/tidindi
//   CRON_SECRET           – tilfeldig streng; Vercel Cron sender den som «Authorization: Bearer …»

const REPO = 'tidindi/tidindi';
const ARBEIDSFLYT = 'tipsstrom.yml';

function osloTid(naa = new Date()) {
  const deler = Object.fromEntries(
    new Intl.DateTimeFormat('nb-NO', {
      timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(naa).map((d) => [d.type, d.value]),
  );
  return { time: Number(deler.hour), minutt: Number(deler.minute) };
}

function iUtgavevindu(time) {
  // Samme vinduer som arbeidsflyten: morgen 06.00–09.59, middag 12.00–14.59.
  return (time >= 6 && time < 10) || (time >= 12 && time < 15);
}

export default async function handler(req, res) {
  const hemmelig = process.env.CRON_SECRET;
  if (!hemmelig || req.headers.authorization !== `Bearer ${hemmelig}`) {
    return res.status(401).json({ ok: false, melding: 'Ikke autorisert.' });
  }

  const { time, minutt } = osloTid();
  const klokke = `${String(time).padStart(2, '0')}.${String(minutt).padStart(2, '0')}`;
  if (!iUtgavevindu(time)) {
    // Cron-tidspunktene dekker både vinter- og sommertid; utenfor vinduet gjør vi ingenting.
    return res.status(200).json({ ok: true, startet: false, melding: `Kl. ${klokke} i Oslo – utenfor utgavevinduene.` });
  }

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    console.error('[tipsstrom] GITHUB_DISPATCH_TOKEN mangler i Vercel.');
    return res.status(500).json({ ok: false, melding: 'GITHUB_DISPATCH_TOKEN mangler.' });
  }

  const svar = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${ARBEIDSFLYT}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tidindi-vercel-cron',
    },
    body: JSON.stringify({ ref: 'main', inputs: { test: 'false', planlagt: 'true' } }),
  });

  if (svar.status !== 204) {
    const tekst = await svar.text();
    console.error(`[tipsstrom] GitHub svarte ${svar.status}: ${tekst.slice(0, 300)}`);
    return res.status(502).json({ ok: false, melding: `GitHub svarte ${svar.status}.` });
  }

  console.log(`[tipsstrom] Arbeidsflyten startet kl. ${klokke} i Oslo.`);
  return res.status(200).json({ ok: true, startet: true, melding: `Arbeidsflyten startet kl. ${klokke} i Oslo.` });
}
