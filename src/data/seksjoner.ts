// Magasinets faste seksjoner. Rekkefølgen her er rekkefølgen i menyen.
export const seksjoner = [
  { slug: 'samfunnet', navn: 'Samfunnet' },
  { slug: 'pengene', navn: 'Pengene' },
  { slug: 'sporten', navn: 'Sporten' },
  { slug: 'kulturen', navn: 'Kulturen' },
  { slug: 'verden', navn: 'Verden' },
] as const;

export type SeksjonSlug = (typeof seksjoner)[number]['slug'];

export function seksjonsnavn(slug: string): string {
  return seksjoner.find((s) => s.slug === slug)?.navn ?? slug;
}
