// Format for bilder i artikkelen. Liggende er standard. Redaktøren kan velge et annet format per bilde
// i Studio (feltet «Format i artikkelen»). Forsiden, seksjonssidene og delingsbildet bruker alltid
// liggende format, beskåret rundt fokuspunktet, så rutenettet holder seg likt.
// Brukes både av nettstedet og av forhåndsvisningen i Studio.

export type Bildeformat = 'liggende' | 'hele' | 'staaende' | 'kvadrat';

/** Høyde delt på bredde for utsnittet som er valgt i Studio (blyanten), eller hele bildet uten utsnitt.
 *  Leses fra referansen til bildefilen, som har formen image-<id>-<bredde>x<høyde>-<filtype>. */
export function naturligForhold(sanity: any): number | undefined {
  const m = /-(\d+)x(\d+)-[a-z0-9]+$/i.exec(sanity?.asset?._ref ?? '');
  if (!m) return undefined;
  const c = sanity.crop ?? {};
  const b = Number(m[1]) * (1 - (c.left ?? 0) - (c.right ?? 0));
  const h = Number(m[2]) * (1 - (c.top ?? 0) - (c.bottom ?? 0));
  return b > 0 && h > 0 ? h / b : undefined;
}

/** Forholdet (høyde/bredde) bildet skal ha i artikkelen. `standard` er det liggende formatet på plassen. */
export function artikkelforhold(bilde: { sanity?: unknown; format?: Bildeformat } | undefined, standard: number): number {
  switch (bilde?.format) {
    case 'staaende': return 5 / 4;
    case 'kvadrat': return 1;
    case 'hele': return naturligForhold(bilde.sanity) ?? standard;
    default: return standard;
  }
}

/** Bilder som ikke er liggende, gjøres så smale at hele bildet får plass i høyden på skjermen.
 *  Gir bredden som CSS-verdi, eller undefined for vanlig full bredde. */
export function smalBredde(bilde: { format?: Bildeformat } | undefined, forhold: number, hoyde = '75vh'): string | undefined {
  if (!bilde?.format || bilde.format === 'liggende') return undefined;
  return `min(100%, calc(${hoyde} * ${+(1 / forhold).toFixed(4)}))`;
}
