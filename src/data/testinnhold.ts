// TESTINNHOLD – erstattes av innhold fra Sanity i neste steg.
// Strukturen speiler innholdsmodellen i claude/arkitektur.md, så sidene
// kan kobles til Sanity uten at malene endres.

import type { SeksjonSlug } from './seksjoner';

export type Blokk =
  | { type: 'avsnitt'; tekst: string }
  | { type: 'mellomtittel'; tekst: string }
  | { type: 'sitat'; tekst: string; kilde: string }
  | { type: 'fakta'; tittel?: string; punkter: string[] };

export interface Artikkel {
  slug: string;
  seksjon: SeksjonSlug;
  sted?: string;
  tittel: string;
  ingress: string;
  skribent: string;
  publisert: string; // ISO-tid
  oppdatert?: string;
  bilde?: { src: string; alt: string; tekst?: string; kreditering?: string };
  kilde?: string;
  brodtekst: Blokk[];
}

const standardTekst: Blokk[] = [
  { type: 'avsnitt', tekst: '[Første avsnitt utdyper ingressen: hva som har skjedd, hvem det gjelder, og når. De viktigste opplysningene kommer først, slik leseren får det vesentlige med seg selv om hun bare leser de første linjene.]' },
  { type: 'avsnitt', tekst: '[Andre avsnitt gir detaljene og bakgrunnen leseren trenger for å forstå saken. Her kommer tall, tidslinje og hvem som har ansvaret.]' },
  { type: 'mellomtittel', tekst: '[Mellomtittel]' },
  { type: 'avsnitt', tekst: '[Avsnitt med nye opplysninger, tall eller utsagn fra kilder i saken. Avsnittene holdes korte, slik at teksten er lett å lese på mobil.]' },
  { type: 'sitat', tekst: '[Sitat fra en kilde i saken, gjengitt ordrett.]', kilde: '[Navn, tittel]' },
  { type: 'avsnitt', tekst: '[Avsnitt som følger opp sitatet med mer kontekst og eventuelle motforestillinger fra andre kilder.]' },
  { type: 'mellomtittel', tekst: '[Mellomtittel]' },
  { type: 'avsnitt', tekst: '[Avsnitt om hva som skjer videre: neste steg, frister og beslutninger som er ventet.]' },
  { type: 'fakta', tittel: 'Fakta', punkter: ['[Faktapunkt]', '[Faktapunkt]', '[Faktapunkt]'] },
  { type: 'avsnitt', tekst: '[Avsluttende avsnitt.]' },
];

function sak(
  slug: string,
  seksjon: SeksjonSlug,
  tittel: string,
  ingress: string,
  publisert: string,
  ekstra: Partial<Artikkel> = {},
): Artikkel {
  return {
    slug, seksjon, tittel, ingress, publisert,
    sted: '[Sted]',
    skribent: '[Journalist]',
    kilde: '[Kilde] · [Saken bygger på en pressemelding fra avsender]',
    brodtekst: standardTekst,
    ...ekstra,
  };
}

export const artikler: Artikkel[] = [
  sak('testsak-hovedsak', 'samfunnet',
    '[Hovedsakens overskrift – på to linjer, og den setter dagsorden]',
    '[Ingress i to setninger: hva saken avslører, og hvorfor den betyr noe nå.]',
    '2026-10-24T07:10:00+02:00',
    { bilde: undefined }),
  sak('testsak-pengene-1', 'pengene',
    '[Overskrift som står seg på egen hånd]',
    '[Én setning som forteller hva leseren får.]',
    '2026-10-24T06:45:00+02:00'),
  sak('testsak-verden-1', 'verden',
    '[Overskrift som står seg på egen hånd, også når den går over flere linjer]',
    '[Én setning som forteller hva leseren får.]',
    '2026-10-24T06:20:00+02:00'),
  sak('testsak-kulturen-1', 'kulturen',
    '[Overskrift som står seg på egen hånd]',
    '[Én setning som forteller hva leseren får.]',
    '2026-10-23T21:30:00+02:00'),
  sak('testsak-sporten-1', 'sporten',
    '[Overskrift på en kort nyhetssak]',
    '[Én setning som forteller hva leseren får.]',
    '2026-10-23T20:05:00+02:00'),
  sak('testsak-samfunnet-2', 'samfunnet',
    '[Overskrift på en kort nyhetssak]',
    '[Én setning som forteller hva leseren får.]',
    '2026-10-23T18:40:00+02:00'),
  sak('testsak-pengene-2', 'pengene',
    '[Overskrift på en kort nyhetssak som går over to linjer]',
    '[Én setning som forteller hva leseren får.]',
    '2026-10-23T16:15:00+02:00'),
  sak('testsak-verden-2', 'verden',
    '[Overskrift]',
    '[Én setning som forteller hva leseren får.]',
    '2026-10-23T14:00:00+02:00'),
  sak('testsak-sporten-2', 'sporten',
    '[Overskrift]',
    '[Én setning som forteller hva leseren får.]',
    '2026-10-23T12:30:00+02:00'),
  sak('testsak-kulturen-2', 'kulturen',
    '[Overskrift]',
    '[Én setning som forteller hva leseren får.]',
    '2026-10-23T10:10:00+02:00'),
];

// Forsideoppsettet – i Sanity blir dette ett dokument som redaksjonen styrer.
// «Siste» står ikke her: den fylles automatisk med de nyeste artiklene.
export const forside = {
  hovedsak: 'testsak-hovedsak',
  treSaker: ['testsak-pengene-1', 'testsak-verden-1', 'testsak-kulturen-1'],
  bildesaker: ['testsak-verden-2', 'testsak-sporten-2', 'testsak-kulturen-2'],
  morgenbrief: {
    tittel: 'Få et forsprang fra du står opp',
    tekst: 'Den kuraterte morgenbriefen fra Tidindi gir deg mer innsikt fra mindre scrolling. Du får en oppsummering av hva som skiller seg ut i dagens nyhetsbilde, dagens ord, lenke til de ti viktigste sakene fra norske og internasjonale medier og tips til hva du bør følge med på. Bedrifter kan bestille sanntidsvarsling gjennom Tidindi Varde.',
    knapp: 'Se mer her',
  },
};

export function finnArtikkel(slug: string): Artikkel | undefined {
  return artikler.find((a) => a.slug === slug);
}

export function sisteArtikler(antall = 5): Artikkel[] {
  return [...artikler].sort((a, b) => b.publisert.localeCompare(a.publisert)).slice(0, antall);
}

export function artikkelUrl(a: Pick<Artikkel, 'seksjon' | 'slug'>): string {
  return `/${a.seksjon}/${a.slug}/`;
}
