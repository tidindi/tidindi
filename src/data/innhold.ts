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

export type { Artikkel, Blokk, Bildedata, Forsideoppsett } from './testinnhold';

export const sanityProsjekt = { projectId: '1ld4ddgo', dataset: 'production' };

const bildebygger = createImageUrlBuilder(sanityProsjekt);

/** Adresse til et Sanity-bilde beskåret til gitt bredde og forhold (høyde/bredde) rundt fokuspunktet.
 *  Alle bilder vises i sort-hvitt (Tidindis bildeprofil). Originalen i Sanity beholdes i farger. */
export function bildeUrl(bilde: Bildedata | undefined, bredde: number, forhold: number): string | undefined {
  if (!bilde) return undefined;
  if (!bilde.sanity) return bilde.src;
  return bildebygger.image(bilde.sanity as any).width(bredde).height(Math.round(bredde * forhold)).fit('crop').saturation(-100).auto('format').quality(80).url();
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
      tittel: a.tittel,
      ingress: a.ingress ?? '',
      skribent: a.skribent ?? undefined,
      publisert: a.publisert,
      oppdatert: a.oppdatert ?? undefined,
      bilde: bildedata(a.hovedbilde),
      video: videodata(a.hovedvideo),
      kilde: a.kilde ?? undefined,
      pressemelding: a.pressemelding ?? undefined,
      brodtekst: brodtekst(a.brodtekst),
    }));

  if (artikler.length === 0) {
    console.log('[innhold] Ingen publiserte artikler i Sanity ennå – bruker testinnhold.');
    return testsett;
  }
  console.log(`[innhold] Hentet ${artikler.length} artikler fra Sanity.`);

  const finnes = (slug?: string | null): slug is string => !!slug && artikler.some((a) => a.slug === slug);
  const f = svar.forside;
  const mb = f?.morgenbrief ?? {};

  let forside: Forsideoppsett;
  if (f) {
    forside = {
      hovedsak: finnes(f.hovedsak) ? f.hovedsak : artikler[0].slug,
      treSaker: (f.treSaker ?? []).filter(finnes),
      bildesaker: (f.bildesaker ?? []).filter(finnes),
      morgenbrief: {
        tittel: mb.tittel || test.forside.morgenbrief.tittel,
        tekst: mb.tekst || test.forside.morgenbrief.tekst,
        knapp: mb.knapp || test.forside.morgenbrief.knapp,
      },
    };
  } else {
    // Forsiden er ikke satt opp ennå: nyeste sak øverst, de neste under.
    const [forste, ...resten] = artikler;
    forside = {
      hovedsak: forste.slug,
      treSaker: resten.slice(0, 3).map((a) => a.slug),
      bildesaker: resten.slice(3, 6).map((a) => a.slug),
      morgenbrief: test.forside.morgenbrief,
    };
  }

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
