import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { catalogDiscount, prisKr } from "@/lib/products";

export const metadata: Metadata = {
  title: `Lyd til julefrokost | Fra ${prisKr("pakke_fest_lille")} | Lejhøjtaler.dk`,
  description: `Lej højtalere, mikrofon og festlys til julefrokosten i København fra ${prisKr("pakke_fest_lille")}. Talen skal høres, og bagefter skal der danses. Book online — betal ved afhentning.`,
  keywords: ["lyd til julefrokost", "højtaler julefrokost leje", "musikanlæg firmajulefrokost", "anlæg til julefrokost København", "lys til julefrokost"],
  alternates: { canonical: "https://lejhojtaler.dk/julefrokost" },
  openGraph: {
    title: `Lyd til julefrokost | Fra ${prisKr("pakke_fest_lille")} | Lejhøjtaler.dk`,
    description: `Lej højtalere, mikrofon og festlys til julefrokosten i København fra ${prisKr("pakke_fest_lille")}. Talen skal høres, og bagefter skal der danses. Book online — betal ved afhentning.`,
    url: "https://lejhojtaler.dk/julefrokost",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      slug="julefrokost"
      headline={"Lyd til julefrokost"}
      headlinePriceId="pakke_fest_lille"
      intro={"En julefrokost er to fester i én: talen skal høres i hele lokalet, og bagefter skal der danses. Højtalere, mikrofon, lys og røg — samlet i én pakke til én pris."}
      primaryProductId="pakke_firmafest"
      primaryName={"Firmafestpakke"}
      primaryWhy={"Julefrokosten starter med en tale og ender på dansegulvet. Mikrofonen klarer den første del, subwooferen den anden — og lys og røg gør, at kantinen holder op med at ligne en kantine."}
      gridItems={[{"id": "pakke_firmafest", "tag": "Anbefalet"}, {"id": "pakke_fest_stor", "tag": `Spar ${catalogDiscount("pakke_fest_stor")},-`}, {"id": "pakke_fest_lille", "tag": `Spar ${catalogDiscount("pakke_fest_lille")},-`}, {"id": "pakke_fest_150", "tag": "100-150 gæster"}, {"id": "pakke_lysshow", "tag": `Spar ${catalogDiscount("pakke_lysshow")},-`}]}
      tips={[{"title": "Talen først, dansegulvet bagefter", "text": "De to halvdele af en julefrokost stiller hver sit krav: talen skal kunne høres bagerst i lokalet, musikken skal kunne mærkes. Vælg en pakke der har mikrofon OG bas, så I ikke skal bytte anlæg midt på aftenen."}, {"title": "Book november i god tid", "text": "November og starten af december er årets travleste periode. Fredage og lørdage bliver booket flere uger i forvejen."}, {"title": "Spørg om der er røgalarm", "text": "Røgen er det, der gør lysstrålerne synlige, men en almindelig røgalarm i en kantine reagerer på den. Skal der være røg alligevel, lægger en low fog-maskine røgen på gulvet i stedet for op i loftet."}, {"title": "Lys gør det til en fest", "text": "En enkelt lyseffekt til " + prisKr("lyseffekt") + " ændrer et kontorlokale eller en kantine til et festlokale på fem minutter."}]}
      faq={[{"q": "Hvad koster lyd til en julefrokost?", "a": "Den lille festpakke koster " + prisKr("pakke_fest_lille") + " og rækker til kontorets egen julefrokost. Firmafestpakken til " + prisKr("pakke_firmafest") + " er den vi anbefaler: højtalere på stativer, trådløs mikrofon, subwoofer, lys og røgmaskine i én pris."}, {"q": "Kan alle høre talen?", "a": "Ja. Den trådløse mikrofon følger med firmafestpakken og går direkte i højtaleren — der skal ingen mixer imellem, og der er ingen ledning at snuble over."}, {"q": "Hvor mange gæster kan pakkerne dække?", "a": "Den lille festpakke tager op til 50 gæster, den store " + prisKr("pakke_fest_stor") + " op til 100, og Festpakke 150 til " + prisKr("pakke_fest_150") + " dækker et selskab på 100-150. Tallene gælder indendørs."}, {"q": "Kan vi leje det til firmaets adresse?", "a": "Ja. Levering og opsætning i København koster " + prisKr("levering_ud") + ", og " + prisKr("levering_begge") + " hvis vi også henter igen efter frokosten — også hvis det bliver sent."}]}
      related={[{"href": "/firmafestpakke", "label": "Firmafestpakken", "priceId": "pakke_firmafest"}, {"href": "/lydanlaeg", "label": "Anlæg efter antal gæster"}, {"href": "/nytaar", "label": "Lyd til nytårsfest"}, {"href": "/erhverv", "label": "Udlejning til erhverv"}]}
    />
  );
}
