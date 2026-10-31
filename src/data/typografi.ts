// Faste regler for linjefall (Oles beslutning 31.10.2026). Legger inn harde mellomrom der ord hører sammen,
// så nettleseren ikke deler linjen på feil sted. Teksten i Studio skrives som før; reglene brukes når saken bygges
// og i forhåndsvisningen i Studio. Gjelder tittel, ingress, brødtekst, mellomtitler, sitater, faktabokser,
// bildetekster og videotekster. Reglene endrer bare mellomrom til harde mellomrom; de legger aldri til eller fjerner tegn
// i teksten (unntak: et usynlig ordskjøt etter sitatstreken, se WJ).
// Ingen avhengigheter til Node eller nettleser.

const H = '\u00a0'; // hardt mellomrom
// Ordskjøt (U+2060) etter sitatstreken. Etter en tankestrek tillater nettleseren linjebrudd selv om et hardt mellomrom
// følger (Unicode-regelen for linjebrudd), så det harde mellomrommet alene holdt ikke streken sammen med ordet. Usynlig.
const WJ = '\u2060';
const MND = 'januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|aug|sept?|okt|nov|des';

export function linjefall(tekst: string): string {
  if (!tekst) return tekst;
  return tekst
    // 1. Sitatstrek (først i teksten, etter linjeskift eller etter punktum o.l.) limes til ordet etter.
    .replace(/(^|\n|[.!?:\u00bb"][ \t]+)([\u2013\u2014])[ \t]+/g, `$1$2${WJ}${H}`)
    // 2. Tankestrek inne i en setning limes til ordet foran, så linjen aldri begynner med en strek.
    .replace(/([^\s.!?:\u00bb"])[ \t]+([\u2013\u2014])(?=[ \t])/g, `$1${H}$2`)
    // 3. Dato: «29. oktober».
    .replace(new RegExp(`(\\b\\d{1,2}\\.)[ \\t]+(?=(?:${MND})\\b)`, 'gi'), `$1${H}`)
    // 4. Forkortelse og tall: «kl. 21.05», «nr. 2», «ca. 3».
    .replace(/\b(kl|nr|ca|kap|pkt)\.[ \t]+(?=\d)/gi, `$1.${H}`)
    // 5. Tusenskille: «5 490», «1 199».
    .replace(/(\d)[ \t](?=\d{3}(?!\d))/g, `$1${H}`)
    // 6. Tall og det som følger: «375 hk», «6,3 milliarder», «20 %», «605 km».
    .replace(/(\d)[ \t]+(?=[\p{L}%\u2030\u20ac$\u00a3])/gu, `$1${H}`)
    // 7. Korte ord (én eller to bokstaver) limes til ordet etter, så de ikke står sist på linjen.
    //    Ikke enheter rett etter et tall («375 hk», «605 km»): de hører til tallet foran, ikke ordet etter.
    .replace(/(?<=^|[\s(\u00ab"])(?<!\d\u00a0)(\p{L}{1,2})[ \t]+(?=\S)/gu, `$1${H}`);
}

/** Tekst uten linjefallstegn, til metadata (sidetittel, beskrivelse, deling og strukturerte data). */
export function utenLinjefall(tekst: string): string;
export function utenLinjefall(tekst: string | undefined): string | undefined;
export function utenLinjefall(tekst: string | undefined): string | undefined {
  return tekst ? tekst.replace(/\u2060/g, '').replace(/\u00a0/g, ' ') : tekst;
}
