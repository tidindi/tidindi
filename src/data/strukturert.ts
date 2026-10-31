// Strukturerte data (schema.org, JSON-LD) for søkemotorer. Usynlig for leserne.
// Forteller Google at Tidindi er et nyhetsmedium, og at sakene er nyhetsartikler.
import { utenLinjefall } from './typografi';
import { bildeUrl, artikkelUrl, type Artikkel } from './innhold';
import { seksjonsnavn } from './seksjoner';
import { utgiver } from './utgiver';

const SITE = 'https://tidindi.no';

export const organisasjon = {
  '@type': 'NewsMediaOrganization',
  '@id': `${SITE}/#organisasjon`,
  name: 'Tidindi',
  url: `${SITE}/`,
  logo: { '@type': 'ImageObject', url: `${SITE}/ikon-512.png`, width: 512, height: 512 },
  email: utgiver.epost,
  sameAs: ['https://www.linkedin.com/company/tidindi', 'https://www.instagram.com/tidindi.no/'],
  publishingPrinciples: `${SITE}/redaksjonelle-prinsipper/`,
  ethicsPolicy: `${SITE}/redaksjonelle-prinsipper/`,
  correctionsPolicy: `${SITE}/redaksjonelle-prinsipper/`,
  masthead: `${SITE}/om/`,
};

export function forsideData() {
  return [
    organisasjon,
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#nettsted`,
      name: 'Tidindi',
      url: `${SITE}/`,
      inLanguage: 'nb-NO',
      publisher: { '@id': organisasjon['@id'] },
    },
  ];
}

export function artikkelData(a: Artikkel) {
  const url = `${SITE}${artikkelUrl(a)}`;
  // Google anbefaler bilder i 16:9, 4:3 og 1:1, minst 1200 px brede.
  const bilder = [9 / 16, 3 / 4, 1].map((f) => bildeUrl(a.bilde, 1200, f)).filter(Boolean);
  return [
    organisasjon,
    {
      '@type': 'NewsArticle',
      '@id': `${url}#artikkel`,
      mainEntityOfPage: url,
      url,
      headline: ((t: string) => (t.length > 110 ? t.slice(0, 107) + '…' : t))(utenLinjefall(a.tittel)),
      description: utenLinjefall(a.ingress),
      ...(bilder.length ? { image: bilder } : {}),
      datePublished: a.publisert,
      dateModified: a.oppdatert ?? a.publisert,
      articleSection: seksjonsnavn(a.seksjon),
      inLanguage: 'nb-NO',
      isAccessibleForFree: true,
      author: a.skribent
        ? [{ '@type': 'Person', name: a.skribent }]
        : [{ '@type': 'Organization', name: 'Tidindi', url: `${SITE}/` }],
      publisher: { '@id': organisasjon['@id'] },
    },
  ];
}
