# Tips til saker

Claudes daglige idérunde for Tidindi, sendt på e-post til ole.winther@tidindi.no hver morgen rundt kl. 07.

1. Claude gjør idérunden og skriver funnene i en Markdown-fil.
2. `node tips/pakk.mjs <fil.md>` lager e-posten, komprimerer og krypterer den med den offentlige nøkkelen i `mottaker.txt` og starter arbeidsflyten «Tips til saker».
3. Arbeidsflyten (`.github/workflows/tips-til-saker.yml`) dekrypterer med GitHub-hemmeligheten `TIPS_NOKKEL` og sender via Resend fra tips@tidindi.no. Emnet er «Tips til saker, <dato>, Claude».

Repoet er offentlig, så innholdet sendes aldri i klartekst og skrives aldri til loggen. `mottaker.txt` er en offentlig nøkkel og kan ligge her. Den private nøkkelen finnes bare i GitHub-hemmeligheten.

Prøve uten sending: `PROVE=1 node tips/pakk.mjs <fil.md>` lager `tips.html` lokalt.
