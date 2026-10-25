// Magasinets faste seksjoner. Rekkefølgen her er rekkefølgen i menyen.
export const seksjoner = [
  { slug: 'samfunnet', navn: 'Samfunnet', beskrivelse: 'Nyheter om makt- og samfunnsutvikling i Norge og internasjonalt. Innsikt i beslutningene og kreftene som former vår tid.' },
  { slug: 'pengene', navn: 'Pengene', beskrivelse: 'Fra privatøkonomi til næringsliv og globale markeder. Tidindi velger ut økonominyhetene og bevegelsene som påvirker oss alle.' },
  { slug: 'sporten', navn: 'Sporten', beskrivelse: 'Sportsnyheter, prestasjoner og begivenheter fra Norge og verden. Utvalgte historier som fortjener oppmerksomhet.' },
  { slug: 'kulturen', navn: 'Kulturen', beskrivelse: 'Aktuelle saker fra kunst, musikk, film og kulturliv. Tidindi løfter frem hendelser, mennesker og uttrykk som preger kulturen.' },
  { slug: 'verden', navn: 'Verden', beskrivelse: 'Internasjonale nyheter og verdenshendelser. Tidindi velger ut og setter søkelys på begivenhetene som preger verden rundt oss.' },
] as const;

export type SeksjonSlug = (typeof seksjoner)[number]['slug'];

// Beskrivelse for søkemotorer og deling (meta description) på seksjonssiden.
export function seksjonsbeskrivelse(slug: string): string | undefined {
  return seksjoner.find((s) => s.slug === slug)?.beskrivelse;
}

export function seksjonsnavn(slug: string): string {
  return seksjoner.find((s) => s.slug === slug)?.navn ?? slug;
}
