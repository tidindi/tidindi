import type { StructureResolver } from 'sanity/structure';
import { seksjoner } from '../src/data/seksjoner';

const API = '2025-02-19';
const nyesteForst = [{ field: 'publisert', direction: 'desc' as const }];

// Menyen i Studio: Forsiden øverst, deretter artiklene (alle og per seksjon), så skribenter.
export const struktur: StructureResolver = (S) =>
  S.list()
    .title('Tidindi')
    .items([
      S.listItem()
        .title('Forsiden')
        .id('forside')
        .schemaType('forside')
        .child(S.document().schemaType('forside').documentId('forside').title('Forsiden')),
      S.divider(),
      S.listItem()
        .title('Alle artikler')
        .schemaType('artikkel')
        .child(S.documentTypeList('artikkel').title('Alle artikler').defaultOrdering(nyesteForst)),
      ...seksjoner.map((s) =>
        S.listItem()
          .title(s.navn)
          .id(`seksjon-${s.slug}`)
          .schemaType('artikkel')
          .child(
            S.documentList()
              .title(s.navn)
              .apiVersion(API)
              .schemaType('artikkel')
              .filter('_type == "artikkel" && seksjon == $seksjon')
              .params({ seksjon: s.slug })
              .defaultOrdering(nyesteForst)
              .initialValueTemplates([S.initialValueTemplateItem(`artikkel-${s.slug}`)]),
          ),
      ),
      S.divider(),
      S.documentTypeListItem('skribent').title('Skribenter'),
    ]);
