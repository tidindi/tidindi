import { defineArrayMember, defineField, defineType } from 'sanity';
import { HomeIcon } from '@sanity/icons/Home';

// Forsideoppsettet – ett enkelt dokument. «Siste» står ikke her: den fylles automatisk.
export const forside = defineType({
  name: 'forside',
  title: 'Forsiden',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'hovedsak',
      title: 'Hovedsak',
      type: 'reference',
      to: [{ type: 'artikkel' }],
      description: 'Saken øverst på forsiden. Står til du bytter den ut.',
      validation: (R) => R.required().error('Velg en hovedsak.'),
    }),
    defineField({
      name: 'treSaker',
      title: 'Tre saker',
      type: 'array',
      description: 'Radene under hovedsaken. Dra for å endre rekkefølgen.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'artikkel' }] })],
      validation: (R) => R.max(3).unique(),
    }),
    defineField({
      name: 'bildesaker',
      title: 'Bildesaker',
      type: 'array',
      description: 'Tre saker med bilde nederst på forsiden. Dra for å endre rekkefølgen.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'artikkel' }] })],
      validation: (R) => R.max(3).unique(),
    }),
    defineField({
      name: 'morgenbrief',
      title: 'Morgenbrief-rammen',
      type: 'object',
      description: 'Den gule rammen som presenterer Tidindi Morgenbrief.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'tittel', title: 'Overskrift', type: 'string', initialValue: 'Få et forsprang fra du står opp' }),
        defineField({
          name: 'tekst',
          title: 'Tekst',
          type: 'text',
          rows: 5,
          initialValue:
            'Den kuraterte morgenbriefen fra Tidindi gir deg mer innsikt fra mindre scrolling. Du får en oppsummering av hva som skiller seg ut i dagens nyhetsbilde, dagens ord, lenke til de ti viktigste sakene fra norske og internasjonale medier og tips til hva du bør følge med på. Bedrifter kan bestille sanntidsvarsling gjennom Tidindi Varde.',
        }),
        defineField({ name: 'knapp', title: 'Tekst på knappen', type: 'string', initialValue: 'Se mer her' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Forsiden' }) },
});
