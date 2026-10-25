# E-postmaler – Morgenbrief og Varde

- `maler.mjs` – tre maler: `morgenbrief()`, `vardeRapport()` og `vardeVarsel()`. Hver returnerer emne, forhåndsvisningstekst, HTML og ren tekst.
- `proveinnhold.mjs` – fiktivt innhold for å vurdere layout.
- `prove.mjs` – lager prøvene i `epost/ut/` og sender dem via Resend med `SEND=1`.
- Bildene (logo og sluttmerke, PNG i dobbel oppløsning) ligger i `public/epost/` og publiseres på https://tidindi.no/epost/.

Prinsipper: 600 px, én kolonne, tabellbasert HTML med innebygde stiler. Webskrifter der e-postprogrammet tillater det, ellers Georgia og Arial. Logo på egen mørk flate, så den tåler mørk modus. All tekst er ekte tekst, så e-posten kan leses med bilder av. Neongult bare på sort.
