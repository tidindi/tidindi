// Skiføret fra fnugg.no til stripen på forsiden.
//
// Henter alle anlegg fra fnuggs åpne API og returnerer anleggene fnugg melder som åpne,
// og dem som åpner snart. Svaret mellomlagres i Vercels CDN i 15 minutter,
// så fnugg får høyst noen få kall i timen uansett hvor mange som besøker forsiden.
//
// Vilkår (fnugg.no/artikler/api): dataene vises uendret, merkes godt synlig med
// «Vær- og føredata er levert av fnugg, Yr, Meteorologisk institutt og NRK» og fnugg-logoen,
// og lenkes til anleggssiden på fnugg.no. Ingen nøkkel kreves.

const FELT = [
  'name', 'site_path', 'region', 'resort_open', 'resort_opening_date',
  'lifts.open', 'lifts.count', 'slopes.open', 'slopes.count',
  'conditions.combined.top.snow.depth_slope',
  'conditions.combined.top.snow.depth_terrain',
  'conditions.combined.top.temperature.value',
  'last_updated',
].join(',');

const KILDE = `https://api.fnugg.no/search?size=300&sourceFields=${FELT}`;

const tall = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

const DAG = 24 * 60 * 60 * 1000;
const SNART_DAGER = 45; // vis sesongstart bare når den er nær

function tilAnlegg(s) {
  const topp = s.conditions?.combined?.top || {};
  return {
    navn: s.name,
    lenke: s.site_path ? `https://fnugg.no${s.site_path}` : 'https://fnugg.no/',
    region: Array.isArray(s.region) && s.region.length ? s.region[0] : null,
    apent: s.resort_open === true,
    apner: s.resort_opening_date || null,
    heiser: { apne: tall(s.lifts?.open), totalt: tall(s.lifts?.count) },
    bakker: { apne: tall(s.slopes?.open), totalt: tall(s.slopes?.count) },
    snoBakke: tall(topp.snow?.depth_slope),
    snoTerreng: tall(topp.snow?.depth_terrain),
    temperatur: tall(topp.temperature?.value),
    oppdatert: s.last_updated || null,
  };
}

// Bare anlegg fnugg selv melder som åpne (resort_open). Heis- og bakkestatus og snødybde
// blir ofte stående fra forrige sesong ved stengte anlegg, så de brukes ikke til å avgjøre om
// et anlegg er åpent. «Snart»: anlegg som ikke er åpne, med sesongstart de neste 45 dagene.
export function velgAnlegg(treff, naa = new Date()) {
  const alle = treff.map((t) => tilAnlegg(t._source || {})).filter((a) => a.navn);
  const apne = alle
    .filter((a) => a.apent)
    .sort((a, b) => (b.snoBakke ?? -1) - (a.snoBakke ?? -1) || a.navn.localeCompare(b.navn, 'nb'));
  const idag = Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth(), naa.getUTCDate());
  const snart = alle
    .filter((a) => !a.apent && a.apner)
    .map((a) => ({ ...a, t: Date.parse(a.apner) }))
    .filter((a) => Number.isFinite(a.t) && a.t >= idag && a.t <= idag + SNART_DAGER * DAG)
    .sort((a, b) => a.t - b.t || a.navn.localeCompare(b.navn, 'nb'))
    .map(({ t, ...a }) => a);
  return { apne, snart };
}

export default async function handler(req, res) {
  try {
    const svar = await fetch(KILDE, {
      headers: { 'User-Agent': 'Tidindi (tidindi.no; kontakt@tidindi.no)', Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!svar.ok) throw new Error(`fnugg svarte ${svar.status}`);
    const data = await svar.json();
    const { apne, snart } = velgAnlegg(data?.hits?.hits || []);
    const oppdatert = [...apne, ...snart].reduce((m, a) => (a.oppdatert && a.oppdatert > m ? a.oppdatert : m), '') || null;

    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json({ antallApne: apne.length, oppdatert, apne, snart });
  } catch (feil) {
    console.error('[fnugg]', feil.message);
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(502).json({ antallApne: 0, apne: [], snart: [], feil: 'Fikk ikke hentet data fra fnugg.' });
  }
}
