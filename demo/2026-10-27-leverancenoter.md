# Frederiks opdateringer – 27. oktober 2026

## Endelig beslutning fra Philip

- Fast afhentning og aflevering mandag og torsdag kl. 17.
- Andre tidspunkter kræver aftale og koster 200 kr pr. ind- eller udlevering. Ingen særskilte tider: 0 kr. Én: 200 kr. Begge: 400 kr.
- Gebyret er uden rabat. Det tæller ikke med i minimumsordren på 500 kr efter rabat ved selvafhentning. Kørsel er undtaget fra minimum, og der opkræves ikke overdragelsesgebyr for en strækning med levering.
- Ny afhentningsadresse: Njalsgade 40, 2300 København, fra Frederiks seneste mail. Den juridiske firmaadresse er bevaret, da et CVR-adresseskift ikke er bekræftet.
- Philip har udtrykkeligt bedt om at lægge alle hjemmesideændringer live.

## Kontrol af kilder

Frederiks mails 26.–27. oktober: https://mail.google.com/mail/u/?authuser=philipleth%40gmail.com#all/1a17786a4c992240

Sms 27. oktober kræver ny adresse og åbningstider hele vejen gennem booking og mails. Sms 22. oktober om Halloween-priserne var allerede implementeret: røgmaskine 395 kr og low fog 695 kr i perioden 30. oktober–1. november. Sms 23. oktober om egen Stripekonto kræver Frederiks kontoopsætning og er en separat udestående opgave.

Vedhæftet regneark er en økonomisk slutopgørelse, ikke et produktkatalog. Ingen katalogændringer er udledt af arket.

## Gennemført

Dansk og engelsk booking, hjemmesidetekster, serverberegnet pris, Stripe, bekræftelsesmail, sms-påmindelser, administration, faktura, strukturerede data og llms.txt følger de nye regler. Bekræftelser og sms-påmindelser viser gemte aftaletider. Administrationens mailforhåndsvisning og shortcode-eksempler har også den nye adresse.

Gemte indstillinger migreres ved læsning med revision 2026102702. Særlige datoer, telefon, juridiske oplysninger og efterfølgende adminændringer bevares. Live kommunikationsindstillinger er læst: ingen tilpasset bekræftelsesskabelon eller gammel afhentningsadresse blev fundet i den gemte opfølgningsmail. Ingen sms-indstillinger er gemt. Ingen kunde er kontaktet, og ingen rigtig booking eller betaling er oprettet under kontrollen.

Originalt checkout i ~/gitprojects/hojtalerudlejning er urørt. Leverancen ligger i denne projektkopi.

## Validering og aflevering

1.316 tests kørt: 1.308 bestod og 7 er sprunget over. Én eksisterende lagertest ramte 20-sekunders tidsgrænsen under samtidig build; hele lagerfilen og bekræftelsesmailen er gentaget med 46 af 46 bestået. Produktionsbuild, sitemap og llms.txt er bestået. Publicering og nye live-skærmbilleder tilføjes efter deploy. Den tidligere demo med 17–18 og ét gebyr pr. booking er afløst af ovenstående præciseringer.
