// Stilene til forhåndsvisningen. Speiler src/styles/global.css og artikkelmalen.
// Alt er avgrenset til .tf, så Studio selv ikke påvirkes.
export const stiler = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap');

.tf {
  --blyhvit: #F5F4EF; --kull: #1C1E20; --tekst-2: #5C616A; --linje: #D3D5D8; --flate: #E3E4E6; --brodtekst: #2A2A28; --neon: #E6FF2B;
  --overskrift: "Playfair Display", Georgia, serif; --tekst: "Source Serif 4", Georgia, serif; --etikett: "Barlow Condensed", "Arial Narrow", sans-serif;
  background: #E3E4E6; min-height: 100%; padding: 16px; box-sizing: border-box;
  color: var(--kull); font-family: var(--tekst); -webkit-font-smoothing: antialiased;
}
.tf *, .tf *::before, .tf *::after { box-sizing: border-box; }
.tf h1, .tf h2, .tf p, .tf figure, .tf blockquote { margin: 0; }
.tf a { color: var(--kull); text-decoration: underline; text-underline-offset: 3px; }
.tf img { display: block; max-width: 100%; }

.tf-verktoy { max-width: 900px; margin: 0 auto 12px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.tf-valg { display: flex; }
.tf-valg button {
  font-family: var(--etikett); font-weight: 700; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase;
  background: transparent; color: var(--kull); border: 1px solid var(--kull); padding: 8px 16px; min-height: 36px; cursor: pointer;
}
.tf-valg button + button { border-left: 0; }
.tf-valg button[aria-pressed="true"] { background: var(--kull); color: var(--neon); }
.tf-mangler { max-width: 900px; margin: 0 auto 12px !important; padding: 8px 12px; background: var(--kull); color: var(--blyhvit); font-family: var(--etikett); font-weight: 600; letter-spacing: 0.06em; font-size: 14px; }

.tf-side { max-width: 900px; margin: 0 auto; background: var(--blyhvit); padding: 48px; display: flex; flex-direction: column; gap: 64px; transition: max-width .2s; }
.tf-side.tf-mobil { max-width: 390px; padding: 24px 16px; gap: 48px; }

.tf-etikett { font-family: var(--etikett); font-weight: 700; font-size: 14px; letter-spacing: 0.16em; text-transform: uppercase; }
.tf-meta { font-family: var(--etikett); font-weight: 600; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--tekst-2); }
.tf-merke { display: inline-flex; align-items: center; gap: 10px; font-size: 15px; }
.tf-rombe { display: inline-block; width: 8px; height: 8px; background: currentColor; transform: rotate(45deg); }

.tf-artikkel { display: flex; flex-direction: column; gap: 48px; }
.tf-hode { display: flex; flex-direction: column; gap: 24px; max-width: 46rem; }
.tf-merkerad { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; }
.tf-tittel { font-family: var(--overskrift); font-weight: 700; font-size: 3.25rem; line-height: 1.06; letter-spacing: -0.01em; }
.tf-mobil .tf-tittel { font-size: 2.25rem; }
.tf-ingress { font-size: 1.375rem; line-height: 1.5; color: var(--brodtekst); }
.tf-mobil .tf-ingress { font-size: 1.1875rem; }
.tf-byline {
  display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px 24px;
  padding: 12px 0; border-top: 1px solid var(--kull); border-bottom: 1px solid var(--linje);
  font-family: var(--etikett); font-size: 14px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
}

.tf-bilde { width: 100%; object-fit: cover; background: var(--flate); filter: grayscale(1); }
.tf-bilde-tom { width: 100%; background: var(--flate); display: flex; align-items: center; justify-content: center; font-family: var(--etikett); font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--tekst-2); }
.tf-hovedbilde, .tf-innebilde { display: flex; flex-direction: column; gap: 8px; }
.tf-hovedbilde { margin-top: -12px; }
.tf-hovedbilde figcaption, .tf-innebilde figcaption { font-size: 15px; line-height: 1.45; color: var(--tekst-2); }

.tf-tekst { display: flex; flex-direction: column; gap: 24px; font-size: 1.1875rem; line-height: 1.7; max-width: 40rem; }
.tf-mellomtittel { font-family: var(--overskrift); font-weight: 700; font-size: 26px; line-height: 1.15; letter-spacing: -0.01em; margin-top: 12px !important; }
.tf-liste { margin: 0; padding-left: 24px; display: flex; flex-direction: column; gap: 8px; }
.tf-sitat { margin: 8px 0 !important; padding: 24px 0; border-top: 3px solid var(--kull); border-bottom: 1px solid var(--kull); display: flex; flex-direction: column; gap: 12px; }
.tf-sitat p { font-family: var(--overskrift); font-style: italic; font-size: 1.75rem; line-height: 1.3; }
.tf-sitat cite { font-style: normal; }
.tf-fakta { margin: 8px 0; background: var(--flate); padding: 24px; display: flex; flex-direction: column; gap: 12px; font-size: 17px; line-height: 1.5; }
.tf-fakta ul { margin: 0; padding-left: 24px; display: flex; flex-direction: column; gap: 8px; }
.tf-kilde { padding-top: 16px; border-top: 1px solid var(--linje); font-size: 14px; letter-spacing: 0.08em; }

.tf-forside { border-top: 3px solid var(--kull); }
.tf-blokketikett { padding-top: 16px; padding-bottom: 16px; font-size: 15px; letter-spacing: 0.18em; }
.tf-kort-rad { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; align-items: start; }
.tf-mobil .tf-kort-rad { grid-template-columns: 1fr; }
.tf-kort { display: flex; flex-direction: column; gap: 12px; }
.tf-h-hoved { font-family: var(--overskrift); font-weight: 700; font-size: 2.5rem; line-height: 1.04; letter-spacing: -0.01em; }
.tf-mobil .tf-h-hoved { font-size: 2.25rem; }
.tf-h-stor { font-family: var(--overskrift); font-weight: 700; font-size: 21px; line-height: 1.2; letter-spacing: -0.01em; }
`;
