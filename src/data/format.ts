// Dato- og tidsformat på norsk, alltid i norsk tid.
const TZ = 'Europe/Oslo';

export function datoLang(d: Date): string {
  const s = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function klokkeslett(iso: string): string {
  const t = new Intl.DateTimeFormat('nb-NO', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date(iso));
  return `kl. ${t.replace(':', '.')}`;
}

export function datoOgTid(iso: string): string {
  const d = new Date(iso);
  const dato = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(d);
  return `${dato}, ${klokkeslett(iso)}`;
}

/** «kl. 07.10» samme dag, ellers «23. okt.» */
export function sisteTid(iso: string, naa = new Date()): string {
  const dag = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
  if (dag(new Date(iso)) === dag(naa)) return klokkeslett(iso);
  return new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short', timeZone: TZ }).format(new Date(iso));
}
