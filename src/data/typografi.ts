// Faste regler for linjefall (Oles beslutning 31.10.2026). Legger inn harde mellomrom der ord hører sammen,
// så nettleseren ikke deler linjen på feil sted. Teksten i Studio skrives som før; reglene brukes når saken bygges
// og i forhåndsvisningen i Studio. Gjelder tittel, ingress, brødtekst, mellomtitler, sitater og faktabokser.
// Ingen avhengigheter til Node eller nettleser.

const H = ' '; // hardt mellomrom
const MND = 'januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|aug|sept?|okt|nov|des';

export function linjefall(tekst: string): string {
  if (!tekst) return tekst;
  return tekst
    // 1. Sitatstrek (først i teksten, etter linjeskift eller etter punktum o.l.) limes til ordet etter.
    .replace(/(^|\n|[.!?:»"][ \t]+)([–—])[ \t]+/g, `$1$2${H}`)
    // 2. Tankestrek inne i en setning limes til ordet foran, så linjen aldri begynner med en strek.
    .replace(/([^\s.!?:»"])[ \t]+([–—])(?=[ \t])/g, `$1${H}$2`)
    // 3. Dato: «29. oktober».
    .replace(new RegExp(`(\\b\\d{1,2}\\.)[ \\t]+(?=(?:${MND})\\b)`, 'gi'), `$1${H}`)
    // 4. Forkortelse og tall: «kl. 21.05», «nr. 2», «ca. 3».
    .replace(/\b(kl|nr|ca|kap|pkt)\.[ \t]+(?=\d)/gi, `$1.${H}`)
    // 5. Tusenskille: «5 490», «1 199».
    .replace(/(\d)[ \t](?=\d{3}(?!\d))/g, `$1${H}`)
    // 6. Tall og det som følger: «375 hk», «6,3 milliarder», «20 %», «605 km».
    .replace(/(\d)[ \t]+(?=[\p{L}%‰€$£])/gu, `$1${H}`)
    // 7. Korte ord (én eller to bokstaver) limes til ordet etter, så de ikke står sist på linjen.
    .replace(/(?<=^|[\s(«"])(\p{L}{1,2})[ \t]+(?=\S)/gu, `$1${H}`);
}
