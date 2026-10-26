// Gjør om innhold fra Sanity (Portable Text) til blokkene malene viser.
// Brukes både når nettstedet bygges og i forhåndsvisningen i Studio, så de alltid viser det samme.
// Ingen avhengigheter til Node eller nettleser.

import type { Blokk, Bildedata, Videodata } from './testinnhold';

// Sanity-prosjektet videofilene ligger i (offentlig CDN-adresse).
const FILER = 'https://cdn.sanity.io/files/1ld4ddgo/production/';

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

// Kreditering fra bildekilden (f.eks. Unsplash: «Navn by Unsplash» → «Navn / Unsplash»).
// Brukes bare når «Foto»-feltet står tomt.
function kildekreditering(linje?: string): string | undefined {
  if (!linje) return undefined;
  return linje.replace(/\s+by\s+Unsplash$/i, ' / Unsplash').trim() || undefined;
}

export function bildedata(bilde: any): Bildedata | undefined {
  if (!bilde?.asset?._ref) return undefined;
  return { sanity: bilde, alt: bilde.alt ?? '', tekst: bilde.bildetekst, kreditering: bilde.kreditering || kildekreditering(bilde.kildeKreditering), farger: !!bilde.farger };
}

// Videofil fra Sanity: referansen «file-<id>-<filtype>» blir til adressen på Sanitys CDN.
// Bygges fra referansen, så forhåndsvisningen i Studio virker også før saken er publisert.
export function filUrl(fil: any): string | undefined {
  const ref: unknown = fil?.asset?._ref;
  if (typeof ref !== 'string') return undefined;
  const m = ref.match(/^file-([a-z0-9]+)-([a-z0-9]+)$/i);
  return m ? `${FILER}${m[1]}.${m[2]}` : undefined;
}

export function videodata(v: any): Videodata | undefined {
  const url = filUrl(v?.fil);
  if (!url) return undefined;
  return {
    url,
    plakat: bildedata(v.plakat),
    tekst: v.tekst || undefined,
    kreditering: v.kreditering || undefined,
    staende: !!v.staende,
    farger: !!v.farger,
    vignett: v.vignett !== false,
    tittel: v.tittel || undefined,
    byline: v.byline || undefined,
    tekstingUrl: filUrl(v.teksting),
  };
}

export function brodtekst(innhold: any[] | null | undefined): Blokk[] {
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
      ut.push({ type: 'fakta', tittel: b.tittel, punkter: (b.punkter ?? []).filter(Boolean), merknad: b.merknad?.trim() || undefined });
    } else if (b._type === 'bilde') {
      const bilde = bildedata(b);
      if (bilde) ut.push({ type: 'bilde', bilde });
    } else if (b._type === 'video') {
      const video = videodata(b);
      if (video) ut.push({ type: 'video', video });
    }
  }
  return ut;
}

