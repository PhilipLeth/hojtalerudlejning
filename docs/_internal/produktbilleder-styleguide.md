# Gældende produktstil fra 16. september 2026

Alle katalog- og pakkefotos skal have hvid sømløs baggrund og en diskret neutral kontaktskygge. Bevar produktmodel, antal, stativer, beslag og mærkning. Funktionslys må gerne være tændt; fjern dekorative farvefelter, badges og baggrundseffekter. Casefotos og billeder af udstyr i brug bevarer deres naturlige omgivelser.

## Et produkt uden eget foto (22. september 2026)

Arket har en kolonne, "Link til produkt indkøb", der peger på varen hos Jem &
Fix, Thomann eller HiFi Klubben. Den bruges nu som **reference** til
billedgeneratoren, så vi kan lave vores eget billede af netop den model.

Skellet er hele pointen:

| Felt | Hvad | Vises |
|------|------|-------|
| `refFoto` | Leverandørens link fra arket | **Aldrig.** Kun dét modellen ser |
| `image` | Modellens gengivelse i husstilen | Ja, på sitet |

Leverandørens foto er deres. Vi udgiver det ikke — vi viser det til modellen,
så den ved hvilken maskine der er tale om, og gemmer så vores egen gengivelse
på hvid sømløs baggrund. `referencefoto.test.ts` fejler, hvis et `image`-felt
peger på en fremmed shop.

**Sådan gør Frederik:**

1. `/admin/produkter` → find produktet → sæt linket i feltet
   "Leverandørlink (kun reference til billedknappen)". Linket fra arket kan
   kopieres som det er — er det en produktside, følger generatoren `og:image`
   videre til selve billedet.
2. Tryk på billedknappen ved "Produktbillede" og vælg scenen `produktfoto`.
3. Godkend resultatet. Det lander i KV og er live med det samme, uden deploy.

Fra terminalen kræver det `GEMINI_API_KEY` og udgående adgang til shoppen:

```
node scripts/product-images/generate.mjs --apply --only kabeltromle
```

De hentede leverandørfotos caches i `gallery/ref/`, som er gitignoreret.

Nye filer får nye URLer, så gamle fotos ikke bliver liggende i kundens browsercache. `src/lib/whiteProductImages.ts` oversætter kendte gamle katalogbilleder; nyere adminuploads bevares.

## Historisk stil (afløst)

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
