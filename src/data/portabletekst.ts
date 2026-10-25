// Gjør om innhold fra Sanity (Portable Text) til blokkene malene viser.
// Brukes både når nettstedet bygges og i forhåndsvisningen i Studio, så de alltid viser det samme.
// Ingen avhengigheter til Node eller nettleser.

import type { Blokk, Bildedata } from './testinnhold';

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

export function bildedata(bilde: any): Bildedata | undefined {
  if (!bilde?.asset?._ref) return undefined;
  return { sanity: bilde, alt: bilde.alt ?? '', tekst: bilde.bildetekst, kreditering: bilde.kreditering };
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
    }
  }
  return ut;
}

