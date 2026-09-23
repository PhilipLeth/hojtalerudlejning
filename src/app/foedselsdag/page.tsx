import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisKr } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lyd til fødselsdag København | Fra ${prisKr("thumpgo")} | Lejhøjtaler.dk`,
  description: `Lej lyd til fødselsdagen i København. Festpakken med højtalere, lysbar og mikrofon til den store dag, eller en lille Mackie på batteri fra ${prisKr("thumpgo")} til den lille. Book online.`,
  keywords: ["lyd til fødselsdag", "højtaler til fødselsdag", "musikanlæg fødselsdag leje", "lyd til rund fødselsdag", "børnefødselsdag musik"],
  alternates: {
    canonical: "https://lejhojtaler.dk/foedselsdag",
    languages: localeAlternates("/foedselsdag"),
  },
  openGraph: {
    images: ogImages(),
    title: `Lyd til fødselsdag København | Fra ${prisKr("thumpgo")} | Lejhøjtaler.dk`,
    description: `Festpakken til den store fødselsdag, eller en lille Mackie på batteri fra ${prisKr("thumpgo")} til den lille. Book online.`,
    url: "https://lejhojtaler.dk/foedselsdag",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      slug="foedselsdag"
      headline={"Lyd til fødselsdag"}
      headlinePriceId="thumpgo"
      intro={"Festpakken er svaret på de fleste fødselsdage: højtalere, lysbar og plads til en mikrofon, sat sammen på forhånd. Skal der bare være musik til kage og gaver, kan I nøjes med en lille Mackie på batteri. Alle kabler følger med, I skal bare tilslutte telefonen."}
      primaryProductId="pakke_fest_stor"
      primaryName={"Festpakke 30-50"}
      primaryWhy={"To 12\" EV-højtalere på stativer fylder stuen eller festlokalet uden at blive skingre, og lysbaren gør at der er forskel på middagen og festen bagefter. Rækker til op til 100 gæster."}
      gridItems={[{"id": "pakke_fest_stor", "tag": "Anbefalet"}, {"id": "pakke_fest_lille"}, {"id": "thumpgo", "tag": "Den lille fødselsdag"}, {"id": "mikrofon"}, {"id": "discokugle"}, {"id": "pakke_fest_100", "tag": "50-100 gæster"}]}
      tips={[{"title": "Den lille fødselsdag: en Mackie på batteri", "text": "Skal der bare være musik til kage og gaver, er en Mackie Thump GO nok. Den koster " + prisKr("thumpgo") + ", kører på batteri i timevis og kan stilles på bordet eller tages med i haven. Uden strøm, uden kabler, uden opsætning."}, {"title": "Til de runde: husk mikrofon", "text": "50- og 60-års fødselsdage er talefester. En trådløs mikrofon sikrer, at alle taler kan høres, også når stemmen bliver tynd af rørelse."}, {"title": "Til børnefødselsdag: discolys", "text": "En discokugle til " + prisKr("discokugle") + " eller en enkelt lyseffekt til " + prisKr("lyseffekt") + " forvandler stuen til et diskotek. Børn er lette at underholde med lys og musik."}, {"title": "Lav playlisten før gæsterne kommer", "text": "Anlægget kobles til én telefon ad gangen via Bluetooth. Har I listen klar på forhånd, slipper I for at fem gæster skiftes til at parre deres telefon midt i festen."}, {"title": "Book weekenden, ikke dagen", "text": "Prisen er den samme for 1 til 5 dages leje, så hent fredag og aflever mandag, selvom festen kun er lørdag. Så har I tid til at sætte op i ro."}]}
      faq={[{"q": "Hvad koster lyd til en fødselsdag?", "a": "Festpakke 0-30 med to højtalere og en lysbar koster " + prisKr("pakke_fest_lille") + " for op til 5 dages leje, og Festpakke 30-50 koster " + prisKr("pakke_fest_stor") + ". Til den lille fødselsdag er en Mackie Thump GO på batteri nok, og den koster " + prisKr("thumpgo") + "."}, {"q": "Kan man leje en lille højtaler til en lille fødselsdag?", "a": "Ja. Mackie Thump GO er vores mindste, den koster " + prisKr("thumpgo") + " og kører på batteri, så den kan stå på bordet eller komme med ud i haven. Skal der også være lys og en mikrofon, er det Festpakken, der er svaret."}, {"q": "Kan I levere til adressen?", "a": "Ja. Levering og opsætning i København koster " + prisKr("levering_ud") + ", så kommer vi ud og sætter op klar til brug, og du afleverer selv bagefter. Skal vi også hente igen efter festen, koster begge veje " + prisKr("levering_begge") + "."}, {"q": "Er det svært at sætte op?", "a": "Nej. Højtalerne tilsluttes strøm, og telefonen forbindes via Bluetooth. Det tager under fem minutter, og alle kabler følger med."}, {"q": "Har I noget til børnefødselsdag?", "a": "Discokugle til " + prisKr("discokugle") + " og en enkelt lyseffekt til " + prisKr("lyseffekt") + " er de mest populære til børn, stuen bliver til et diskotek, og musikken kommer fra telefonen. Begge dele kan tilvælges direkte i bookingen."}]}
      related={[{"href": "/festpakke-stor", "label": "Festpakke 30-50", "priceId": "pakke_fest_stor"}, {"href": "/ungdomsfest", "label": "Lyd og lys til ungdomsfest"}, {"href": "/havefest", "label": "Lyd til havefest"}, {"href": "/konfirmation", "label": "Lyd til konfirmation"}, {"href": "/blog/foedselsdagsfest-lyd", "label": "Guide: lyd til fødselsdag"}]}
    />
  );
}
