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
import type { Artikkel, Blokk, Bildedata, Forsideoppsett } from './testinnhold';

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
      hovedbilde, brodtekst
    },
  "forside": *[_id == "forside"][0] {
    "hovedsak": hovedsak->slug.current,
    "treSaker": treSaker[]->slug.current,
    "bildesaker": bildesaker[]->slug.current,
    morgenbrief
  }
}`;

// ---------- Brødtekst (Portable Text) → blokkene malen kan vise ----------

const esc = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function tryggLenke(href: unknown): string | null {
  if (typeof href !== 'string') return null;
  const h = href.trim();
  if (/^(https?:|mailto:)/i.test(h) || h.startsWith('/')) return h;
  return null;
}

// Gjør om ett tekstavsnitt til HTML: fet, kursiv og lenker. All tekst escapes.
function avsnittHtml(blokk: any): string {
  const lenker = new Map<string, string | null>(
    (blokk.markDefs ?? []).filter((m: any) => m._type === 'lenke').map((m: any) => [m._key, tryggLenke(m.href)]),
  );
  return (blokk.children ?? [])
    .map((barn: any) => {
      let html = esc(String(barn.text ?? '')).replace(/\n/g, '<br>');
      for (const mark of barn.marks ?? []) {
        if (mark === 'strong') html = `<strong>${html}</strong>`;
        else if (mark === 'em') html = `<em>${html}</em>`;
        else if (lenker.has(mark)) {
          const href = lenker.get(mark);
          if (href) {
            const ekstern = /^https?:/i.test(href) && !href.includes('tidindi.no');
            html = `<a href="${esc(href)}"${ekstern ? ' rel="noopener"' : ''}>${html}</a>`;
          }
        }
      }
      return html;
    })
    .join('');
}

const rentekst = (blokk: any) => (blokk.children ?? []).map((b: any) => b.text ?? '').join('');

function bildedata(bilde: any): Bildedata | undefined {
  if (!bilde?.asset?._ref) return undefined;
  return { sanity: bilde, alt: bilde.alt ?? '', tekst: bilde.bildetekst, kreditering: bilde.kreditering };
}

function brodtekst(innhold: any[] | null | undefined): Blokk[] {
  const ut: Blokk[] = [];
  for (const b of innhold ?? []) {
    if (b._type === 'block') {
      if (b.listItem) {
        const forrige = ut[ut.length - 1];
        const punkt = avsnittHtml(b);
        if (forrige?.type === 'liste') forrige.punkter.push(punkt);
        else ut.push({ type: 'liste', punkter: [punkt] });
      } else if (b.style === 'h2') {
        const tekst = rentekst(b).trim();
        if (tekst) ut.push({ type: 'mellomtittel', tekst });
      } else {
        const html = avsnittHtml(b);
        if (rentekst(b).trim()) ut.push({ type: 'avsnitt', html });
      }
    } else if (b._type === 'sitat' && b.tekst) {
      ut.push({ type: 'sitat', tekst: b.tekst, kilde: b.kilde });
    } else if (b._type === 'faktaboks') {
      ut.push({ type: 'fakta', tittel: b.tittel, punkter: (b.punkter ?? []).filter(Boolean) });
    } else if (b._type === 'bilde') {
      const bilde = bildedata(b);
      if (bilde) ut.push({ type: 'bilde', bilde });
    }
  }
  return ut;
}

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
