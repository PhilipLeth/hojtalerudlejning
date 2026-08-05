import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";

export const metadata: Metadata = {
  title: "Lyd til nytårsfest København | Fra 1.000 kr | Lejhøjtaler.dk",
  description: "Lej lyd og lys til nytårsfesten i København fra 1.000 kr. Højtalere, festlys og røgmaskine — book online og hent inden nytår. Betal ved afhentning.",
  keywords: ["lyd til nytårsfest", "højtaler nytår leje", "musikanlæg nytårsfest", "festlys nytår", "lej anlæg nytårsaften"],
  alternates: { canonical: "https://lejhojtaler.dk/nytaar" },
  openGraph: {
    title: "Lyd til nytårsfest København | Fra 1.000 kr | Lejhøjtaler.dk",
    description: "Lej lyd og lys til nytårsfesten i København fra 1.000 kr. Højtalere, festlys og røgmaskine — book online og hent inden nytår. Betal ved afhentning.",
    url: "https://lejhojtaler.dk/nytaar",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      slug="nytaar"
      headline={"Lyd til nytårsfest"}
      headlinePrice={"fra 1.000 kr."}
      intro={"Musik der holder til midnat og timerne efter. Højtalere og lys der forvandler stuen til et dansegulv — book i god tid, nytår er årets travleste aften."}
      primaryProductId="pakke_fest_stor"
      primaryName={"Stor festpakke"}
      primaryPrice={1000}
      primaryWhy={"To 12\" højtalere på stativer og en lys-pakke med farvede lamper og centereffekt. Nok lyd til at overdøve fyrværkeriet og nok lys til at gøre stuen til et diskotek."}
      gridItems={[{"id": "pakke_fest_stor", "tag": "Anbefalet"}, {"id": "rog"}, {"id": "discokugle"}, {"id": "subwoofer"}]}
      tips={[{"title": "Book før december", "text": "Nytårsaften er den enkeltdag, hvor flest anlæg er udlejet. Er du sent ude, så ring på 31 13 28 52 — vi har af og til afbud."}, {"title": "Afhentning omkring helligdage", "text": "Vores åbningstider ændrer sig mellem jul og nytår. Skriv i kommentarfeltet hvornår du vil hente, så bekræfter vi et konkret tidspunkt."}, {"title": "Røg gør lyset dobbelt så flot", "text": "Uden røg ser man lysstrålerne kun der, hvor de rammer. Med en røgmaskine til 245 kr ser man selve strålerne i luften."}, {"title": "Tag hensyn efter midnat", "text": "Naboerne er vågne til midnat, men ikke nødvendigvis klokken tre. Skru ned for bassen efter et par timer, så slutter aftenen godt for alle."}]}
      faq={[{"q": "Kan jeg hente 30. december og aflevere 2. januar?", "a": "Ja. Prisen er den samme for op til 5 dages leje, så nytårsweekenden koster det samme som én dag. Skriv dine ønskede tidspunkter i kommentarfeltet."}, {"q": "Er der nok lyd til 50 personer?", "a": "Ja. Den store festpakke dækker 40-100 personer. Til mindre selskaber hjemme rækker den lille festpakke til 500 kr."}, {"q": "Må jeg bruge røgmaskine i en lejlighed?", "a": "Ja, men tjek at der ikke sidder en røgalarm i samme rum — røgvæske kan udløse optiske alarmer. Luft ud undervejs."}, {"q": "Hvad hvis noget går i stykker nytårsaften?", "a": "Ring på 31 13 28 52. Vi har reservedele og kan i mange tilfælde hjælpe over telefonen — også aften og weekend."}]}
      related={[{"href": "/festpakke-stor", "label": "Stor festpakke"}, {"href": "/festlys", "label": "Festlys"}, {"href": "/julefrokost", "label": "Lyd til julefrokost"}]}
    />
  );
}
