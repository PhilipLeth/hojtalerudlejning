/**
 * Spørgsmål og svar til kategori- og guidesiderne.
 *
 * Produktsiderne får deres FAQ bygget automatisk af kataloget (productFaq.ts).
 * Det kan kategorisiderne ikke: deres spørgsmål handler om VALGET mellem
 * produkter — hvilket anlæg til hvor mange gæster, hvad forskellen er på
 * røgmaskine og low fog — og det svar findes ingen steder i kataloget.
 * Derfor er de skrevet i hånden.
 *
 * Hver eneste pris herunder er slået op i products.ts. Skifter en pris der,
 * skal den rettes her — category-faq.test.ts fejler, hvis et tal i et svar
 * ikke længere findes i kataloget.
 *
 * Sproget er sat efter hvordan folk spørger ("Hvad koster det at leje…"),
 * ikke efter hvordan vi ville formulere en overskrift: svarmaskinerne matcher
 * på spørgsmålet.
 */
import type { FaqItem } from "@/components/FaqSection";

/** Går igen på alle kategorisider — afhentning og de to kørselspriser. */
const AFHENTNING: FaqItem = {
  q: "Skal jeg selv hente udstyret, eller kan I levere?",
  a:
    "Du kan hente gratis hos os på Vermlandsgade 66, 2300 København. Vil du hellere have det leveret, kører vi ud i " +
    "hele København: 495 kr for levering og opsætning, hvor du selv afleverer bagefter, eller 795 kr hvis vi både " +
    "skal levere og hente igen efter festen. Du vælger det i bookingen.",
};

const LEJEPERIODE: FaqItem = {
  q: "Hvor længe kan jeg leje udstyret?",
  a:
    "Fra 1 til 5 dage til samme pris — der er ingen dagstillæg. De fleste henter fredag og afleverer mandag. " +
    "Skal du bruge det længere, så ring på 31 13 28 52, så finder vi ud af det.",
};

