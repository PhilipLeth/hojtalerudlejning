#!/usr/bin/env python3
"""Produkterne beskriver arkets modeller, ikke de gamle (19. sept 2026).

Efter prisrunden stod flere produkter som en blanding: nyt navn og ny pris,
men gammel beskrivelse, gammelt indhold eller gammelt foto (fx 'Enkelt
lyseffekt' som LED-par-lys, hvor arket siger Eurolite Mini Z-20 beam;
'Soundboks batteri' med Thump GO-fotoet; Stor højtalerpakke 'på stativer',
hvor arket ikke har stativer med). Her rettes katalog og produktsider, så
model, indhold, tekst og foto er arkets.

  python3 scripts/katalog/modeller.py
"""
import os, re
ROD = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def patch(rel, pairs, mindst=1):
    sti = os.path.join(ROD, rel); s = open(sti).read()
    for a, b in pairs:
        if a not in s: raise SystemExit(f"MANGLER i {rel}: {a[:70]}")
        s = s.replace(a, b)
    open(sti, "w").write(s)

# ── Kataloget ───────────────────────────────────────────────────────────────
patch("src/lib/products.ts", [
 # subwoofer
 ('contents: ["Behringer 12\\" aktiv subwoofer", "Strømkabel", "Signalkabel til højtalere"],\n    da: { label: "Subwoofer 12\\"", desc: "Behringer 12\\" aktiv sub, giver festen den dybe bas" },\n    en: { label: "Subwoofer 12\\"", desc: "Behringer 12\\" powered sub, adds the deep bass" },',
  'contents: ["Behringer B1200D Pro aktiv 12\\" subwoofer", "Strømkabel", "Signalkabel til højtalere"],\n    da: { label: "Subwoofer 12\\"", desc: "Behringer B1200D Pro, aktiv 12\\" sub, giver festen den dybe bas" },\n    en: { label: "Subwoofer 12\\"", desc: "Behringer B1200D Pro, powered 12\\" sub, adds the deep bass" },'),
 # højtalerstativer
 ('da: { label: "Højtalerstativer", desc: "2 professionelle stativer, løfter lyden op i øjenhøjde" },\n    en: { label: "Speaker stands", desc: "2 professional stands, lifts the sound to ear level" },',
  'contents: ["2× højtalerstativ, Millenium BS-2211B", "Bæretaske til stativerne"],\n    da: { label: "Højtalerstativer", desc: "2 professionelle stativer (Millenium BS-2211B), løfter lyden op i øjenhøjde" },\n    en: { label: "Speaker stands", desc: "2 professional stands (Millenium BS-2211B), lifts the sound to ear level" },'),
 ('da: { label: "1 højtalerstativ", desc: "Ét stativ, løfter højtaleren op i ørehøjde" },',
  'da: { label: "1 højtalerstativ", desc: "Ét Millenium-stativ, løfter højtaleren op i ørehøjde" },'),
 # Soundboks batteri: eget foto, ikke højtalerens
 ('    image: "/images/product-soundboks-v2-white.webp",\n    da: { label: "Soundboks batteri",',
  '    image: "/images/product-soundboks-batteri-white.webp",\n    contents: ["Soundboks batteri (USB-C)", "Opladet ved afhentning"],\n    da: { label: "Soundboks batteri",'),
 # stativer til DJ
 ('da: { label: "X-stativ", desc: "Sammenklappeligt X-stativ til DJ-pult eller keyboard" },\n    en: { label: "X-stand", desc: "Folding X-stand for a DJ controller or keyboard" },',
  'contents: ["Gravity KSX 2 X-stativ"],\n    da: { label: "X-stativ", desc: "Gravity KSX 2, sammenklappeligt X-stativ til DJ-pult eller keyboard" },\n    en: { label: "X-stand", desc: "Gravity KSX 2, folding X-stand for a DJ controller or keyboard" },'),
 ('da: { label: "DJ-stativ med klæde", desc: "X-stativ med sort klæde foran, skjuler kabler og giver en pæn DJ-front" },\n    en: { label: "DJ stand with cloth", desc: "X-stand with a black front cloth, hides cables and gives a tidy DJ booth" },',
  'contents: ["Gravity KSX 2 RD Set: X-stativ med sort klæde"],\n    da: { label: "DJ-stativ med klæde", desc: "Gravity KSX 2 RD Set: X-stativ med sort klæde foran, skjuler kabler og giver en pæn DJ-front" },\n    en: { label: "DJ stand with cloth", desc: "Gravity KSX 2 RD Set: X-stand with a black front cloth, hides cables and gives a tidy DJ booth" },'),
 # mikrofoner
 ('da: { label: "Mikrofon med ledning", desc: "Håndholdt mikrofon med kabel, sættes direkte i højtaleren" },\n    en: { label: "Wired microphone", desc: "Handheld wired microphone, plugs straight into the speaker" },',
  'contents: ["the t.bone MB 60", "XLR-kabel"],\n    da: { label: "Mikrofon med ledning", desc: "the t.bone MB 60, håndholdt mikrofon med kabel, sættes direkte i højtaleren" },\n    en: { label: "Wired microphone", desc: "the t.bone MB 60, handheld wired microphone, plugs straight into the speaker" },'),
 ('    image: "/images/product-mikrofon-v2-white.webp",\n    da: { label: "Trådløs mikrofon", desc: "Professionel håndholdt mikrofon til taler og karaoke" },\n    en: { label: "Wireless mic", desc: "Professional handheld mic for speeches and karaoke" },',
  '    image: "/images/product-mikrofon-pro-v2-white.webp",\n    contents: ["Shure BLX24/SM58 trådløs mikrofon", "Shure modtager", "Kabel til højtaler"],\n    da: { label: "Trådløs mikrofon", desc: "Shure BLX24 med SM58, trådløs håndholdt mikrofon til taler og karaoke" },\n    en: { label: "Wireless mic", desc: "Shure BLX24 with SM58, wireless handheld mic for speeches and karaoke" },'),
 ('desc_da: "Almindelig håndholdt mikrofon med kabel, til taler og sang.", desc_en: "Standard wired handheld microphone, for speeches and vocals.",',
  'desc_da: "the t.bone MB 60, håndholdt dynamisk mikrofon med kabel, til taler og sang.", desc_en: "the t.bone MB 60, wired dynamic handheld microphone, for speeches and vocals.",'),
 ('contents: ["Håndholdt mic", "XLR/kabel"]', 'contents: ["the t.bone MB 60", "XLR-kabel"]'),
 ('contents: ["Headset-mikrofon", "Bodypack + modtager", "Kabelforbindelse"]',
  'contents: ["Shure BLX14 med PGA31 headset", "Bodypack + modtager", "Kabel til højtaler"]'),
 # højtalerpakkerne
 ('contents: [\'2× Alto 10" højtalere\', "Bluetooth", "AUX + strømkabler", "USB-C / iPhone-adapter"],\n    da: {\n      name: "Lille højtalerpakke",',
  'contents: [\'2× Alto TX 410 10" højtalere\', "Bluetooth", "AUX + strømkabler", "USB-C / iPhone-adapter"],\n    da: {\n      name: "Lille højtalerpakke",'),
 ('desc: \'To kompakte 10" højtalere med Bluetooth. Vejer kun 12 kg, passer i bæretaske, klar til cyklen.\',\n      extra: "Inkl. alle kabler. Bæretaske og stativ kan tilkøbes.",',
  'desc: \'To kompakte 10" Alto TX 410 med Bluetooth. Vejer kun 12 kg, klar til cyklen.\',\n      extra: "Inkl. alle kabler. Stativer og mikrofon kan tilkøbes.",'),
 ('contents: [\'2× EV 12" højtalere\', "Bluetooth", "AUX + strømkabler", "USB-C / iPhone-adapter"],\n    da: {\n      name: "Mellem højtalerpakke",',
  'contents: [\'2× EV ZLX 12P G2 12" højtalere\', "Bluetooth", "AUX + strømkabler", "USB-C / iPhone-adapter"],\n    da: {\n      name: "Mellem højtalerpakke",'),
 ('desc: \'To kraftige 12" aktive højtalere med Bluetooth. Klar lyd til større rum og udendørs arrangementer.\',',
  'desc: \'To kraftige 12" EV ZLX 12P G2 med Bluetooth. Klar lyd til større rum og udendørs arrangementer.\','),
 ('    product: "/images/product-festival-bas-v2-white.webp",', '    product: "/images/product-hojtalerpakke-stor-white.webp",'),
 ('contents: [\'2× EV 12" højtalere\', \'12" subwoofer\', "Højtalerstativer", "Alle kabler"],',
  'contents: [\'2× EV ZLX 12P G2 12" højtalere\', "Behringer B1200D Pro subwoofer", "Alle kabler"],'),
 ('desc: \'To aktive 12" EV-højtalere på stativer med en 12" subwoofer under. Trinnet over Mellem højtalerpakke, når rummet er større end 50 gæster.\',\n      extra: "Uden lys, vil du have lys med, er Festpakke 150 samme lyd plus lys og røg.",',
  'desc: \'To aktive 12" EV ZLX 12P G2 med en Behringer 12" subwoofer. Trinnet over Mellem højtalerpakke, når rummet er større end 50 gæster.\',\n      extra: "Stativer kan tilkøbes. Vil du have lys med, er Festpakke 50-100 samme lyd plus to lysbarer.",'),
 ('desc: \'Two active 12" EV speakers on stands with a 12" subwoofer. The step above the medium speaker package, for rooms with more than 50 guests.\',\n      extra: "Without lights, for lights, Party package 150 is the same sound plus lights and fog.",',
  'desc: \'Two active 12" EV ZLX 12P G2 with a Behringer 12" subwoofer. The step above the medium speaker package, for rooms with more than 50 guests.\',\n      extra: "Stands are an add-on. For lights, Party package 50-100 is the same sound plus two light bars.",'),
 # lys
 ('contents: ["2× farvede LED-lamper", "Centereffekt", "Stativ", "Strøm + DMX/kabler"],',
  'contents: ["2× Fun Generation PartyPar 12 LED", "ADJ Mini Dekker centereffekt", "Stativ", "Strøm + kabler"],'),
 ('    image: "/images/product-lyseffekt-live-white.webp",', '    image: "/images/product-lyseffekt-z20-white.webp",'),
 ('contents: ["1× LED-par-lys (uden stativ)", "Strømkabel", "Automatiske farveeffekter"],\n    da: { label: "Enkelt lyseffekt", desc: "1 LED-par-lys med farveeffekter, leveres uden stativ, plug and play" },\n    en: { label: "Single light effect", desc: "1 LED par light with colour effects, comes without a stand, plug and play" },',
  'contents: ["Eurolite LED Mini Z-20 beam-effekt", "USB-strømkabel", "Automatiske effekter"],\n    da: { label: "Enkelt lyseffekt", desc: "Eurolite LED Mini Z-20, lille USB-drevet beam-effekt med roterende farvede stråler, plug and play" },\n    en: { label: "Single light effect", desc: "Eurolite LED Mini Z-20, a small USB-powered beam effect with rotating coloured beams, plug and play" },'),
 ('desc_da: "Simpel LED uplight på gulv, plug and play. Vasker vægge og hjørner i farvet lys.", desc_en: "Simple floor LED uplight, plug and play. Washes walls and corners in coloured light.",',
  'desc_da: "Fun Generation PartyPar 12 LED uplight inkl. fjernbetjening, plug and play. Vasker vægge og hjørner i farvet lys.", desc_en: "Fun Generation PartyPar 12 LED uplight incl. remote, plug and play. Washes walls and corners in coloured light.",'),
 ('contents: ["1× LED uplight", "Strømkabel", "Automatiske farver"]', 'contents: ["1× Fun Generation PartyPar 12 LED", "Fjernbetjening", "Strømkabel"]'),
 ('contents: ["4× LED uplight", "Strømkabler", "Plug and play"]', 'contents: ["4× Fun Generation PartyPar 12 LED", "Fjernbetjening", "Strømkabler"]'),
 ('contents: ["LED UV-lampe", "Strømkabel"]', 'contents: ["Stairville Wild Wash 9×3 W LED UV", "Strømkabel"]'),
 ('contents: ["RGB-laser", "Strømkabel"]', 'contents: ["Laserworld EL-230RGB MKII", "Strømkabel"]'),
 ('contents: ["LED-følgespot 120 W", "Stativ", "Strømkabel"]', 'contents: ["Showtec Followspot LED 120 W", "Stativ", "Strømkabel"]'),
 ('da: { label: "Lysstativ", desc: "Stativ med T-bar til lyseffekter. Lampen er ikke med, den vælges for sig" },',
  'contents: ["Stativ", "Stairville Mini T-Bar 2"],\n    da: { label: "Lysstativ", desc: "Stativ med Stairville Mini T-Bar til lyseffekter. Lampen er ikke med, den vælges for sig" },'),
 ('contents: ["4× LED PAR", "Stativ med tværbom", "Fjernbetjening", "Strømkabler"]', 'contents: ["4× Fun Generation PartyPar 12 LED", "Stageworx TS-120 tværbom på stativ", "Fjernbetjening", "Strømkabler"]'),
 ('contents: ["1× EV ZLX 12P aktiv højtaler", "Strømkabel"]', 'contents: ["1× EV ZLX 12P G2 aktiv højtaler", "Strømkabel"]'),
 # diskokugler
 ('contents: ["Discokugle 40 cm", "Motor", "LED-spot", "Stativ/ophæng", "Strømkabel"]', 'contents: ["Showtec Professional Mirrorball 40 cm", "Motor", "LED-spot", "Stativ", "Strømkabel"]'),
 ('contents: ["Discokugle 30 cm", "Motor", "LED-spot", "Stativ/ophæng", "Strømkabel"]', 'contents: ["Showtec Professional Mirrorball 30 cm", "Motor", "LED-spot", "Stativ", "Strømkabel"]'),
 ('contents: ["Discokugle 40 cm guld", "Motor", "LED-spot", "Stativ", "Strømkabel"]', 'contents: ["Eurolite Mirror Ball 40 cm gold", "Motor", "LED-spot", "Stativ", "Strømkabel"]'),
 # røg, sne, bobler
 ('contents: ["Røgmaskine", "Røgvæske", "Strømkabel"],\n    da: { label: "Røgmaskine", desc: "Kompakt røgmaskine inkl. røgvæske, gør lyset 10x federe" },',
  'contents: ["Eliminator VF1300 EP røgmaskine", "Røgvæske", "Fjernbetjening", "Strømkabel"],\n    da: { label: "Røgmaskine", desc: "Eliminator VF1300 EP, kompakt røgmaskine inkl. røgvæske, gør lyset 10x federe" },'),
 ('contents: ["Low fog-maskine", "Røgvæske", "Is-bakke / instruks"]', 'contents: ["Eurolite NB-60 ICE low fog-maskine", "Røgvæske", "Is-bakke / instruks"]'),
 ('contents: ["Snemaskine", "Snevæske", "Strømkabel"]', 'contents: ["Eliminator VF Flurry EP snemaskine", "Snevæske", "Strømkabel"]'),
 ('contents: ["Sæbeboblemaskine", "Boblevæske", "Strømkabel"]', 'contents: ["Eurolite SD201 DMX sæbeboblemaskine", "Boblevæske", "Strømkabel"]'),
])
patch("src/lib/mixerModels.ts", [
 ('desc: "6 mikrofonindgange, 2 stereoindgange, effekter og stereo-USB. Til panel, møde og mindre band. Kræver strøm." },',
  'desc: "Kompakt mixer med effekter og USB, til flere mikrofoner, tale og musik. Kræver strøm." },'),
 ('desc: "6 microphone inputs, 2 stereo inputs, effects and stereo USB. For panels, meetings and small bands. Mains power required." },',
  'desc: "Compact mixer with effects and USB, for several microphones, speech and music. Mains power required." },'),
])

