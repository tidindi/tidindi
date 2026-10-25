// Kildene i tipsstrømmen, i prioritert rekkefølge (gruppe 1 først).
// Hver kilde kan ha flere mulige adresser; den første som svarer med gyldig RSS/Atom brukes.
// Kildelisten er offentlig og inneholder bare åpne nyhets- og pressemeldingsstrømmer.

export const grupper = [
  { id: 1, navn: 'Norge – myndigheter og statistikk' },
  { id: 2, navn: 'Norge – næring, organisasjoner, kultur og sport' },
  { id: 3, navn: 'Norden' },
  { id: 4, navn: 'Europa' },
  { id: 5, navn: 'Forskning' },
  { id: 6, navn: 'Internasjonalt' },
];

export const kilder = [
  // 1 – Norge, myndigheter og statistikk
  { navn: 'Regjeringen', gruppe: 1, urls: ['https://www.regjeringen.no/no/aktuelt/rss/id2581966/', 'https://www.regjeringen.no/no/rss/Rss/2581966/'] },
  { navn: 'SSB', gruppe: 1, urls: ['https://www.ssb.no/rss/statistikk', 'https://www.ssb.no/rss', 'https://www.ssb.no/rss/nyheter'] },
  { navn: 'DSB', gruppe: 1, urls: ['https://www.dsb.no/rss/', 'https://www.dsb.no/rss/nyheter/', 'https://www.dsb.no/nyheter/rss/'] },
  { navn: 'Folkehelseinstituttet', gruppe: 1, urls: ['https://www.fhi.no/rss/nyheter/', 'https://www.fhi.no/rss/', 'https://www.fhi.no/nyheter/rss/'] },
  { navn: 'Mattilsynet', gruppe: 1, urls: ['https://www.mattilsynet.no/rss/nyheter', 'https://www.mattilsynet.no/rss'] },
  { navn: 'Norges Bank', gruppe: 1, urls: ['https://www.norges-bank.no/rss/nyheter-og-hendelser/', 'https://www.norges-bank.no/rss/'] },

  // 2 – Norge, næring m.m.
  { navn: 'NTB Kommunikasjon', gruppe: 2, maks: 25, urls: ['https://kommunikasjon.ntb.no/rss/releases/latest?lang=no', 'https://kommunikasjon.ntb.no/rss/releases/latest'] },
  { navn: 'Mynewsdesk Norge', gruppe: 2, urls: ['https://www.mynewsdesk.com/no/rss/latest', 'https://www.mynewsdesk.com/no/rss/current_news'] },
  { navn: 'Cision Norge', gruppe: 2, urls: ['https://news.cision.com/no/ListItems?format=rss', 'https://news.cision.com/ListItems?format=rss&culture=nb-NO'] },

  // 3 – Norden
  { navn: 'Via TT (Sverige)', gruppe: 3, urls: ['https://via.tt.se/rss/releases/latest?lang=sv', 'https://via.tt.se/rss/releases/latest'] },
  { navn: 'Via Ritzau (Danmark)', gruppe: 3, urls: ['https://via.ritzau.dk/rss/releases/latest?lang=da', 'https://via.ritzau.dk/rss/releases/latest'] },
  { navn: 'STT Info (Finland)', gruppe: 3, maks: 10, urls: ['https://www.sttinfo.fi/rss/releases/latest?lang=en', 'https://www.sttinfo.fi/rss/releases/latest'] },

  // 4 – Europa
  { navn: 'EU-kommisjonen', gruppe: 4, urls: ['https://ec.europa.eu/commission/presscorner/api/rss?language=en', 'https://ec.europa.eu/commission/presscorner/home/en/rss'] },
  { navn: 'Eurostat', gruppe: 4, urls: ['https://ec.europa.eu/eurostat/en/web/rss/news', 'https://ec.europa.eu/eurostat/web/main/news/rss'] },

  // 5 – Forskning
  { navn: 'EurekAlert!', gruppe: 5, maks: 15, urls: ['https://www.eurekalert.org/rss.xml', 'https://www.eurekalert.org/rss/all.xml', 'https://www.eurekalert.org/rss/'] },
  { navn: 'AlphaGalileo', gruppe: 5, urls: ['https://www.alphagalileo.org/en-gb/RSS', 'https://www.alphagalileo.org/rss'] },

  // 6 – Internasjonalt
  { navn: 'WHO', gruppe: 6, urls: ['https://www.who.int/rss-feeds/news-english.xml'] },
  { navn: 'FN', gruppe: 6, urls: ['https://news.un.org/feed/subscribe/en/news/all/rss.xml'] },
];