export const CATEGORY_FAQ: Record<string, FaqItem[]> = {
  "lej-hojtaler": [
    {
      q: "Hvad koster det at leje højtalere i København?",
      a:
        "Fra 345 kr for en hel weekend. Den batteridrevne Mackie Thump GO koster 395 kr, den lille højtalerpakke " +
        "med to 10\" Alto-højtalere 395 kr, den store pakke med to 12\" EV-højtalere 995 kr og Soundboks 4 795 kr. " +
        "Prisen er den samme, uanset om du har udstyret 1 eller 5 dage, og alle kabler er med.",
    },
    {
      q: "Hvor kraftige højtalere skal jeg bruge til min fest?",
      a:
        "Op til 30 gæster rækker Mackie Thump GO eller den lille højtalerpakke. Til 30-50 gæster tager du Soundboks 4 " +
        "eller den store højtalerpakke. Er I flere, giver Festpakke 150 (2.345 kr) og Festpakke 250 (3.645 kr) " +
        "subwoofer og stativer med. Gæstetallene gælder indendørs — udendørs bærer lyden kortere.",
    },
    {
      q: "Kan jeg leje en højtaler uden strøm?",
      a:
        "Ja. Mackie Thump GO (395 kr) og Soundboks 4 (795 kr) er batteridrevne med op til 12 timers spilletid, så de " +
        "kan bruges i parken, på stranden eller i baggården, hvor der ikke er en stikkontakt.",
    },
    {
      q: "Kan jeg have højtalerne med på cyklen?",
      a:
        "Ja. Mackie Thump GO vejer 10 kg og den lille højtalerpakke 12 kg — begge kan være bag på cyklen. En polstret " +
        "bæretaske kan tilkøbes for 95 kr. Den store højtalerpakke vejer 2× 16 kg og er nemmere i bil.",
    },
    AFHENTNING,
  ],

  lydanlaeg: [
    {
      q: "Hvilket lydanlæg passer til antallet af gæster?",
      a:
        "Festpakke 50 (890 kr) til op til 50 gæster, Festpakke 100 (1.290 kr) til 50-100, Festpakke 150 (2.345 kr) til " +
        "100-150 med subwoofer og stativer, og Festpakke 250 (3.645 kr) til 150-250 med fire højtalere og to " +
        "subwoofere. Er I over 250, skaffer vi større tops og subs og sender en tekniker med på dagen — skriv til os.",
    },
    {
      q: "Gælder gæstetallene også udendørs?",
      a:
        "Nej. Tallene er indendørs, hvor væggene holder på lyden. Udendørs forsvinder lyden opad og udad, så vælg " +
        "gerne ét trin op — eller læg en subwoofer til for 295 kr.",
    },
    {
      q: "Kan jeg få mikrofon med til taler?",
      a:
        "Ja. En trådløs mikrofon koster 295 kr, en Shure BLX i scenekvalitet 595 kr og et trådløst headset 345 kr. " +
        "Skal der både være tale og skærm, findes Præsentationspakken til 695 kr, Konferencepakken til 1.395 kr og " +
        "Konferencepakke 150 til 2.395 kr.",
    },
    {
      q: "Hvad er forskellen på et festanlæg og et taleanlæg?",
      a:
        "Et festanlæg er bygget til musik og bas og skal kunne spille højt i mange timer. Et taleanlæg er bygget til " +
        "at gøre en stemme tydelig — mikrofon, klar diskant og som regel en skærm. Skal I bruge begge dele, findes " +
        "Tale & musik-pakken, der kan det samtidig.",
    },
    LEJEPERIODE,
    AFHENTNING,
  ],

  lydudstyr: [
    {
      q: "Hvad koster det at leje et PA-anlæg i København?",
      a:
        "Den store højtalerpakke med to aktive 12\" EV-højtalere koster 995 kr for en weekend. Skal der mere tryk på, " +
        "giver Festpakke 150 (2.345 kr) dig samme højtalere plus subwoofer, stativer, lys og røg.",
    },
    {
      q: "Hvad er inkluderet i PA-anlægget?",
      a:
        "To 12\" EV aktive højtalere med Bluetooth, AUX- og strømkabler samt USB-C/iPhone-adapter. Højtalerstativer " +
        "kan tilkøbes for 100 kr og en 12\" subwoofer for 295 kr.",
    },
    {
      q: "Kan jeg tilslutte mikrofon til anlægget?",
      a:
        "Ja. En trådløs mikrofon (295 kr) eller en Shure BLX PRO (595 kr) forbindes direkte til højtaleren med det " +
        "medfølgende kabel. Har I brug for mixer og flere mikrofoner til et panel, laver vi et tilbud — ring på " +
        "31 13 28 52.",
    },
    {
      q: "Er anlægget kraftigt nok til udendørs brug?",
      a:
        "Den store højtalerpakke dækker 30-50 gæster indendørs. Udendørs bærer lyden kortere, så regn med færre — " +
        "eller læg en subwoofer til, som giver bassen den vægt, der ellers forsvinder under åben himmel.",
    },
    AFHENTNING,
  ],

  festlyd: [
    {
      q: "Hvad koster lyd til en fest?",
      a:
        "Den lille højtalerpakke koster 595 kr for en weekend. Vil du have lys med, koster Festpakke 50 med to " +
        "højtalere og en lyseffekt 890 kr, og Festpakke 100 med større højtalere og hele lys-pakken 1.290 kr.",
    },
    {
      q: "Hvordan spiller jeg musik gennem højtalerne?",
      a:
        "Via Bluetooth fra din telefon — det tager under et minut at parre. Vil du hellere have kabel, følger både " +
        "AUX-kabel og USB-C/iPhone-adapter med, så du undgår udfald midt i festen.",
    },
    {
      q: "Kan vi holde festen udenfor, hvor der ikke er strøm?",
      a:
        "Ja. Mackie Thump GO (395 kr) og Soundboks 4 (795 kr) kører på batteri i op til 12 timer. De resterende " +
        "pakker kræver en stikkontakt.",
    },
    {
      q: "Hvor mange gæster rækker de forskellige pakker til?",
      a:
        "Op til 50 gæster: Festpakke 50. 50-100: Festpakke 100. 100-150: Festpakke 150 med subwoofer. 150-250: " +
        "Festpakke 250 med fire højtalere. Tallene gælder indendørs.",
    },
    LEJEPERIODE,
    AFHENTNING,
  ],

  festlys: [
    {
      q: "Hvad koster det at leje festlys?",
      a:
        "En enkelt lyseffekt koster 395 kr, en uplight 125 kr (fire stk. 395 kr), en discokugle 495 kr (30 cm) eller 595 kr (40 cm) og en 10 m " +
        "lyskæde 195 kr. Lys-pakken med to farvede LED-lamper, centereffekt og stativ koster 495 kr. Røgmaskine " +
        "koster 595 kr og low fog-maskinen, der laver et røggulv, 795 kr.",
    },
    {
      q: "Skal jeg bruge røg for at lyset virker?",
      a:
        "Ikke nødvendigvis, men det gør en stor forskel. Lysstrålerne bliver først synlige i luften, når der er " +
        "lidt røg eller dis i rummet — uden røg ser du kun de farvede pletter, lyset rammer. En røgmaskine koster " +
        "595 kr og har røgvæske med.",
    },
    {
      q: "Er festlys svært at sætte op?",
      a:
        "Nej. Uplights og lyseffekter er plug and play: sæt i stikkontakten, og de kører automatiske farver i takt " +
        "til musikken. Lys-pakken kommer på stativ med alle kabler, så der ikke skal rigges noget til.",
    },
    {
      q: "Hvad er forskellen på en røgmaskine og low fog?",
      a:
        "En almindelig røgmaskine (595 kr) fylder rummet med røg, der gør lyset synligt. Low fog-maskinen (795 kr) " +
        "køler røgen med is, så den bliver liggende som et tæppe langs gulvet — 'dansen på skyer'-effekten fra " +
        "bryllupper og musikvideoer.",
    },
    AFHENTNING,
  ],

  karaoke: [
    {
      q: "Hvad koster det at leje karaoke i København?",
      a:
        "Karaokepakken koster 1.300 kr og indeholder karaokemaskine med to trådløse mikrofoner, 32\" skærm på " +
        "stativ og to 10\" højtalere — nok til op til 40 personer. Karaoke-festpakken koster 2.000 kr og har 55\" " +
        "storskærm og to 12\" højtalere til op til 100 personer. Karaokemaskinen alene koster 695 kr.",
    },
    {
      q: "Hvor mange mikrofoner følger med?",
      a:
        "To trådløse mikrofoner følger med karaokemaskinen, så I kan synge duet uden at sende den samme mikrofon " +
        "rundt i lokalet. Har I brug for flere, koster en ekstra trådløs mikrofon 295 kr.",
    },
    {
      q: "Skal vi bruge internet til karaoke?",
      a:
        "Kun hvis I vil synge med på YouTube-karaoke via skærmen. Maskinen har indbyggede sange, og den har " +
        "Bluetooth, så I også kan streame karaokeversioner fra en telefon.",
    },
    {
      q: "Kan jeg leje delene enkeltvis?",
      a:
        "Ja. Karaokemaskinen koster 695 kr, en 32\" skærm 395 kr, en 55\" storskærm 595 kr og den store " +
        "højtalerpakke 495 kr. Pakkerne er billigere end delene hver for sig — Karaokepakken sparer 385 kr.",
    },
    AFHENTNING,
  ],

  roeg: [
    {
      q: "Hvad er forskellen på en røgmaskine og en low fog-maskine?",
      a:
        "En almindelig røgmaskine (595 kr) sender røgen op i luften, hvor den gør lysstrålerne synlige og får " +
        "festen til at se ud som en klub. En low fog-maskine (795 kr) køler røgen med is, så den lægger sig som et " +
        "tæppe langs gulvet og bliver liggende — effekten man kender fra første dans til bryllupper.",
    },
    {
      q: "Er røgvæske inkluderet i prisen?",
      a:
        "Ja. Både røgmaskinen og low fog-maskinen kommer med røgvæske og strømkabel, så du ikke skal købe noget " +
        "selv. Til low fog skal du selv skaffe is — du får en is-bakke og en instruktion med.",
    },
    {
      q: "Kan røgen udløse en brandalarm?",
      a:
        "Røg fra en røgmaskine kan udløse følsomme røgalarmer, især optiske alarmer i lofthøjde. Hold derfor " +
        "maskinen væk fra alarmer, og spørg altid lokalet eller festsalen først — mange steder har en procedure " +
        "for det. Low fog holder sig langs gulvet og er derfor mindre udsat.",
    },
    {
      q: "Hvor meget røg skal der til?",
      a:
        "Mindre end folk tror. Et par korte skud i starten af aftenen er nok til at gøre lyset synligt — fylder du " +
        "rummet, kan gæsterne ikke se hinanden. Maskinen kan tændes efter behov gennem aftenen.",
    },
    AFHENTNING,
  ],

  "av-udstyr": [
    {
      q: "Hvad koster det at leje projektor og skærm i København?",
      a:
        "En Full HD-projektor koster 495 kr for en weekend, og Projektor Pro med 5000 lumen 795 kr. Et 160 cm " +
        "lærred koster 195 kr, en 32\" skærm på stativ 395 kr og en 55\" storskærm 595 kr.",
    },
    {
      q: "Hvilken pakke passer til et møde eller en konference?",
      a:
        "Præsentationspakken (695 kr) med projektor, lærred og mikrofon rækker til op til 50 deltagere. " +
        "Konferencepakken (1.395 kr) med 55\" skærm, trådløst headset og højtalere passer til 50-100. Til 100-150 " +
        "tager du Konferencepakke 150 (2.395 kr) med Shure-mikrofon, headset og store højtalere.",
    },
    {
      q: "Kan projektoren bruges i dagslys?",
      a:
        "Den almindelige projektor kræver, at der kan mørklægges. Skal der vises noget i et lyst lokale, tager du " +
        "Projektor Pro med 5000 lumen (795 kr), som er skarp selv i dagslys — eller en storskærm, der er upåvirket " +
        "af lyset i rummet.",
    },
    {
      q: "Hvilke kabler følger med?",
      a:
        "HDMI-kabel, strømkabel og fjernbetjening følger med projektorer og skærme. Kommer I med en Mac eller en " +
        "nyere pc uden HDMI-udgang, skal I selv have en adapter med — sig til, hvis I er i tvivl.",
    },
    AFHENTNING,
  ],

  kobenhavn: [
    {
      q: "Hvor i København henter jeg højtalerne?",
      a:
        "Hos os på Vermlandsgade 66, 2300 København S. Afhentning er gratis, og der er plads til at holde ved " +
        "døren, hvis du kommer i bil.",
    },
    {
      q: "Leverer I i hele København?",
      a:
        "Ja. Levering og opsætning koster 495 kr, hvor vi kører ud og sætter op klar til brug, og du selv " +
        "afleverer bagefter. Skal vi også hente igen efter festen, koster begge veje 795 kr.",
    },
    {
      q: "Hvad er det billigste anlæg, I har?",
      a:
        "Den batteridrevne Mackie Thump GO til 395 kr for en hel weekend. Skal der to højtalere til, koster den " +
        "lille højtalerpakke 395 kr. Begge priser gælder for op til 5 dage, og alle kabler er med.",
    },
    {
      q: "Kan jeg hente udstyret på cykel?",
      a:
        "Ja — det er sådan de fleste af vores kunder gør. Mackie Thump GO vejer 10 kg og den lille højtalerpakke " +
        "12 kg, og en polstret bæretaske kan tilkøbes for 95 kr.",
    },
    LEJEPERIODE,
  ],

  erhverv: [
    {
      q: "Kan I levere og sætte op til vores firmaevent?",
      a:
        "Ja. Levering og opsætning i København koster 495 kr, og 795 kr hvis vi både leverer og henter igen efter " +
        "arrangementet. Til større events kommer vi gerne ud i forvejen og ser lokalet.",
    },
    {
      q: "Hvilken pakke passer til en konference?",
      a:
        "Præsentationspakken (695 kr) til op til 50 deltagere, Konferencepakken (1.395 kr) med 55\" skærm og " +
        "trådløst headset til 50-100, og Konferencepakke 150 (2.395 kr) med Shure-mikrofon, headset, storskærm og " +
        "to 12\" højtalere til 100-150.",
    },
    {
      q: "Hvad gør vi, hvis vi er flere end 250 gæster?",
      a:
        "Så skaffer vi større tops og subwoofere til opgaven og sender en tekniker med på dagen. Skriv til os med " +
        "dato, lokale og antal gæster, så får I et samlet tilbud.",
    },
    {
      q: "Kan vi få flere mikrofoner til et panel?",
      a:
        "Ja. Ud over de trådløse mikrofoner (295 kr) og Shure BLX PRO (595 kr) sætter vi mixer og panelmikrofoner " +
        "op efter behov, også hvis mødet skal sendes på Teams eller Zoom. Det aftales i et tilbud.",
    },
    LEJEPERIODE,
    AFHENTNING,
  ],

  /**
   * /en er den eneste engelske side, der sælger — og den, der skal fanges på
   * "speaker rental copenhagen". Svarene er de samme fakta som på dansk.
   */
  en: [
    {
      q: "How much does it cost to rent a speaker in Copenhagen?",
      a:
        "From 345 kr for a whole weekend. The battery-powered Mackie Thump GO is 395 kr, the small speaker " +
        "package 395 kr, the large package 995 kr and Soundboks 4 795 kr. The price is the same whether you keep " +
        "the gear for 1 or 5 days, and all cables are included.",
    },
    {
      q: "Do you deliver, or do I pick the speakers up myself?",
      a:
        "Both. Pick-up is free at Vermlandsgade 66, 2300 Copenhagen. Delivery and setup anywhere in Copenhagen is " +
        "495 kr, where you return the gear yourself, or 795 kr if we both deliver and collect it afterwards.",
    },
    {
      q: "Can I rent a speaker that works without power?",
      a:
        "Yes. The Mackie Thump GO (395 kr) and Soundboks 4 (795 kr) run on battery for up to 12 hours, so they " +
        "work in the park, on the beach or in a courtyard with no power outlet.",
    },
    {
      q: "How long can I keep the equipment?",
      a:
        "From 1 to 5 days at the same price — there is no daily surcharge. Most customers collect on Friday and " +
        "return on Monday. Call 31 13 28 52 if you need it for longer.",
    },
    {
      q: "Can I pay by card, and do I need to speak Danish?",
      a:
        "You can pay securely online by card, or in cash when you collect. We speak English, so booking, pick-up " +
        "and any questions along the way can all be handled in English.",
    },
  ],
};
