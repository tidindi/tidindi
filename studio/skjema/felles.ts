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
    validation: (R: any) => R.required().error('Bildet må ha alternativ tekst.'),
  },
  {
    name: 'bildetekst',
    title: 'Bildetekst',
    type: 'text',
    rows: 2,
  },
  {
    name: 'farger',
    title: 'Vis i farger',
    type: 'boolean',
    initialValue: false,
    description: 'Tidindi viser bilder i sort-hvitt. Kryss av for å beholde fargene på dette bildet.',
  },
  {
    name: 'kreditering',
    title: 'Foto',
    type: 'string',
    description: 'Fotograf og eventuelt byrå, f.eks. «Ola Nordmann / NTB». Står feltet tomt for et bilde fra Unsplash, krediteres fotografen automatisk («Navn / Unsplash»).',
  },
];
