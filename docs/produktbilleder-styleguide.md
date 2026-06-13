# Produktbilleder — Style Guide

Alle produktbilleder på lejhojtaler.dk følger en konsistent visuel stil. Nye billeder **skal** matche denne stil præcist.

## Baggrund
- **Farve**: Varm gul/sennepsgul (ca. #D4A017–#C89B10). Ensartet, mat finish.
- **Gradient**: Let gradient fra lysere gul øverst til lidt mørkere/varmere gul nederst.
- **Gulv/underlag**: Samme gule farve som baggrund, med en svag skygge/refleksion under produktet. Sømløst overgang mellem gulv og bagvæg.

## Produkt
- **Placering**: Centreret eller let forskudt mod venstre. Produktet fylder ca. 60–70% af billedhøjden.
- **Vinkel**: Let 3/4-vinkel (ikke helt frontal, ikke helt profil). Giver dybde.
- **Par-produkter**: Når der er to enheder (højtalere, stativer), vises de side om side med let forskudt dybde — den ene lidt foran, den anden lidt bagved.
- **Belysning**: Blødt, diffust studielys fra venstre/oven. Ingen hårde skygger. Naturlig skygge under produktet mod højre.

## Detaljer & overlays
- **Sparkle/gnist-ikon**: Lille hvid-guld 4-takket stjerne i nederste højre hjørne (ca. 20×20px relativ størrelse). Subtle, semi-transparent.
- **Bluetooth-badge** (kun højtalere): Øverste højre hjørne. Hvid cirkel med Bluetooth-ikon + teksten "VIRKER MED BLUETOOTH" i fed hvid tekst. Kun på speaker-billeder.
- **Ingen tekst** på tilbehørsbilleder (lys, røg, stativer, taske).

## Teknisk
- **Format**: PNG med opak baggrund (ingen transparency).
- **Størrelse**: Kvadratisk, ca. 1024×1024px eller 800×800px.
- **Filnavn**: `product-[id].png` (f.eks. `product-taske.png`, `product-rog.png`).
- **Placering**: `/public/images/`

## Eksisterende billeder (reference)
| Fil | Produkt | Særligt |
|-----|---------|--------|
| `product-party.png` | 2× Alto 10" højtalere | Bluetooth-badge |
| `product-festival.png` | 2× EV 12" højtalere | Bluetooth-badge |
| `product-lys.png` | 3-i-1 lysbar (2 LED + centereffekt) | Ingen badge |
| `product-rog.png` | Eliminator VF1300 EP røgmaskine | Ingen badge |
| `product-stativer.png` | 2× sorte højtalerstativer | Ingen badge |
| `product-taske.png` | Sort polstret sportstaske | Ingen badge |

## Prompt-skabelon til AI-billedgenerering
Brug denne som udgangspunkt for nye produktbilleder:

> Professional product photo of [PRODUKT], studio lighting, warm golden-yellow seamless backdrop (#D4A017), soft diffused light from upper left, subtle shadow underneath, slight 3/4 angle, centered composition, clean and minimal, no text overlays, matte finish background, 1024x1024

Tilføj derefter sparkle-ikonet og evt. Bluetooth-badge manuelt i et billedredigeringsprogram.
