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
import { prisKr, rabatKr, startPrisKr } from "@/lib/products";

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

/** Samme to svar på engelsk — de engelske kategorisider har dem også. */
const AFHENTNING_EN: FaqItem = {
  q: "Do I collect the equipment myself, or can you deliver?",
  a:
    "You can collect it for free at Vermlandsgade 66, 2300 Copenhagen. If you would rather have it " +
    "delivered, we drive anywhere in Copenhagen: 495 DKK for delivery and setup, where you return it " +
    "yourself, or 795 DKK if we both deliver and collect it again after the party. You choose in the booking.",
};

const LEJEPERIODE_EN: FaqItem = {
  q: "How long can I keep the equipment?",
  a:
    "From 1 to 5 days at the same price — there is no daily surcharge. Most customers collect on Friday and " +
    "return on Monday. If you need it for longer, call us on 31 13 28 52 and we will work it out.",
};

export const CATEGORY_FAQ: Record<string, FaqItem[]> = {
  "mixer": [
    {
      q: "Hvad koster det at leje en mixer i København?",
      a:
        "Den lille 4-kanals minimixer koster 295 kr for hele lejeperioden. Den store Yamaha-mixer med " +
        "indbyggede effekter koster 395 kr. Begge priser gælder 1 til 5 dage — der er ingen dagstillæg.",
    },
    {
      q: "Hvornår har jeg brug for en mixer?",
      a:
        "Når der skal mere end én ting i højtaleren på samme tid. En enkelt mikrofon eller en telefon går " +
        "direkte i højtaleren uden mixer. Skal to mikrofoner og musik køre samtidig — en tale med baggrundsmusik, " +
        "et band, en duet — er det mixeren, der samler det og lader dig skrue på hver kilde for sig.",
    },
    {
      q: "Hvad er forskellen på den lille og den store?",
      a:
        "Antallet af kanaler og effekterne. Den lille har fire kanaler og gør præcis det, den skal: samler to " +
        "mikrofoner og en musikkilde. Den store er en Yamaha med indbyggede effekter, så du kan lægge rumklang " +
        "på vokalen — det er dét, der får en stemme til at lyde som til en koncert frem for som en højtaler i " +
        "et lokale. Vælg den store til band, kor og alt hvor der bliver sunget.",
    },
    {
      q: "Følger kablerne med?",
      a:
        "Ja. Strømforsyning og kabel til højtaleren er med. Mikrofonkabler følger med mikrofonerne. " +
        "Sig til ved booking, hvis du har noget særligt, der skal tilsluttes, så lægger vi det rigtige i.",
    },
    AFHENTNING,
    LEJEPERIODE,
  ],
  "lej-mikrofon": [
    {
      q: "Hvad koster det at leje en mikrofon i København?",
      a:
        "En håndholdt mikrofon med kabel koster 95 kr for hele lejeperioden, og Shure-udgaven 395 kr. " +
        "Skal du kunne bevæge dig, koster en trådløs mikrofon 295 kr og Shure BLX i scenekvalitet 595 kr. " +
        "Et trådløst headset koster 345 kr, og PRO-udgaven 595 kr.",
    },
    {
      q: "Hvilken mikrofon skal jeg vælge til taler?",
      a:
        "Til taler ved en middag er en håndholdt trådløs det rigtige: den bliver sendt rundt mellem talerne, og " +
        "man kan holde den ned, når man ikke taler. Et headset er til den, der skal tale længe og bruge hænderne " +
        "— en underviser eller en toastmaster. Skal mikrofonen kun stå ét sted, sparer du penge med kabel.",
    },
    {
      q: "Kan mikrofonen tilsluttes jeres højtalere?",
      a:
        "Ja. Alle vores mikrofoner har XLR- eller jack-udgang, og højtalerpakkerne har indgange til begge. " +
        "Modtageren til de trådløse sættes direkte i højtaleren — der skal ikke en mixer imellem. " +
        "Kablerne følger med.",
    },
    {
      q: "Hvor mange mikrofoner kan jeg bruge på samme tid?",
      a:
        "To trådløse kan køre samtidig uden problemer. Skal I have flere — et band, en paneldebat — så ring " +
        "på 31 13 28 52, så finder vi den rigtige opsætning. Til mange kilder på én gang er en mixer det, " +
        "der binder det sammen.",
    },
    AFHENTNING,
    LEJEPERIODE,
  ],
  "lysshow": [
    {
      q: "Hvad koster et lysshow?",
      a:
        "Lysshow med lys-pakke, discokugle og røgmaskine koster 1.495 kr. Det store lysshow med fire uplights " +
        "og low fog i stedet koster 1.995 kr. Vil du have lys uden røg, er Stemningslys-pakken 1.045 kr. " +
        "Alle priser er for hele lejeperioden, ikke pr. dag.",
    },
    {
      q: "Hvorfor er røg med i et lysshow?",
      a:
        "Fordi en lysstråle kun kan ses, hvis der er noget i luften at ramme. Uden røg ser man farvede pletter " +
        "på væggen; med røg bliver selve strålen synlig, og det er dét, der ligner et show. Det er den enkelte " +
        "ting, der gør størst forskel for pengene.",
    },
    {
      q: "Hvad er forskellen på røgmaskine og low fog?",
      a:
        "En almindelig røgmaskine (595 kr) fylder rummet med røg, der driver op i luften og gør lyset synligt. " +
        "Low fog-maskinen (795 kr) bruger is og lægger røgen som et tæppe på gulvet — den er til første dans " +
        "og til lokaler, hvor en røgalarm ikke må gå i gang.",
    },
    {
      q: "Kan jeg få lysshowet sat op?",
      a:
        "Ja. Levering og opsætning i København koster 495 kr, og 795 kr hvis vi også henter igen bagefter. " +
        "Til det store lysshow med uplights er det pengene værd — uplights skal placeres i hjørner og langs " +
        "vægge for at virke, og det tager tid at finde de rigtige steder.",
    },
    AFHENTNING,
    LEJEPERIODE,
  ],
  "lej-hojtaler": [
    {
      q: "Hvad koster det at leje højtalere i København?",
      a:
        `Fra ${startPrisKr()} for en hel weekend. Den batteridrevne Mackie Thump GO koster ${prisKr("thumpgo")}, den lille højtalerpakke ` +
        `med to 10" Alto-højtalere ${prisKr("party")}, den store pakke med to 12" EV-højtalere ${prisKr("festival")} og Soundboks 4 ${prisKr("soundboks")}. ` +
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
        "Skal der både være tale og musik, findes Tale & musik-pakken til 1.195 kr med to 12\" højtalere og " +
        "trådløs mikrofon. Projektor og skærm udlejer vi ikke lige nu.",
    },
    {
      q: "Hvad er forskellen på et festanlæg og et taleanlæg?",
      a:
        "Et festanlæg er bygget til musik og bas og skal kunne spille højt i mange timer. Et taleanlæg er bygget til " +
        "at gøre en stemme tydelig — mikrofon og klar diskant. Skal I bruge begge dele, findes " +
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

  lyspakker: [
    {
      q: "Hvad koster det at leje en lyspakke?",
      a:
        "Fra 695 kr for en weekend. Festtelt-lys med to lyskæder og fire uplights koster 695 kr, Diskolys-pakken med " +
        "lyseffekt og discokugle 845 kr, Teenagefest-lys 945 kr og Stemningslys-pakken 1.045 kr. Bryllupslys med low fog " +
        "til brudevalsen koster 1.245 kr, og Diskotek-pakken — det fulde dansegulv uden røg — 1.295 kr.",
    },
    {
      q: "Hvilken lyspakke skal jeg vælge?",
      a:
        "Vælg efter anledningen: telt eller have → Festtelt-lys. Et dansegulv i stuen → Diskolys-pakken. Teenagefødselsdag " +
        "i kælderen → Teenagefest-lys. Et helt lokale, der skal skifte karakter → Stemningslys-pakken. Bryllup → " +
        "Bryllupslys-pakken. Og må der ikke bruges røg i lokalet, er Diskotek-pakken bygget til netop det.",
    },
    {
      q: "Er lyspakkerne svære at sætte op?",
      a:
        "Nej — alt er plug and play på almindelige stikkontakter. Uplights og lyseffekter kører automatiske farver, " +
        "discokuglen har motor og spot med, og lyskæderne skal bare hænges op. Der skal ikke programmeres eller styres noget.",
    },
    {
      q: "Kan jeg leje lys uden lyd?",
      a:
        "Ja, alle lyspakkerne er ren lys — de spiller sammen med den musik, I allerede har. Skal der også lyd med, " +
        "kan du kombinere med en højtaler i bookingen eller kigge på festpakkerne, hvor lyd og lys er samlet.",
    },
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


  /* Siden dækker hele mødet: billedet og lyden. Projektor, skærm og lærred kom
     i udlejning igen 8. september 2026 efter en pause — spørgsmålet om billedet
     står først, fordi det er dét, folk kommer for at spørge om. */
  "av-udstyr": [
    {
      q: "Hvad koster det at leje mikrofon til et møde i København?",
      a:
        "En trådløs håndholdt mikrofon koster 295 kr for hele lejeperioden, en Shure BLX i scenekvalitet " +
        "595 kr, et trådløst headset 345 kr og et PRO-headset 595 kr. Skal der også være lyd, koster Tale & " +
        "musik-pakken med to 12\" højtalere og trådløs mikrofon 1.195 kr.",
    },
    {
      q: "Hvad koster det at leje projektor, lærred og storskærm?",
      a:
        "En Full HD-projektor koster 495 kr for hele lejeperioden, en 5000 lumen PRO-projektor 795 kr, og et " +
        "lærred på 160 cm 195 kr. Foretrækker du en skærm, koster en 55\" storskærm på stativ 595 kr og en " +
        "32\" 395 kr. Alle priser gælder 1 til 5 dage — der er ingen dagstillæg.",
    },
    {
      q: "Skal jeg vælge projektor eller storskærm?",
      a:
        "Storskærmen er nemmest: den skal bare have strøm og et HDMI-kabel, og den virker i fuldt dagslys. " +
        "Projektoren giver et meget større billede og er bedre til film og til en sal, men den vil helst have " +
        "mørke — skal den bruges om dagen, så tag PRO-modellen på 5000 lumen.",
    },
    {
      q: "Skal der en mixer imellem mikrofonen og højtaleren?",
      a:
        "Nej. Alle vores mikrofoner går direkte i højtaleren med det kabel, der følger med. Skal der være " +
        "flere end to mikrofoner, eller lyd til Teams og Zoom, så ring — det sætter vi op efter aftale.",
    },
    {
      q: "Hvor mange deltagere rækker lyden til?",
      a:
        "To 10\" højtalere dækker et mødelokale med op til 50 deltagere, og to 12\" på stativer rækker til " +
        "en sal med 100-150. Udendørs uden vægge regner du med cirka det halve.",
    },
    AFHENTNING,
  ],
  /* Karaoke kom i udlejning igen 8. september 2026. Spørgsmålene er dem, der
     afgør købet: hvad koster det, skal der en skærm til, og rækker lyden. */
  karaoke: [
    {
      q: "Hvad koster det at leje karaoke i København?",
      a:
        "Karaokemaskinen alene koster 695 kr for hele lejeperioden — den har indbygget skærm, to trådløse " +
        "mikrofoner og festlys. Karaokepakken med 32\" skærm og to højtalere koster 1.300 kr, og " +
        "Karaoke-festpakken med 55\" storskærm og de store højtalere 2.000 kr. Priserne gælder 1 til 5 dage.",
    },
    {
      q: "Skal jeg leje en skærm til, eller er maskinens egen nok?",
      a:
        "Maskinens indbyggede skærm rækker til to-tre personer, der står tæt på. Skal hele selskabet kunne " +
        "læse teksten, skal der en skærm på stativ til — en 32\" til 395 kr klarer stuen, en 55\" til 595 kr " +
        "hele festen.",
    },
    {
      q: "Rækker karaokemaskinens lyd til en fest?",
      a:
        "Til en aften i stuen, ja. Skal der synges til fest, skal stemmen kunne høres over snakken — så lejer " +
        "du højtalere med. Den lille højtalerpakke dækker op til 30 gæster, den store 30-50.",
    },
    {
      q: "Er der mikrofoner med i karaokemaskinen?",
      a:
        "Ja, to trådløse mikrofoner følger med maskinen. Skal I være flere om at synge, eller skal der også " +
        "holdes tale, kan der lejes ekstra mikrofoner til fra 95 kr.",
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
        `Den batteridrevne Mackie Thump GO til ${prisKr("thumpgo")} for en hel weekend. Skal der to højtalere til, koster den ` +
        `lille højtalerpakke ${prisKr("party")}. Begge priser gælder for op til 5 dage, og alle kabler er med.`,
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
        "Konferencepakken (1.395 kr) er 55\" storskærm, trådløst headset og to 10\" højtalere — klar til et " +
        "mødelokale. Til en sal med 100-150 deltagere tager Konferencepakke 150 (2.395 kr) over med to 12\" " +
        "højtalere på stativer, Shure-mikrofon, headset og skærm. Skal der bruges flere end to mikrofoner, " +
        "eller lyd til Teams og Zoom, sætter vi det op efter aftale — skriv til os.",
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
   * De engelske kategorisider.
   *
   * Nøglerne har "en-"-præfiks, så de ikke kan forveksles med de danske, og
   * svarene er SKREVET på engelsk — ikke oversat sætning for sætning. En
   * englænder i København søger "microphone rental copenhagen" og "party light
   * rental", ikke "rent light bar", så spørgsmålene er formuleret derefter.
   * Tallene er de samme som på dansk, fordi priserne er de samme.
   */
  "en-lej-hojtaler": [
    {
      q: "How much does it cost to rent speakers in Copenhagen?",
      a:
        `From ${startPrisKr()} for a whole weekend. The battery-powered Mackie Thump GO is ${prisKr("thumpgo")}, the small speaker ` +
        `package with two 10" Alto speakers ${prisKr("party")}, the large package with two 12" EV speakers ${prisKr("festival")} and ` +
        `Soundboks 4 ${prisKr("soundboks")}. The price is the same whether you keep it for 1 or 5 days, and all cables are included.`,
    },
    {
      q: "How powerful a speaker do I need for my party?",
      a:
        "Up to 30 guests, the Mackie Thump GO or the small speaker package is enough. For 30-50 guests take the " +
        "Soundboks 4 or the large speaker package. If you are more, Party package 150 (2.345 kr) and Party package 250 " +
        "(3.645 kr) bring a subwoofer and stands with them. The guest numbers are for indoor use — outdoors the sound " +
        "carries less far.",
    },
    {
      q: "Can I rent a speaker that works without power?",
      a:
        "Yes. The Mackie Thump GO (395 kr) and Soundboks 4 (795 kr) run on battery for up to 12 hours, so they work " +
        "in the park, on the beach or in a courtyard with no socket.",
    },
    {
      q: "Can I carry the speakers on a bike?",
      a:
        "Yes. The Mackie Thump GO weighs 10 kg and the small speaker package 12 kg — both fit on the back of a bike. " +
        "A padded carry bag can be added for 95 kr. The large speaker package is 2× 16 kg and is easier in a car.",
    },
    AFHENTNING_EN,
  ],
  "en-lydanlaeg": [
    {
      q: "Which PA system fits the number of guests?",
      a:
        "Party package 50 (890 kr) for up to 50 guests, Party package 100 (1.290 kr) for 50-100, Party package 150 " +
        "(2.345 kr) for 100-150 with a subwoofer and stands, and Party package 250 (3.645 kr) for 150-250 with four " +
        "speakers and two subwoofers. If you are over 250, we source larger tops and subs and send a technician on the " +
        "day — write to us.",
    },
    {
      q: "Do the guest numbers apply outdoors too?",
      a:
        "No. The numbers are for indoors, where the walls hold on to the sound. Outdoors it escapes upwards and " +
        "outwards, so go one step up — or add a subwoofer for 295 kr.",
    },
    {
      q: "Can I get a microphone for speeches?",
      a:
        "Yes. A wireless microphone is 295 kr, a stage-quality Shure BLX 595 kr and a wireless headset 345 kr. If you " +
        "need both speech and music, the speech & music package at 1.195 kr has two 12\" speakers and a wireless " +
        "microphone. We do not rent out projectors and screens at the moment.",
    },
    {
      q: "What is the difference between a party system and a speech system?",
      a:
        "A party system is built for music and bass and has to play loudly for hours. A speech system is built to make " +
        "a voice clear — a microphone and crisp treble. If you need both, the speech & music package does the two at " +
        "once.",
    },
    LEJEPERIODE_EN,
    AFHENTNING_EN,
  ],
  "en-mixer": [
    {
      q: "How much does it cost to rent a mixer in Copenhagen?",
      a:
        "The small 4-channel mini mixer is 295 kr for the whole rental period. The large Yamaha mixer with built-in " +
        "effects is 395 kr. Both prices cover 1 to 5 days — there is no daily surcharge.",
    },
    {
      q: "When do I actually need a mixer?",
      a:
        "When more than one thing has to go into the speaker at the same time. A single microphone or a phone plugs " +
        "straight into the speaker without one. If two microphones and music have to run together — a speech over " +
        "background music, a band, a duet — the mixer is what ties it together and lets you set each source on its own.",
    },
    {
      q: "What is the difference between the small and the large one?",
      a:
        "The number of channels, and the effects. The small one has four channels and does exactly what it needs to: " +
        "it gathers two microphones and one music source. The large one is a Yamaha with built-in effects, so you can " +
        "put reverb on a vocal — that is what makes a voice sound like a concert rather than a speaker in a room. " +
        "Take the large one for bands, choirs and anything with singing.",
    },
    {
      q: "Are the cables included?",
      a:
        "Yes. The power supply and the cable to the speaker come with it. Microphone cables come with the microphones. " +
        "Tell us when you book if you have something particular to connect, and we will put the right one in.",
    },
    AFHENTNING_EN,
    LEJEPERIODE_EN,
  ],
  "en-roeg": [
    {
      q: "What is the difference between a fog machine and a low fog machine?",
      a:
        "An ordinary fog machine (595 kr) sends the fog up into the air, where it makes the light beams visible and " +
        "the party look like a club. A low fog machine (795 kr) cools the fog with ice so it settles as a carpet along " +
        "the floor and stays there — the effect you know from a wedding's first dance.",
    },
    {
      q: "Is fog fluid included in the price?",
      a:
        "Yes. Both the fog machine and the low fog machine come with fluid and a power cable, so you do not have to " +
        "buy anything yourself. For low fog you supply the ice — you get an ice tray and instructions with it.",
    },
    {
      q: "Can the fog set off a fire alarm?",
      a:
        "Fog from a fog machine can set off sensitive smoke alarms, especially optical ones at ceiling height. Keep the " +
        "machine away from alarms, and always ask the venue first — most places have a procedure for it. Low fog stays " +
        "along the floor and is therefore less exposed.",
    },
    {
      q: "How much fog do you actually need?",
      a:
        "Less than people think. A couple of short bursts early in the evening is enough to make the light visible — " +
        "fill the room and the guests cannot see each other. The machine can be run as needed through the evening.",
    },
    AFHENTNING_EN,
  ],
  "en-lej-mikrofon": [
    {
      q: "How much does it cost to rent a microphone in Copenhagen?",
      a:
        "A wired handheld microphone is 95 DKK for the whole rental period, and the Shure version 395 DKK. " +
        "If you need to move around, a wireless handheld is 295 DKK and the stage-quality Shure BLX 595 DKK. " +
        "A wireless headset is 345 DKK, and the PRO version 595 DKK.",
    },
    {
      q: "Which microphone should I choose for speeches at a dinner?",
      a:
        "A wireless handheld. It gets passed between the speakers, and you can lower it when you are not " +
        "talking. A headset is for the person who talks for a long time and needs their hands — a teacher or " +
        "a toastmaster. If the microphone stays in one place all evening, a wired one saves you money.",
    },
    {
      q: "Can the microphone be connected to your speakers?",
      a:
        "Yes. All our microphones have an XLR or jack output, and the speaker packages have inputs for both. " +
        "The receiver for the wireless ones plugs straight into the speaker — you do not need a mixer in " +
        "between. All cables are included.",
    },
    {
      q: "How many microphones can I use at the same time?",
      a:
        "Two wireless microphones run side by side without trouble. If you need more — a band, a panel " +
        "discussion — call us on 31 13 28 52 and we will find the right setup. For many sources at once, a " +
        "mixer is what holds it together.",
    },
    AFHENTNING_EN,
    LEJEPERIODE_EN,
  ],
  "en-festlys": [
    {
      q: "How much does it cost to rent party lights in Copenhagen?",
      a:
        "A single light effect is 395 DKK, one uplight 125 DKK (four of them 395 DKK), a disco ball 495 DKK " +
        "(30 cm) or 595 DKK (40 cm) and 10 m of fairy lights 195 DKK. The light package with two coloured LED " +
        "lamps, a centre effect and a stand is 495 DKK. A fog machine is 595 DKK, and the low fog machine that " +
        "lays fog along the floor 795 DKK.",
    },
    {
      q: "Do I need fog for the lights to work?",
      a:
        "Not strictly, but it makes a big difference. A light beam only becomes visible when there is " +
        "something in the air to catch it — without fog you just see the coloured dots the light lands on. " +
        "A fog machine is 595 DKK and comes with fluid.",
    },
    {
      q: "Are party lights hard to set up?",
      a:
        "No. Uplights and light effects are plug and play: put them in a socket and they run automatic " +
        "colours in time with the music. The light package comes on a stand with every cable, so there is " +
        "nothing to rig.",
    },
    {
      q: "What is the difference between a fog machine and low fog?",
      a:
        "An ordinary fog machine (595 DKK) fills the room with fog that drifts upwards and makes the light " +
        "visible. The low fog machine (795 DKK) cools the fog with ice so it stays as a carpet along the " +
        "floor — the 'dancing on clouds' effect from weddings and music videos.",
    },
    AFHENTNING_EN,
  ],
  "en-lysshow": [
    {
      q: "How much does a light show cost to rent?",
      a:
        "The light show with the light package, a disco ball and a fog machine is 1.495 DKK. The large light " +
        "show, with four uplights and low fog instead, is 1.995 DKK. If you want light without fog, the " +
        "ambient light package is 1.045 DKK. All prices are for the whole rental period, not per day.",
    },
    {
      q: "Why is fog part of a light show?",
      a:
        "Because a beam of light can only be seen if there is something in the air for it to hit. Without fog " +
        "you get coloured dots on the wall; with it the beam itself becomes visible, and that is what looks " +
        "like a show. If you are unsure about one add-on, this is the one.",
    },
    {
      q: "What is the difference between a fog machine and low fog?",
      a:
        "An ordinary fog machine (595 DKK) fills the room with fog that makes the light visible. The low fog " +
        "machine (795 DKK) uses ice to cool the fog so it lies like a carpet on the floor — for the first " +
        "dance, and for venues where the smoke alarm must stay quiet.",
    },
    {
      q: "Can you set the light show up for me?",
      a:
        "Yes. Delivery and setup in Copenhagen is 495 DKK, and 795 DKK if we collect it again afterwards. " +
        "For the large light show with uplights it is worth the money — uplights have to be placed in corners " +
        "and along walls to work, and finding the right spots takes time.",
    },
    AFHENTNING_EN,
    LEJEPERIODE_EN,
  ],

  /**
   * /en er den eneste engelske side, der sælger — og den, der skal fanges på
   * "speaker rental copenhagen". Svarene er de samme fakta som på dansk.
   */
  en: [
    {
      q: "How much does it cost to rent a speaker in Copenhagen?",
      a:
        `From ${startPrisKr()} for a whole weekend. The battery-powered Mackie Thump GO is ${prisKr("thumpgo")}, the small speaker ` +
        `package ${prisKr("party")}, the large package ${prisKr("festival")} and Soundboks 4 ${prisKr("soundboks")}. The price is the same whether you keep ` +
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
