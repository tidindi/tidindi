import { defineArrayMember, defineField, defineType } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { seksjoner } from '../../src/data/seksjoner';
import { bildefelt, lagSlug } from './felles';

export const artikkel = defineType({
  name: 'artikkel',
  title: 'Artikkel',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'sak', title: 'Saken', default: true },
    { name: 'detaljer', title: 'Kilde og detaljer' },
  ],
  fields: [
    defineField({
      name: 'seksjon',
      title: 'Seksjon',
      type: 'string',
      group: 'sak',
      options: { list: seksjoner.map((s) => ({ title: s.navn, value: s.slug })), layout: 'radio', direction: 'horizontal' },
      validation: (R) => R.required().error('Velg en seksjon.'),
    }),
    defineField({
      name: 'tittel',
      title: 'Tittel',
      type: 'string',
      group: 'sak',
      validation: (R) => [
        R.required().error('Artikkelen må ha en tittel.'),
        R.max(110).warning('Lange titler blir tunge på forsiden. Prøv å holde deg under 110 tegn.'),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Adresse (URL)',
      type: 'slug',
      group: 'sak',
      description: 'Lages av tittelen med «Generer». Bør ikke endres etter at saken er publisert, for da slutter gamle lenker å virke.',
      options: { source: 'tittel', slugify: lagSlug, maxLength: 90 },
      validation: (R) => R.required().error('Trykk «Generer» for å lage adressen.'),
    }),
    defineField({
      name: 'sted',
      title: 'Sted',
      type: 'string',
      group: 'sak',
    }),
    defineField({
      name: 'ingress',
      title: 'Ingress',
      type: 'text',
      rows: 3,
      group: 'sak',
      validation: (R) => [
        R.required().error('Artikkelen må ha en ingress.'),
        R.max(300).warning('Ingressen bør være kort – én til to setninger.'),
      ],
    }),
    defineField({
      name: 'hovedbilde',
      title: 'Hovedbilde',
      type: 'image',
      group: 'sak',
      description: 'Vises i sort-hvitt på nettstedet. Velg utsnitt og fokuspunkt med blyanten. Bildet beskjæres til 16:9 på forsiden, 16:8 i artikkelen og 3:2 som bildesak. Kan stå tomt når saken har hovedvideo – da brukes videoen (eller stillbildet til videoen) som illustrasjon.',
      options: { hotspot: true },
      fields: bildefelt,
      validation: (R) => R.custom((verdi: any, ctx: any) =>
        verdi?.asset || ctx.document?.hovedvideo?.fil?.asset ? true : 'Saken må ha et hovedbilde eller en hovedvideo – det vises på forsiden.'),
    }),
    defineField({
      name: 'hovedvideo',
      title: 'Hovedvideo (valgfritt)',
      type: 'object',
      group: 'sak',
      description: 'Vises øverst i artikkelen. Saken trenger da ikke hovedbilde: videoen blir hovedillustrasjonen. Legg gjerne inn et stillbilde – det brukes på forsiden og når saken deles. Selve saken skriver du i feltet «Brødtekst» rett under.',
      options: { collapsible: true, collapsed: true },
      fieldsets: [{ name: 'mer', title: 'Tittel, byline, teksting og vignett', options: { collapsible: true, collapsed: true } }],
      fields: [
            defineField({ name: 'fil', title: 'Videofil', type: 'file', options: { accept: 'video/mp4,video/webm,video/quicktime' }, description: 'MP4 (H.264) anbefales. Hold filen under ca. 100 MB – helst 1080p og kort.', }),
            defineField({ name: 'plakat', title: 'Stillbilde før avspilling', type: 'image', options: { hotspot: true }, fields: bildefelt, description: 'Valgfritt. Vises før videoen startes.' }),
            defineField({ name: 'tekst', title: 'Videotekst', type: 'text', rows: 2 }),
            defineField({ name: 'kreditering', title: 'Video', type: 'string', description: 'Fotograf eller kilde, f.eks. «Ola Nordmann / NTB».' }),
            defineField({ name: 'staende', title: 'Stående video (mobilformat)', type: 'boolean', fieldset: 'mer', initialValue: false }),
            defineField({ name: 'tittel', title: 'Tittel i videoen', type: 'string', fieldset: 'mer', description: 'Valgfritt. Kort tittel som vises nede i bildet de første sekundene.', validation: (R: any) => R.max(70).warning('Hold tittelen kort – den skal leses på et par sekunder.') }),
            defineField({ name: 'byline', title: 'Byline i videoen', type: 'string', fieldset: 'mer', description: 'Valgfritt, f.eks. «Ole Asbjørn Winther / Tidindi».' }),
            defineField({ name: 'teksting', title: 'Teksting (.vtt)', type: 'file', fieldset: 'mer', options: { accept: '.vtt,text/vtt' }, description: 'Valgfritt. Tekstfil i WebVTT-format. Vises automatisk – mange ser video uten lyd.' }),
            defineField({ name: 'vignett', title: 'Vis Tidindi-vignett og sluttmerke', type: 'boolean', fieldset: 'mer', initialValue: true, description: 'Vignetten legges oppå videoens første sekunder, og sluttmerket oppå de to siste.' }),
          ],
    }),
    defineField({
      name: 'brodtekst',
      title: 'Brødtekst',
      type: 'array',
      group: 'sak',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Avsnitt', value: 'normal' },
            { title: 'Mellomtittel', value: 'h2' },
          ],
          lists: [{ title: 'Punktliste', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Fet', value: 'strong' },
              { title: 'Kursiv', value: 'em' },
            ],
            annotations: [
              {
                name: 'lenke',
                title: 'Lenke',
                type: 'object',
                fields: [
                  {
                    name: 'href',
                    title: 'Adresse',
                    type: 'url',
                    validation: (R: any) => R.required().uri({ scheme: ['http', 'https', 'mailto'], allowRelative: true }),
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          name: 'sitat',
          title: 'Sitat',
          type: 'object',
          fields: [
            defineField({ name: 'tekst', title: 'Sitat', type: 'text', rows: 3, description: 'Uten anførselstegn – de legges til automatisk.', validation: (R) => R.required() }),
            defineField({ name: 'kilde', title: 'Hvem sier det', type: 'string', description: 'Navn og tittel.' }),
          ],
          preview: { select: { title: 'tekst', subtitle: 'kilde' }, prepare: ({ title, subtitle }) => ({ title: `«${title ?? ''}»`, subtitle: subtitle ? `Sitat · ${subtitle}` : 'Sitat' }) },
        }),
        defineArrayMember({
          name: 'faktaboks',
          title: 'Faktaboks',
          type: 'object',
          fields: [
            defineField({ name: 'tittel', title: 'Tittel', type: 'string', fieldset: 'mer', initialValue: 'Fakta' }),
            defineField({ name: 'punkter', title: 'Punkter', type: 'array', of: [{ type: 'text', rows: 2 }], validation: (R) => R.min(1) }),
            defineField({ name: 'merknad', title: 'Tekst under punktene', type: 'text', rows: 2, description: 'Valgfritt. For eksempel kilder eller en kort merknad. Vises i mindre tekst nederst i faktaboksen.' }),
          ],
          preview: { select: { title: 'tittel', punkter: 'punkter' }, prepare: ({ title, punkter }) => ({ title: title || 'Fakta', subtitle: `Faktaboks · ${punkter?.length ?? 0} punkter` }) },
        }),
        defineArrayMember({
          name: 'bilde',
          title: 'Bilde',
          type: 'image',
          options: { hotspot: true },
          fields: bildefelt,
        }),
        defineArrayMember({
          name: 'video',
          title: 'Video',
          type: 'object',
          fieldsets: [{ name: 'mer', title: 'Tittel, byline, teksting og vignett', options: { collapsible: true, collapsed: true } }],
          fields: [
            defineField({ name: 'fil', title: 'Videofil', type: 'file', options: { accept: 'video/mp4,video/webm,video/quicktime' }, description: 'MP4 (H.264) anbefales. Hold filen under ca. 100 MB – helst 1080p og kort.', validation: (R: any) => R.required().error('Last opp en videofil.') }),
            defineField({ name: 'plakat', title: 'Stillbilde før avspilling', type: 'image', options: { hotspot: true }, fields: bildefelt, description: 'Valgfritt. Vises før videoen startes.' }),
            defineField({ name: 'tekst', title: 'Videotekst', type: 'text', rows: 2 }),
            defineField({ name: 'kreditering', title: 'Video', type: 'string', description: 'Fotograf eller kilde, f.eks. «Ola Nordmann / NTB».' }),
            defineField({ name: 'staende', title: 'Stående video (mobilformat)', type: 'boolean', fieldset: 'mer', initialValue: false }),
            defineField({ name: 'tittel', title: 'Tittel i videoen', type: 'string', fieldset: 'mer', description: 'Valgfritt. Kort tittel som vises nede i bildet de første sekundene.', validation: (R: any) => R.max(70).warning('Hold tittelen kort – den skal leses på et par sekunder.') }),
            defineField({ name: 'byline', title: 'Byline i videoen', type: 'string', fieldset: 'mer', description: 'Valgfritt, f.eks. «Ole Asbjørn Winther / Tidindi».' }),
            defineField({ name: 'teksting', title: 'Teksting (.vtt)', type: 'file', fieldset: 'mer', options: { accept: '.vtt,text/vtt' }, description: 'Valgfritt. Tekstfil i WebVTT-format. Vises automatisk – mange ser video uten lyd.' }),
            defineField({ name: 'vignett', title: 'Vis Tidindi-vignett og sluttmerke', type: 'boolean', fieldset: 'mer', initialValue: true, description: 'Vignetten legges oppå videoens første sekunder, og sluttmerket oppå de to siste.' }),
          ],
          preview: { select: { title: 'tekst', fil: 'fil.asset.originalFilename' }, prepare: ({ title, fil }: any) => ({ title: title || fil || 'Video', subtitle: 'Video' }) },
        }),
      ],
    }),
    defineField({
      name: 'skribent',
      title: 'Skribent',
      type: 'reference',
      group: 'sak',
      to: [{ type: 'skribent' }],
    }),

    defineField({
      name: 'kilde',
      title: 'Kilde',
      type: 'string',
      group: 'detaljer',
      description: 'Hvor opplysningene kommer fra, f.eks. «Statistisk sentralbyrå» eller «NTB».',
    }),
    defineField({
      name: 'pressemelding',
      title: 'Bygger på pressemelding fra',
      type: 'string',
      group: 'detaljer',
      description: 'Valgfritt – fyll inn når det passer å opplyse om det. Vises som «Saken bygger på en pressemelding fra …» nederst i saken.',
    }),
    defineField({
      name: 'emneknagger',
      title: 'Emneknagger',
      type: 'array',
      group: 'detaljer',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'publisert',
      title: 'Publisert',
      type: 'datetime',
      group: 'detaljer',
      description: 'Settes automatisk første gang du publiserer.',
      options: { timeStep: 5 },
    }),
    defineField({
      name: 'oppdatert',
      title: 'Oppdatert',
      type: 'datetime',
      group: 'detaljer',
      description: 'Fyll inn når du gjør en vesentlig endring i en publisert sak. Vises som «Oppdatert» i artikkelen.',
      options: { timeStep: 5 },
    }),
  ],
  orderings: [
    { title: 'Nyeste først', name: 'nyeste', by: [{ field: 'publisert', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'tittel', seksjon: 'seksjon', publisert: 'publisert', media: 'hovedbilde' },
    prepare({ title, seksjon, publisert, media }) {
      const navn = seksjoner.find((s) => s.slug === seksjon)?.navn ?? 'Uten seksjon';
      const tid = publisert
        ? new Date(publisert).toLocaleString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' })
        : 'Ikke publisert';
      return { title: title || 'Uten tittel', subtitle: `${navn} · ${tid}`, media };
    },
  },
});