# ── Produktsiderne ───────────────────────────────────────────────────────────
patch("src/app/ekstra-batteri/page.tsx", [
 ("Lej Ekstra Batteri til Batterihøjtaler | 395 kr | Lejhøjtaler.dk", "Lej Soundboks Batteri | 395 kr | Lejhøjtaler.dk"),
 ("Lej Ekstra Batteri | 395 kr", "Lej Soundboks Batteri | 395 kr"),
 ('description: "Ekstra batteri til batterihøjtaler, dobbelt spilletid uden strøm."', 'description: "Ekstra batteri til Soundboks 4, dobbelt spilletid uden strøm."'),
 ('"thump go batteri leje", ', ""),
 ('name="Ekstra batteri"', 'name="Soundboks batteri"'), ('headline="Lej ekstra batteri"', 'headline="Lej ekstra batteri til Soundboks 4"'),
 ("Et ekstra batteri til Mackie Thump GO eller Soundboks 4, så festen", "Et ekstra batteri til Soundboks 4, så festen"),
 ('image="/images/product-thumpgo-v2-white.webp"', 'image="/images/product-soundboks-batteri-white.webp"'),
 ('imageAlt="Ekstra batteri til batterihøjtaler"', 'imageAlt="Soundboks batteri til leje"'),
 ('"Passer til Mackie Thump GO og Soundboks 4"', '"Originalt Soundboks-batteri, passer til Soundboks 4"'),
 ("holder Soundboks 4 omkring 40 timer på lav og 10-12 timer på høj; Thump GO omkring 12 timer.", "holder Soundboks 4 omkring 40 timer på lav og 10-12 timer på høj."),
])
patch("src/app/en/ekstra-batteri/page.tsx", [
 ("Extra Battery for Battery Speaker Rental | 395 DKK | Lejhøjtaler.dk", "Soundboks Battery Rental | 395 DKK | Lejhøjtaler.dk"),
 ("Extra battery rental | 395 DKK", "Soundboks battery rental | 395 DKK"),
 ('description: "Extra battery for battery speakers, double the playtime without power."', 'description: "Extra battery for the Soundboks 4, double the playtime without power."'),
 ('"thump go battery rental copenhagen", ', ""),
 ('name="Extra battery"', 'name="Soundboks battery"'), ('headline="Rent an extra battery"', 'headline="Rent an extra battery for the Soundboks 4"'),
 ("An extra battery for the Mackie Thump GO or Soundboks 4, so the party", "An extra battery for the Soundboks 4, so the party"),
 ('image="/images/product-thumpgo-v2-white.webp"', 'image="/images/product-soundboks-batteri-white.webp"'),
 ('imageAlt="Extra battery for a battery-powered speaker"', 'imageAlt="Soundboks battery for rent"'),
 ('"Fits the Mackie Thump GO and Soundboks 4"', '"Original Soundboks battery, fits the Soundboks 4"'),
 ("lasts about 40 hours on low and 10-12 hours on high; the Thump GO about 12 hours.", "lasts about 40 hours on low and 10-12 hours on high."),
])
patch("src/app/haandholdt-mikrofon/page.tsx", [("sub={'Almindelig håndholdt mikrofon med kabel, til taler og sang.'}", "sub={'the t.bone MB 60, håndholdt dynamisk mikrofon med kabel, til taler og sang.'}")])
patch("src/app/en/haandholdt-mikrofon/page.tsx", [('sub="Standard wired handheld microphone, for speeches and vocals."', 'sub="the t.bone MB 60, wired dynamic handheld microphone, for speeches and vocals."')])
patch("src/app/traadloes-mikrofon/page.tsx", [
 ('sub="Professionel trådløs håndholdt mikrofon til taler, bryllup og events."', 'sub="Shure BLX24 med SM58, trådløs håndholdt mikrofon i scenekvalitet til taler, bryllup og events."'),
 ('image="/images/product-mikrofon-v2-white.webp"', 'image="/images/product-mikrofon-pro-v2-white.webp"'), ('imageAlt="Trådløs mikrofon til leje i København"', 'imageAlt="Shure BLX24 trådløs mikrofon til leje i København"'),
])
patch("src/app/en/traadloes-mikrofon/page.tsx", [
 ('sub="Wireless handheld microphone for speeches, weddings and events."', 'sub="Shure BLX24 with SM58, a stage-quality wireless handheld microphone for speeches, weddings and events."'),
 ('image="/images/product-mikrofon-v2-white.webp"', 'image="/images/product-mikrofon-pro-v2-white.webp"'), ('imageAlt="Wireless microphone for rent in Copenhagen"', 'imageAlt="Shure BLX24 wireless microphone for rent in Copenhagen"'),
])
patch("src/app/headset-mikrofon/page.tsx", [
 ('sub="Trådløst headset til præsentationer og konferencer. Hands-free."', 'sub="Shure BLX14 trådløst headset til præsentationer og konferencer. Hands-free."'),
 ('image="/images/product-headset-v2-white.webp"', 'image="/images/product-headset-pro-v2-white.webp"'),
])
patch("src/app/en/headset-mikrofon/page.tsx", [
 ('sub="Wireless headset for presentations and conferences. Hands-free."', 'sub="Shure BLX14 wireless headset for presentations and conferences. Hands-free."'),
 ('image="/images/product-headset-v2-white.webp"', 'image="/images/product-headset-pro-v2-white.webp"'),
])
patch("src/app/enkelt-lyseffekt/page.tsx", [
 ('sub="1 LED-par-lys (uden stativ), plug and play farveeffekt der sætter stemning på få minutter."', 'sub="Eurolite LED Mini Z-20, lille USB-drevet beam-effekt med roterende farvede stråler. Plug and play på få minutter."'),
 ('image="/images/product-lyseffekt-live-white.webp"', 'image="/images/product-lyseffekt-z20-white.webp"'), ('imageAlt="Enkelt LED-festlys til leje i København"', 'imageAlt="Eurolite LED Mini Z-20 beam-effekt til leje i København"'),
])
patch("src/app/en/enkelt-lyseffekt/page.tsx", [
 ('sub="One LED par light (no stand), a plug-and-play colour effect that sets the mood in minutes."', 'sub="Eurolite LED Mini Z-20, a small USB-powered beam effect with rotating coloured beams. Plug and play in minutes."'),
 ('image="/images/product-lyseffekt-live-white.webp"', 'image="/images/product-lyseffekt-z20-white.webp"'), ('imageAlt="Single LED party light for rent in Copenhagen"', 'imageAlt="Eurolite LED Mini Z-20 beam effect for rent in Copenhagen"'),
])
patch("src/app/hojtalerpakke-bas/page.tsx", [
 ("sub={'De store 12\" EV-højtalere på stativer med en 12\" subwoofer under, trinnet over Mellem højtalerpakke.'}", "sub={'De store 12\" EV ZLX 12P G2 med en Behringer 12\" subwoofer, trinnet over Mellem højtalerpakke. Stativer kan tilkøbes.'}"),
 ('image="/images/product-festival-bas-v2-white.webp"', 'image="/images/product-hojtalerpakke-stor-white.webp"'),
 ('imageAlt="Højtalerpakke med to 12 tommer EV-højtalere på stativer og subwoofer til leje i København"', 'imageAlt="Stor højtalerpakke med to 12 tommer EV-højtalere og subwoofer til leje i København"'),
])
patch("src/app/en/hojtalerpakke-bas/page.tsx", [
 ('sub={"The large 12\\" EV speakers on stands with a 12\\" subwoofer underneath, the step above the medium speaker package."}', 'sub={"The large 12\\" EV ZLX 12P G2 with a Behringer 12\\" subwoofer, the step above the medium speaker package. Stands are an add-on."}'),
 ('image="/images/product-festival-bas-v2-white.webp"', 'image="/images/product-hojtalerpakke-stor-white.webp"'),
 ('imageAlt="Speaker package with two 12 inch EV speakers on stands and a subwoofer for rent in Copenhagen"', 'imageAlt="Large speaker package with two 12 inch EV speakers and a subwoofer for rent in Copenhagen"'),
])
patch("src/app/hojtalerpakke-lille/page.tsx", [
 ('2× 10\\" Alto med Bluetooth. Kabler og taske inkluderet.', '2× 10\\" Alto TX 410 med Bluetooth. Alle kabler inkluderet.'),
 ("sub={'To kompakte 10\" Alto højtalere med Bluetooth - klar til cyklen.'}", "sub={'To kompakte 10\" Alto TX 410 med Bluetooth, klar til cyklen.'}"),
 ('"Alle kabler inkl., bæretaske og stativ kan tilkøbes"', '"Alle kabler inkl., stativer og mikrofon kan tilkøbes"'),
])
patch("src/app/en/hojtalerpakke-lille/page.tsx", [('"All cables included, carry bag and stands available as add-ons"', '"All cables included, stands and microphone available as add-ons"')])
patch("src/app/hojtalerstativer/page.tsx", [('sub="2 professionelle stativer, der løfter', 'sub="2 professionelle Millenium-stativer, der løfter')])
patch("src/app/en/hojtalerstativer/page.tsx", [('sub="2 professional stands that lift', 'sub="2 professional Millenium stands that lift')])
patch("src/app/mixer/page.tsx", [
 ("Lej Mixer København | 4, 6 og 8 mikrofonindgange | Lejhøjtaler.dk", "Lej Mixer København | Mixer med effekter | 345 kr | Lejhøjtaler.dk"),
 ("t.mix 1202 FXMP USB med 6 mikrofonindgange til 345 kr.", "t.mix xmix 1202 FXMP USB med effekter og USB til 345 kr."),
 ("Tre mixerklasser med 4, 6 eller 8 mikrofonindgange. t.mix 1202 FXMP USB med effekter og stereo-USB til møde, panel og band.", "t.mix xmix 1202 FXMP USB med effekter og USB til møde, panel og band. Lille og stor model på forespørgsel."),
])
patch("src/app/en/mixer/page.tsx", [
 ("Choose 4, 6 or 8 microphone inputs. Our t.mix 1202 FXMP USB is 345 DKK;", "Our t.mix xmix 1202 FXMP USB with effects and USB is 345 DKK;"),
 ("Three mixer sizes: 4, 6 or 8 microphone inputs. t.mix 1202 FXMP USB with effects and stereo USB for meetings, panels and bands.", "t.mix xmix 1202 FXMP USB with effects and USB for meetings, panels and bands. Small and large models on request."),
])
patch("src/lib/categoryFaq.ts", [
 ('"Mackie Mix12FX tilbydes på forespørgsel fra 295 kr. Vores t.mix 1202 FXMP USB med " +\n        "6 mikrofonindgange koster 395 kr. t.mix 1402 FXMP USB med 8 mikrofonindgange tilbydes på forespørgsel fra 495 kr. Priserne gælder 1–5 dage."',
  '"Vores mixer med effekter, t.mix xmix 1202 FXMP USB, koster 345 kr. En mindre (Mackie Mix12FX) og en større (t.mix 1402 FXMP USB) " +\n        "tilbydes på forespørgsel fra 295 kr. Priserne gælder 1–5 dage."'),
 ('"Lille: Mackie Mix12FX med 4 mikrofonindgange. Mellem: t.mix 1202 FXMP USB med 6. Stor: t.mix 1402 FXMP USB med 8. " +\n        "Stereoindgange tælles særskilt. Mellemklassen kan bookes direkte; lille og stor aftales på forespørgsel."',
  '"Mixeren med effekter (t.mix xmix 1202 FXMP USB) kan bookes direkte og dækker de fleste taler, paneler og mindre bands. " +\n        "En mindre og en større model aftales på forespørgsel."'),
 ('"Mackie Mix12FX is available on request from 295 DKK. Our t.mix 1202 FXMP USB with " +\n        "6 microphone inputs is 395 DKK. The t.mix 1402 FXMP USB with 8 microphone inputs is on request from 495 DKK. Prices cover 1–5 days."',
  '"Our mixer with effects, the t.mix xmix 1202 FXMP USB, is 345 DKK. A smaller (Mackie Mix12FX) and a larger (t.mix 1402 FXMP USB) model " +\n        "are on request from 295 DKK. Prices cover 1–5 days."'),
 ('"Small: Mackie Mix12FX with 4 microphone inputs. Medium: t.mix 1202 FXMP USB with 6. Large: t.mix 1402 FXMP USB with 8. " +\n        "Stereo inputs are separate. Book the medium mixer online; small and large models are on request."',
  '"The mixer with effects (t.mix xmix 1202 FXMP USB) can be booked online and covers most speeches, panels and small bands. " +\n        "A smaller and a larger model are on request."'),
])
print("modeller: ok")
