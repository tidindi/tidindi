// Skiføret fra fnugg.no til stripen på forsiden.
//
// Henter alle anlegg fra fnuggs åpne API, plukker ut dem som har åpne heiser og bakker og
// snø i bakken, og returnerer en kort liste. Svaret mellomlagres i Vercels CDN i 15 minutter,
// så fnugg får høyst noen få kall i timen uansett hvor mange som besøker forsiden.
//
// Vilkår (fnugg.no/artikler/api): dataene vises uendret, merkes godt synlig med
// «Vær- og føredata er levert av fnugg, Yr, Meteorologisk institutt og NRK» og fnugg-logoen,
// og lenkes til anleggssiden på fnugg.no. Ingen nøkkel kreves.

const FELT = [
  'name', 'site_path', 'region',
  'lifts.open', 'lifts.count', 'slopes.open', 'slopes.count',
  'conditions.combined.top.snow.depth_slope',
  'conditions.combined.top.snow.depth_terrain',
  'conditions.combined.top.temperature.value',
  'last_updated',
].join(',');

const KILDE = `https://api.fnugg.no/search?size=300&sourceFields=${FELT}`;

const tall = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function velgAnlegg(treff) {
  return treff
    .map((t) => t._source || {})
    .map((s) => {
      const topp = s.conditions?.combined?.top || {};
      return {
        navn: s.name,
        lenke: s.site_path ? `https://fnugg.no${s.site_path}` : 'https://fnugg.no/',
        region: Array.isArray(s.region) && s.region.length ? s.region[0] : null,
        heiser: { apne: tall(s.lifts?.open), totalt: tall(s.lifts?.count) },
        bakker: { apne: tall(s.slopes?.open), totalt: tall(s.slopes?.count) },
        snoBakke: tall(topp.snow?.depth_slope),
        snoTerreng: tall(topp.snow?.depth_terrain),
        temperatur: tall(topp.temperature?.value),
        oppdatert: s.last_updated || null,
      };
    })
    // Åpne skianlegg: minst én heis og én bakke åpen og snø i bakken.
    // Tar bort sykkelparker og sommergondoler, som også står i fnugg.
    .filter((a) => a.navn && a.heiser.apne > 0 && a.bakker.apne > 0 && a.snoBakke > 0)
    .sort((a, b) => b.snoBakke - a.snoBakke || a.navn.localeCompare(b.navn, 'nb'));
}

export default async function handler(req, res) {
  try {
    const svar = await fetch(KILDE, {
      headers: { 'User-Agent': 'Tidindi (tidindi.no; kontakt@tidindi.no)', Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!svar.ok) throw new Error(`fnugg svarte ${svar.status}`);
    const data = await svar.json();
    const anlegg = velgAnlegg(data?.hits?.hits || []);
    const oppdatert = anlegg.reduce((m, a) => (a.oppdatert && a.oppdatert > m ? a.oppdatert : m), '') || null;

    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json({ antall: anlegg.length, oppdatert, anlegg });
  } catch (feil) {
    console.error('[fnugg]', feil.message);
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(502).json({ antall: 0, anlegg: [], feil: 'Fikk ikke hentet data fra fnugg.' });
  }
}
