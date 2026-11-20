// Felles hjelpere for innholdsmodellen.

// Lager lesbare URL-er av titler: «Tittel på saken» → «tittel-pa-saken».
export function lagSlug(tekst: string): string {
  return tekst
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
    .replace(/-+$/g, '');
}

// Felt som hører til alle bilder: alternativ tekst (påkrevd), bildetekst og kreditering.
export const bildefelt = [
  {
    name: 'alt',
    title: 'Alternativ tekst',
    type: 'string',
    description: 'Beskriv hva bildet viser, for lesere som ikke ser det. Påkrevd for universell utforming.',
    // Påkrevd bare når et bilde faktisk er lastet opp. Uten dette slår kravet til på tomme
    // bildefelt (f.eks. stillbildet under Hovedvideo), fordi avkrysningsfeltene kan ha verdi uten bilde.
    validation: (R: any) =>
      R.custom((verdi: any, ctx: any) =>
        !ctx.parent?.asset || (typeof verdi === 'string' && verdi.trim()) ? true : 'Bildet må ha alternativ tekst.'),
  },
  {
    name: 'bildetekst',
    title: 'Bildetekst',
    type: 'text',
    rows: 2,
  },
  {
    name: 'sortHvitt',
    title: 'Vis i sort-hvitt',
    type: 'boolean',
    description: 'Tidindi viser bilder i farger. Kryss av for å vise dette bildet i sort-hvitt.',
  },
  {
    // Utgått: fra da sort-hvitt var standard. Beholdes skjult så eldre bilder ikke får varsel om ukjent felt.
    name: 'farger',
    title: 'Vis i farger (utgått)',
    type: 'boolean',
    hidden: true,
  },
  {
    name: 'kreditering',
    title: 'Foto',
    type: 'string',
    description: 'Fotograf og eventuelt byrå, f.eks. «Ola Nordmann / NTB». Står feltet tomt for et bilde fra Unsplash, krediteres fotografen automatisk («Navn / Unsplash»).',
  },
];

// Formatvalg for bilder som vises i artikkelen (hovedbilde og bilder i brødteksten).
// Ingen startverdi: tomt felt betyr liggende. (En startverdi lager et bildeobjekt uten bilde i tomme felt.)
export const formatfelt = {
  name: 'format',
  title: 'Format i artikkelen',
  type: 'string',
  description: 'Standard er liggende. Velg et annet format når bildet tåler beskjæringen dårlig. Gjelder bare i artikkelen – på forsiden, i seksjonene og ved deling beskjæres bildet alltid liggende rundt fokuspunktet. «Hele bildet» viser utsnittet du har valgt med blyanten, uten ny beskjæring.',
  options: {
    list: [
      { title: 'Liggende (standard)', value: 'liggende' },
      { title: 'Hele bildet, uten beskjæring', value: 'hele' },
      { title: 'Stående (4:5)', value: 'staaende' },
      { title: 'Kvadratisk (1:1)', value: 'kvadrat' },
    ],
    layout: 'radio',
  },
};

export const bildefeltMedFormat = [...bildefelt.slice(0, 3), formatfelt, ...bildefelt.slice(3)];
