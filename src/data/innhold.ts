// INNHOLD – henter publiserte artikler og forsideoppsettet fra Sanity når nettstedet bygges.
// Bare publisert innhold hentes. Utkast er aldri med. Ingen nøkkel trengs: datasettet er offentlig.
//
// Reserveløsning: så lenge det ikke finnes publiserte artikler, vises testinnholdet.
// Feiler hentingen, stopper bygget – da blir forrige versjon av nettstedet stående.

import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { seksjoner, type SeksjonSlug } from './seksjoner';
import * as test from './testinnhold';
import type { Artikkel, Bildedata, Forsideoppsett } from './testinnhold';
import { bildedata, brodtekst, videodata } from './portabletekst';
import { linjefall } from './typografi';

export type { Artikkel, Blokk, Bildedata, Forsideoppsett } from './testinnhold';

export const sanityProsjekt = { projectId: '1ld4ddgo', dataset: 'production' };

const bildebygger = createImageUrlBuilder(sanityProsjekt);

/** Adresse til et Sanity-bilde beskåret til gitt bredde og forhold (høyde/bredde) rundt fokuspunktet.
 *  Bilder vises i sort-hvitt (Tidindis bildeprofil), med mindre «Vis i farger» er valgt. Originalen i Sanity beholdes i farger. */
export function bildeUrl(bilde: Bildedata | undefined, bredde: number, forhold: number): string | undefined {
  if (!bilde) return undefined;
  if (!bilde.sanity) return bilde.src;
  const b = bildebygger.image(bilde.sanity as any).width(bredde).height(Math.round(bredde * forhold)).fit('crop');
  return (bilde.farger ? b : b.saturation(-100)).auto('format').quality(80).url();
}

/** Bilde til deling i sosiale medier (1200 × 630). */
export const delingsbilde = (bilde?: Bildedata) => bildeUrl(bilde, 1200, 630 / 1200);

const klient = createClient({ ...sanityProsjekt, apiVersion: '2025-02-19', useCdn: false, perspective: 'published' });

const SPORRING = `{
  "artikler": *[_type == "artikkel" && defined(slug.current) && defined(seksjon) && defined(tittel)]
    | order(coalesce(publisert, _createdAt) desc) {
      "slug": slug.current, seksjon, sted, tittel, ingress, kilde, pressemelding,
      "publisert": coalesce(publisert, _createdAt), oppdatert,
      "skribent": skribent->navn,
      "hovedbilde": hovedbilde{..., "kildeKreditering": asset->creditLine},
      hovedvideo,
      "brodtekst": brodtekst[]{..., _type == "bilde" => {"kildeKreditering": asset->creditLine}}
    },
  "forside": *[_id == "forside"][0] {
    "hovedsak": hovedsak->slug.current,
    "treSaker": treSaker[]->slug.current,
    "bildesaker": bildesaker[]->slug.current,
    morgenbrief
  }
}`;

// ---------- Henting ----------

const gyldigSeksjon = (s: string): s is SeksjonSlug => seksjoner.some((x) => x.slug === s);

interface Innhold {
  kilde: 'sanity' | 'test';
  artikler: Artikkel[];
  forside: Forsideoppsett;
}

