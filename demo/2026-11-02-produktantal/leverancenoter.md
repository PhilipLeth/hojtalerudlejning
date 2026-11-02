# Lejhøjtaler: produktantal og booking

Live 2. november 2026. Kodecommit: 82b1288.
Deployment: https://28587eba.speaker-rental.pages.dev

Antalvalg fra datotrinnet, også for tilvalg booket alene. Fælles grupperede linjer i kurv, ordreoversigt og kvittering; ekstra produkter manglede tidligere på den umiddelbare kvittering. Større plus/minus-knapper. Dansk og engelsk.

Kontrol: 1322 tests bestået, 4 udeladt; 30 berørte tests genkørt efter testtype-rettelse. Build bestået. Live 2 lysbarer + 1 Soundboks = 1185 kr; mobil 390 px uden vandret overflow. Ingen browserfejl. Ingen liveordre eller betaling gennemført. Typecheck har eksisterende fejl i projektet (buildkonfigurationen ignorerer dem); ingen nye fejl i de nye antaltests.

Ingen gamle lokale ændringer fra gitprojects/hojtalerudlejning er deployet: den mappe er bagud og har omfattende fremmede staged ændringer. Den aktuelle checkout var ren og matchede seneste produktion/GitHub før arbejdet. Tidligere websiteopgaver var allerede afsluttet ifølge Philips CRM-rettelse.
