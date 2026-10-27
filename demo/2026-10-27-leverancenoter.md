# Implementeret efter Frederik, 27. oktober 2026

Kilde: Frederiks mails 26.–27. oktober i tråden “Opgørelse af Lejhøjtaler”.
https://mail.google.com/mail/u/?authuser=philipleth%40gmail.com#all/1a17786a4c992240

Seneste adresse i mailen: “Jeg mener adresse er Njalsgade 40, 2300 København”. Den erstatter den tidligere, usikre beskrivelse af kælderen mellem 43 og 45. Afhentningsadresse og juridisk firmaadresse behandles separat.

Det vedhæftede regneark er en økonomisk slutopgørelse, ikke et produktkatalog. Ingen udstyrs-, lager- eller katalogpriser er udledt af arket.

## Leverance

- Mandag og torsdag 17–18, andre tider efter aftale med 200 kr gebyr.
- 500 kr minimum for selvafhentning. Afklaringer om gebyr pr. booking, rabat og returafhentning står i demo-guiden.
- Dansk/engelsk booking, autoritativ prisberegning på serveren, Stripe, bekræftelsesmail, administration og standardfaktura følger reglerne.
- Gamle gemte driftsindstillinger læses med revision 20261027; efterfølgende ændringer i admin bevares. Særlige datoer og tidligste startdato bevares.
- Hjemmesidetekster, FAQ, afhentningsadresse i sms-standarder, strukturerede data og llms.txt er opdateret. Eksisterende individuelle kommunikationsskabeloner og Google Business Profile er ikke overskrevet.
- Originalt checkout i ~/gitprojects/hojtalerudlejning er ikke ændret. Arbejdet ligger i denne isolerede projektkopi, på branch frederik-opdateringer-2026-10-27 fra main 01b3492.

## Kontrol

- 1.305 tests bestået, 0 fejlet, 7 sprunget over.
- Produktionsbuild samt sitemap/llms.txt bestået.
- Browserkontrol på desktop og 390 × 844 mobil: adresse, åbningstider, minimum, dobbelt aftaletid med ét gebyr, subtotal/total, levering og adminredigering. Billeder i demo/.
- Automatiske API-tests kontrollerer omgåelse af minimum og gebyr, ændret gebyr mellem booking og betaling, rabat uden rabat på gebyret og migration af gemte indstillinger. Betalings- og mailudbydere er simuleret; ingen faktisk betaling eller kundemail.
- Supplerende separat TypeScript-kontrol er ikke ren: manglende Cloudflare-typer og null-/typefejl i projektet. Produktionsbuild bruger projektets eksisterende opsætning, der springer denne kontrol over.

## Aflevering

Åbn demo/2026-10-27-saadan-virker-det.html. Billederne er indlejret, så HTML-filen kan flyttes alene.
Drive-kopi i Clients & Projects → LejHøjtaler:
https://drive.google.com/file/d/1ePhcI8ZG3WBelTSDCekA4JPKgaqzNH7D/view

Ikke pushet eller offentliggjort. Afventer Philips udtrykkelige go efter de samlede afklaringer, jf. hans globale instruktioner. Ingen besked sendt til Frederik eller kunder.