async function hent(): Promise<Innhold> {
  const testsett: Innhold = { kilde: 'test', artikler: test.artikler, forside: test.forside };
  if (process.env.SANITY_OFFLINE === '1') {
    console.log('[innhold] SANITY_OFFLINE=1 – bruker testinnhold.');
    return testsett;
  }

  // SANITY_TESTDATA=fil.json lar oss prøve malene med et eksempel på svar fra Sanity, uten nett.
  const svar: { artikler: any[]; forside: any } = process.env.SANITY_TESTDATA
    ? JSON.parse(readFileSync(process.env.SANITY_TESTDATA, 'utf8'))
    : await klient.fetch(SPORRING);

  const artikler: Artikkel[] = (svar.artikler ?? [])
    .filter((a) => gyldigSeksjon(a.seksjon))
    .map((a) => ({
      slug: a.slug,
      seksjon: a.seksjon,
      sted: a.sted ?? undefined,
      // Faste regler for linjefall (harde mellomrom der ord hører sammen), se typografi.ts.
      tittel: linjefall(a.tittel.trim()),
      ingress: linjefall((a.ingress ?? '').trim()),
      skribent: a.skribent ?? undefined,
      publisert: a.publisert,
      oppdatert: a.oppdatert ?? undefined,
      // Uten hovedbilde: stillbildet fra hovedvideoen brukes (forside, deling og søk).
      bilde: bildedata(a.hovedbilde) ?? videodata(a.hovedvideo)?.plakat,
      video: videodata(a.hovedvideo),
      kilde: a.kilde ?? undefined,
      pressemelding: a.pressemelding ?? undefined,
      brodtekst: brodtekst(a.brodtekst),
    }));

  // Teksting til videoer: .vtt-filene hentes når nettstedet bygges og legges inn i siden.
  // Replikker uten egen plassering får luft ned til bunnen av bildet (underkant ved 88 % av høyden, Oles ønske 31.10.).
  // Replikker som allerede har line: i filen, beholder sin plassering.
  const luftUnder = (vtt: string) =>
    vtt.replace(/^(\s*(?:\d{2}:)?\d{2}:\d{2}\.\d{3}\s+-->\s+(?:\d{2}:)?\d{2}:\d{2}\.\d{3})([^\r\n]*)$/gm,
      (linje, tid: string, innst: string) => (/\bline:/.test(innst) ? linje : `${tid}${innst} line:88%,end`));
  const videoer = artikler.flatMap((a) => [a.video, ...a.brodtekst.map((b) => (b.type === 'video' ? b.video : undefined))])
    .filter((v): v is NonNullable<typeof v> => !!v?.tekstingUrl);
  await Promise.all(videoer.map(async (v) => {
    try {
      const r = await fetch(v.tekstingUrl!);
      const tekst = r.ok ? await r.text() : '';
      if (tekst.trim().startsWith('WEBVTT')) v.teksting = luftUnder(tekst);
      else console.warn(`[innhold] Tekstingen ${v.tekstingUrl} er ikke en gyldig .vtt-fil – hoppes over.`);
    } catch (e) {
      console.warn(`[innhold] Fikk ikke hentet tekstingen ${v.tekstingUrl} – videoen vises uten.`);
    }
  }));

  if (artikler.length === 0) {
    console.log('[innhold] Ingen publiserte artikler i Sanity ennå – bruker testinnhold.');
    return testsett;
  }
  console.log(`[innhold] Hentet ${artikler.length} artikler fra Sanity.`);

  const finnes = (slug?: string | null): slug is string => !!slug && artikler.some((a) => a.slug === slug);
  const f = svar.forside;
  const mb = f?.morgenbrief ?? {};

  // Standard er automatikk: nyeste sak øverst, de neste under. Det redaksjonen har valgt i
  // forsideoppsettet, overstyrer plassen sin; tomme plasser fylles med de nyeste sakene som ikke
  // allerede står på forsiden.
  const brukt = new Set<string>();
  const nesteNyeste = () => artikler.find((a) => !brukt.has(a.slug))?.slug;
  const valgt = (liste: (string | null)[] | null | undefined) =>
    (liste ?? []).filter(finnes).filter((s, i, alle) => alle.indexOf(s) === i);

  const valgtHoved = finnes(f?.hovedsak) ? f.hovedsak : undefined;
  const valgteTre = valgt(f?.treSaker).filter((s) => s !== valgtHoved).slice(0, 3);
  const valgteBilde = valgt(f?.bildesaker).filter((s) => s !== valgtHoved && !valgteTre.includes(s)).slice(0, 3);
  [valgtHoved, ...valgteTre, ...valgteBilde].forEach((s) => s && brukt.add(s));

  const fyll = (valgte: string[], antall: number) => {
    const ut = [...valgte];
    while (ut.length < antall) {
      const s = nesteNyeste();
      if (!s) break;
      brukt.add(s);
      ut.push(s);
    }
    return ut;
  };
  const hovedsak = valgtHoved ?? fyll([], 1)[0];
  const forside: Forsideoppsett = {
    hovedsak,
    treSaker: fyll(valgteTre, 3),
    bildesaker: fyll(valgteBilde, 3),
    morgenbrief: {
      tittel: linjefall(mb.tittel || test.forside.morgenbrief.tittel),
      tekst: linjefall(mb.tekst || test.forside.morgenbrief.tekst),
      knapp: mb.knapp || test.forside.morgenbrief.knapp,
    },
  };

  return { kilde: 'sanity', artikler, forside };
}

// Hentes én gang per bygg og deles av alle sidene.
let lagret: Promise<Innhold> | undefined;
export function hentInnhold(): Promise<Innhold> {
  lagret ??= hent();
  return lagret;
}

export async function hentArtikler(): Promise<Artikkel[]> {
  return (await hentInnhold()).artikler;
}

export function artikkelUrl(a: Pick<Artikkel, 'seksjon' | 'slug'>): string {
  return `/${a.seksjon}/${a.slug}/`;
}
