// FIKTIVT PRØVEINNHOLD for å vurdere layout. Sakene finnes ikke. Mediene er ekte navn,
// slik at e-posten ser realistisk ut, men lenkene går bare til forsidene deres.
// Virksomhetene i Varde-prøven er oppdiktet.

const dato = new Date('2026-10-26T05:00:00Z'); // mandag 26. oktober kl. 06 i Oslo

export const morgenbriefProve = {
  dato,
  nummer: 1,
  lesetid: 3,
  ord: 'Tillit',
  syntese: [
    'Tillit går igjen i mange av morgenens saker. En ny undersøkelse viser at nordmenn fortsatt stoler på redaksjonelle medier, mens tilliten til innhold i sosiale medier faller videre. I Frankrike diskuteres nye regler for merking av KI-generert innhold, nettopp for å hindre at skillet viskes ut.',
    'I økonomien handler det om tillit av en annen sort. Bankene er mer forsiktige med næringseiendom, og fra London meldes det at europeiske selskaper nå prioriterer forsvar foran grønn omstilling. Signalene peker samme vei: kapitalen søker trygghet.',
    'Hjemme preges uken av beredskap og vinter. Kommunene ber om mer tid til nye krav, og strømprisene ventes å stige, men mindre enn i fjor.',
  ],
  saker: [
    { medium: 'NRK', setning: 'Flere kommuner ber om lengre frist for nye beredskapskrav og peker på mangel på fagfolk.', lenke: 'https://www.nrk.no/' },
    { medium: 'Aftenposten', setning: 'Tilliten til lokale nyhetsmedier holder seg, mens tilliten til sosiale medier faller for tredje år på rad.', lenke: 'https://www.aftenposten.no/' },
    { medium: 'Dagens Næringsliv', setning: 'Bankene strammer inn på lån til næringseiendom etter et halvår med fallende verdier.', lenke: 'https://www.dn.no/' },
    { medium: 'E24', setning: 'Strømprisene i Sør-Norge ventes å stige utover vinteren, men mindre enn i fjor.', lenke: 'https://e24.no/' },
    { medium: 'Morgenbladet', setning: 'Forskere advarer mot at KI tas i bruk i skolen raskere enn kunnskapen om effektene.', lenke: 'https://www.morgenbladet.no/' },
    { medium: 'Bergens Tidende', setning: 'Sjømatnæringen på Vestlandet melder om uvanlig tidlig vintersesong for eksport til Asia.', lenke: 'https://www.bt.no/' },
    { medium: 'Financial Times', setning: 'Europeiske selskaper investerer nå mer i forsvarsindustri enn i grønn omstilling.', lenke: 'https://www.ft.com/' },
    { medium: 'The Economist', setning: 'Hvorfor produktivitetsveksten i rike land har stoppet opp, og hva KI faktisk kan endre.', lenke: 'https://www.economist.com/' },
    { medium: 'Le Monde', setning: 'Frankrike vurderer krav om at plattformer skal merke KI-generert innhold tydelig.', lenke: 'https://www.lemonde.fr/' },
    { medium: 'Reuters', setning: 'Containerfrakten gjennom Suezkanalen er tilbake på nivået fra før krisen.', lenke: 'https://www.reuters.com/' },
  ],
  folgMed: 'Torsdag kommer nye tall for arbeidsledigheten. De viser om avkjølingen i økonomien har nådd arbeidsmarkedet.',
};

export const vardeRapportProve = {
  dato,
  timer: 24,
  virksomhet: 'Havbrynet Energi',
  tema: 'Havvind',
  egne: [
    { medium: 'E24', tid: 'kl. 07.42', tittel: 'Havbrynet Energi henter 400 millioner til nytt havvindprosjekt', setning: 'Selskapet bekrefter at kapitalen skal gå til første fase av prosjektet utenfor Møre.', lenke: 'https://e24.no/' },
    { medium: 'Adresseavisen', tid: 'kl. 06.15', tittel: 'Ny toppsjef i Havbrynet: – Vi skal bygge i Norge', setning: 'Den nye daglige lederen sier selskapet vil prioritere norske leverandører.', lenke: 'https://www.adressa.no/' },
    { medium: 'NRK Møre og Romsdal', tid: 'i går kl. 21.30', tittel: 'Fiskere krever dialog før havvindutbygging', setning: 'Fiskarlaget mener Havbrynet Energi har involvert næringen for sent.', lenke: 'https://www.nrk.no/mr/' },
    { medium: 'Teknisk Ukeblad', tid: 'i går kl. 16.05', tittel: 'Slik skal flytende havvind bli billigere', setning: 'Havbrynet Energi nevnes som ett av tre selskaper som tester ny forankringsteknologi.', lenke: 'https://www.tu.no/' },
  ],
  temaSaker: [
    { medium: 'Dagens Næringsliv', tid: 'kl. 08.10', tittel: 'Neste tildelingsrunde for havvind kan bli utsatt', setning: 'Flere aktører venter på avklaring om støtteordningen før de tar investeringsbeslutninger.', lenke: 'https://www.dn.no/' },
  ],
  aktorer: [
    { navn: 'Saltfjell Kraft', saker: [
      { medium: 'Energiwatch', tid: 'kl. 09.02', tittel: 'Saltfjell Kraft kutter i investeringsplanen', setning: 'Selskapet begrunner kuttet med høyere rentekostnader.', lenke: 'https://energiwatch.no/' },
    ] },
    { navn: 'Nordvær Energi', saker: [] },
  ],
};

export const vardeVarselProve = {
  virksomhet: 'Havbrynet Energi',
  medium: 'E24',
  tid: 'i dag kl. 09.12',
  tittel: 'Havbrynet Energi i sluttforhandlinger om kraftavtale med Tyskland',
  setning: 'Ifølge E24 gjelder avtalen leveranser over femten år fra selskapets første havvindpark.',
  lenke: 'https://e24.no/',
};
