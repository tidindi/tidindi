import { defineField, defineType } from 'sanity';
import { UserIcon } from '@sanity/icons/User';

export const skribent = defineType({
  name: 'skribent',
  title: 'Skribent',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({ name: 'navn', title: 'Navn', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'tittel', title: 'Tittel', type: 'string', description: 'F.eks. «Journalist» eller «Ansvarlig redaktør».' }),
    defineField({ name: 'bilde', title: 'Bilde', type: 'image', options: { hotspot: true } }),
  ],
  preview: { select: { title: 'navn', subtitle: 'tittel', media: 'bilde' } },
});
