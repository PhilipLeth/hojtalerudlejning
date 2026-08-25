import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisKr } from "@/lib/products";

export const metadata: Metadata = {
  title: `Lyd til fødselsdag København | Fra ${prisKr("pakke_fest_lille")} | Lejhøjtaler.dk`,
  description: `Lej lyd til fødselsdagen i København fra ${prisKr("pakke_fest_lille")}. Højtalere til tale og fest, discolys og mikrofon — til både børnefødselsdag og de runde dage. Book online.`,
  keywords: ["lyd til fødselsdag", "højtaler til fødselsdag", "musikanlæg fødselsdag leje", "lyd til rund fødselsdag", "børnefødselsdag musik"],
  alternates: { canonical: "https://lejhojtaler.dk/foedselsdag" },
  openGraph: {
    title: `Lyd til fødselsdag København | Fra ${prisKr("pakke_fest_lille")} | Lejhøjtaler.dk`,
    description: `Lej lyd til fødselsdagen i København fra ${prisKr("pakke_fest_lille")}. Højtalere til tale og fest, discolys og mikrofon — til både børnefødselsdag og de runde dage. Book online.`,
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
      headlinePriceId="pakke_fest_lille"
      intro={"Fra børnefødselsdag med discolys til den runde dag med taler. Vi har pakkerne, og alle kabler følger med — I skal bare tilslutte telefonen."}
      primaryProductId="pakke_fest_stor"
      primaryName={"Stor festpakke"}
      primaryWhy={"To 12\" EV-højtalere på stativer fylder stuen eller festlokalet uden at blive skingre, og lys-pakken gør at der er forskel på middagen og festen bagefter. Rækker til op til 100 gæster."}
      gridItems={[{"id": "pakke_fest_stor", "tag": "Anbefalet"}, {"id": "pakke_fest_lille"}, {"id": "traadloes_mikrofon"}, {"id": "discokugle"}, {"id": "pakke_fest_150", "tag": "100-150 gæster"}]}
      tips={[{"title": "Til de runde: husk mikrofon", "text": "50- og 60-års fødselsdage er talefester. En trådløs mikrofon sikrer, at alle taler kan høres — også når stemmen bliver tynd af rørelse."}, {"title": "Til børnefødselsdag: discolys", "text": "En discokugle til " + prisKr("discokugle") + " eller en enkelt lyseffekt til " + prisKr("lyseffekt") + " forvandler stuen til et diskotek. Børn er lette at underholde med lys og musik."}, {"title": "Lav playlisten før gæsterne kommer", "text": "Anlægget kobles til én telefon ad gangen via Bluetooth. Har I listen klar på forhånd, slipper I for at fem gæster skiftes til at parre deres telefon midt i festen."}, {"title": "Book weekenden, ikke dagen", "text": "Prisen er den samme for 1 til 5 dages leje, så hent fredag og aflever mandag, selvom festen kun er lørdag. Så har I tid til at sætte op i ro."}]}
      faq={[{"q": "Hvad koster lyd til en fødselsdag?", "a": "Den lille festpakke med to højtalere og en enkelt lyseffekt koster " + prisKr("pakke_fest_lille") + " for op til 5 dages leje. Vil I kun have højtalere, koster den lille højtalerpakke " + prisKr("party") + "."}, {"q": "Kan I levere til adressen?", "a": "Ja. Levering og opsætning i København koster " + prisKr("levering_ud") + " — så kommer vi ud og sætter op klar til brug, og du afleverer selv bagefter. Skal vi også hente igen efter festen, koster begge veje " + prisKr("levering_begge") + "."}, {"q": "Er det svært at sætte op?", "a": "Nej. Højtalerne tilsluttes strøm, og telefonen forbindes via Bluetooth. Det tager under fem minutter, og alle kabler følger med."}, {"q": "Har I noget til børnefødselsdag?", "a": "Discokugle til " + prisKr("discokugle") + " og en enkelt lyseffekt til " + prisKr("lyseffekt") + " er de mest populære til børn — stuen bliver til et diskotek, og musikken kommer fra telefonen. Begge dele kan tilvælges direkte i bookingen."}]}
      related={[{"href": "/festpakke-stor", "label": "Stor festpakke", "priceId": "pakke_fest_stor"}, {"href": "/havefest", "label": "Lyd til havefest"}, {"href": "/konfirmation", "label": "Lyd til konfirmation"}, {"href": "/blog/foedselsdagsfest-lyd", "label": "Guide: lyd til fødselsdag"}]}
    />
  );
}
