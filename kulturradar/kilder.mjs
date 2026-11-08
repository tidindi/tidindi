// Kildene i kulturradaren: internasjonale kultur-, mote-, musikk-, film- og designmagasiner.
// Radaren leses av Claudes daglige idérunde («Tips til saker»), ikke av lesere. Ingenting publiseres.
// Hver kilde kan ha flere mulige adresser; den første som svarer med gyldig RSS/Atom brukes.

export const grupper = [
  { id: 'musikk', navn: 'Musikk' },
  { id: 'mote', navn: 'Mote, livsstil og ungdomskultur' },
  { id: 'film', navn: 'Film og TV' },
  { id: 'kunst', navn: 'Kunst, design og kultur' },
];

export const kilder = [
  // Musikk
  { navn: 'Pitchfork (nyheter)', gruppe: 'musikk', urls: ['https://pitchfork.com/feed/feed-news/rss', 'https://pitchfork.com/rss/news/'] },
  { navn: 'Pitchfork (artikler og anmeldelser)', gruppe: 'musikk', urls: ['https://pitchfork.com/feed/rss', 'https://pitchfork.com/rss/reviews/albums/'] },
  { navn: 'Stereogum', gruppe: 'musikk', urls: ['https://www.stereogum.com/feed/'] },
  { navn: 'NME', gruppe: 'musikk', urls: ['https://www.nme.com/feed'] },
  { navn: 'The Fader', gruppe: 'musikk', urls: ['https://www.thefader.com/rss', 'https://www.thefader.com/feed'] },
  { navn: 'Rolling Stone (musikk)', gruppe: 'musikk', urls: ['https://www.rollingstone.com/music/feed/', 'https://www.rollingstone.com/feed/'] },
  { navn: 'Billboard', gruppe: 'musikk', urls: ['https://www.billboard.com/feed/'] },
  { navn: 'Music Business Worldwide', gruppe: 'musikk', urls: ['https://www.musicbusinessworldwide.com/feed/'] },
  { navn: 'Consequence', gruppe: 'musikk', urls: ['https://consequence.net/feed/'] },
  { navn: 'The Quietus', gruppe: 'musikk', urls: ['https://thequietus.com/feed'] },
  { navn: 'Crack Magazine', gruppe: 'musikk', urls: ['https://crackmagazine.net/feed/'] },
  { navn: 'Bandcamp Daily', gruppe: 'musikk', urls: ['https://daily.bandcamp.com/feed'] },

  { navn: 'Clash', gruppe: 'musikk', urls: ['https://www.clashmusic.com/feed/'] },
  { navn: 'Gorilla vs. Bear', gruppe: 'musikk', urls: ['https://www.gorillavsbear.net/feed/'] },
  { navn: 'The Guardian (musikk)', gruppe: 'musikk', urls: ['https://www.theguardian.com/music/rss'] },
  { navn: 'Soompi (K-pop og koreansk underholdning)', gruppe: 'musikk', maks: 8, urls: ['https://www.soompi.com/feed'] },
  { navn: 'Remezcla (latinamerikansk kultur)', gruppe: 'musikk', urls: ['https://remezcla.com/feed/'] },
  { navn: 'The Native (afrikansk musikk og kultur)', gruppe: 'musikk', urls: ['https://thenativemag.com/feed/'] },

  // Mote, livsstil og ungdomskultur
  { navn: 'Dazed', gruppe: 'mote', urls: ['https://www.dazeddigital.com/rss'] },
  { navn: 'i-D', gruppe: 'mote', urls: ['https://i-d.co/feed/'] },
  { navn: 'Highsnobiety', gruppe: 'mote', urls: ['https://www.highsnobiety.com/feed/'] },
  { navn: 'Hypebeast', gruppe: 'mote', maks: 10, urls: ['https://hypebeast.com/feed'] },
  { navn: 'The Business of Fashion', gruppe: 'mote', urls: ['https://www.businessoffashion.com/arc/outboundfeeds/rss/?outputType=xml', 'https://www.businessoffashion.com/arc/outboundfeeds/rss/'] },
  { navn: 'Vogue Business', gruppe: 'mote', urls: ['https://www.voguebusiness.com/feed/rss'] },
  { navn: 'WWD', gruppe: 'mote', urls: ['https://wwd.com/feed/'] },
  { navn: 'Vogue (mote)', gruppe: 'mote', urls: ['https://www.vogue.com/feed/rss'] },
  { navn: 'The Guardian (mote)', gruppe: 'mote', urls: ['https://www.theguardian.com/fashion/rss'] },

  // Film og TV
  { navn: 'Variety', gruppe: 'film', urls: ['https://variety.com/feed/'] },
  { navn: 'The Hollywood Reporter', gruppe: 'film', urls: ['https://www.hollywoodreporter.com/feed/'] },
  { navn: 'Deadline', gruppe: 'film', urls: ['https://deadline.com/feed/'] },
  { navn: 'IndieWire', gruppe: 'film', urls: ['https://www.indiewire.com/feed/'] },
  { navn: 'Little White Lies', gruppe: 'film', urls: ['https://lwlies.com/feed/'] },
  { navn: 'Mubi Notebook', gruppe: 'film', urls: ['https://mubi.com/notebook/posts.rss', 'https://mubi.com/en/notebook/posts.rss'] },
  { navn: 'The Guardian (film)', gruppe: 'film', urls: ['https://www.theguardian.com/film/rss'] },
  { navn: 'Cineuropa', gruppe: 'film', urls: ['https://cineuropa.org/en/rss/', 'https://cineuropa.org/rss/en/'] },

  // Kunst, design og kultur
  { navn: 'Dezeen', gruppe: 'kunst', urls: ['https://www.dezeen.com/feed/'] },
  { navn: 'Wallpaper', gruppe: 'kunst', urls: ['https://www.wallpaper.com/feeds/all', 'https://www.wallpaper.com/rss'] },
  { navn: 'Hyperallergic', gruppe: 'kunst', urls: ['https://hyperallergic.com/feed/'] },
  { navn: 'Artnet News', gruppe: 'kunst', urls: ['https://news.artnet.com/feed'] },
  { navn: 'Rest of World', gruppe: 'kunst', urls: ['https://restofworld.org/feed/latest', 'https://restofworld.org/feed/'] },
  { navn: 'The Guardian (kunst og design)', gruppe: 'kunst', urls: ['https://www.theguardian.com/artanddesign/rss'] },
  { navn: 'The Guardian (kultur)', gruppe: 'kunst', urls: ['https://www.theguardian.com/culture/rss'] },
];
