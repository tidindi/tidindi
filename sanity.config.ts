import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { nbNOLocale } from '@sanity/locale-nb-no';
import { artikkel } from './studio/skjema/artikkel';
import { skribent } from './studio/skjema/skribent';
import { forside } from './studio/skjema/forside';
import { struktur, standardvisning } from './studio/struktur';
import { medPubliseringstid } from './studio/handlinger';
import { seksjoner } from './src/data/seksjoner';

// Redigeringsverktøyet for Nettmagasinet Tidindi.
// Ligger på /studio på nettstedet. Ingen nøkler her – innlogging skjer med Sanity-kontoen.
export default defineConfig({
  name: 'tidindi',
  title: 'Tidindi',
  projectId: '1ld4ddgo',
  dataset: 'production',
  basePath: '/studio',

  plugins: [structureTool({ structure: struktur, defaultDocumentNode: standardvisning, title: 'Innhold' }), nbNOLocale()],

  schema: {
    types: [artikkel, skribent, forside],
    templates: (standard) => [
      // Forsiden finnes bare én av – den kan ikke opprettes på nytt.
      ...standard.filter((t) => t.schemaType !== 'forside'),
      // «Ny artikkel» inne i en seksjon får seksjonen ferdig utfylt.
      ...seksjoner.map((s) => ({
        id: `artikkel-${s.slug}`,
        title: `Artikkel i ${s.navn}`,
        schemaType: 'artikkel',
        value: { seksjon: s.slug },
      })),
    ],
  },

  document: {
    newDocumentOptions: (standard, { creationContext }) =>
      creationContext.type === 'global'
        ? standard.filter((t) => t.templateId === 'artikkel' || t.templateId === 'skribent')
        : standard.filter((t) => t.templateId !== 'forside'),
    actions: (standard, { schemaType }) => {
      if (schemaType === 'forside') {
        return standard.filter((a) => !['delete', 'duplicate', 'unpublish'].includes(a.action ?? ''));
      }
      if (schemaType === 'artikkel') {
        return standard.map((a) => (a.action === 'publish' ? medPubliseringstid(a) : a));
      }
      return standard;
    },
  },
});
