import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisKr } from "@/lib/products";
import { PHONE_DISPLAY } from "@/lib/phone";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lyd til nytårsfest København | Fra ${prisKr("pakke_fest_stor")} | Lejhøjtaler.dk`,
  description: `Lej lyd og lys til nytårsfesten i København fra ${prisKr("pakke_fest_stor")}. Højtalere, festlys og røgmaskine, book online og hent inden nytår. Betal ved afhentning.`,
  keywords: ["lyd til nytårsfest", "højtaler nytår leje", "musikanlæg nytårsfest", "festlys nytår", "lej anlæg nytårsaften"],
  alternates: { canonical: "https://lejhojtaler.dk/nytaar" },
  openGraph: {
    images: ogImages(),
    title: `Lyd til nytårsfest København | Fra ${prisKr("pakke_fest_stor")} | Lejhøjtaler.dk`,
    description: `Lej lyd og lys til nytårsfesten i København fra ${prisKr("pakke_fest_stor")}. Højtalere, festlys og røgmaskine, book online og hent inden nytår. Betal ved afhentning.`,
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
      headlinePriceId="pakke_fest_stor"
      intro={"Musik der holder til midnat og timerne efter. Højtalere og lys der forvandler stuen til et dansegulv, book i god tid, nytår er årets travleste aften."}
      primaryProductId="pakke_fest_100"
      primaryName={"Festpakke 50-100"}
      primaryWhy={"Nytår er den ene aften hvor bassen betyder noget. Subwooferen holder gulvet, de to lysbarer klarer stemningen, og anlægget rækker til op til 100 gæster."}
      gridItems={[{"id": "pakke_fest_100", "tag": "Anbefalet"}, {"id": "pakke_fest_stor"}, {"id": "rog"}, {"id": "discokugle"}, {"id": "subwoofer"}]}
      tips={[{"title": "Book før december", "text": "Nytårsaften er den enkeltdag, hvor flest anlæg er udlejet. Er du sent ude, så ring på " + PHONE_DISPLAY + ", vi har af og til afbud."}, {"title": "Afhentning omkring helligdage", "text": "Vores åbningstider ændrer sig mellem jul og nytår. De dage vi har åbent, kan vælges direkte i bookingen, hold øje med de særlige åbningsdage omkring nytår."}, {"title": "Røg gør lyset dobbelt så flot", "text": "Uden røg ser man lysstrålerne kun der, hvor de rammer. Med en røgmaskine til " + prisKr("rog") + " ser man selve strålerne i luften."}, {"title": "Tag hensyn efter midnat", "text": "Naboerne er vågne til midnat, men ikke nødvendigvis klokken tre. Skru ned for bassen efter et par timer, så slutter aftenen godt for alle."}]}
      faq={[{"q": "Kan jeg hente 30. december og aflevere 2. januar?", "a": "Ja. Prisen er den samme for op til 5 dages leje, så nytårsweekenden koster det samme som én dag. Du vælger tidspunkterne direkte i bookingen."}, {"q": "Er der nok lyd til 50 personer?", "a": "Ja. Festpakke 30-50 dækker 40-100 personer. Til mindre selskaber hjemme rækker Festpakke 0-30 til " + prisKr("pakke_fest_lille") + "."}, {"q": "Må jeg bruge røgmaskine i en lejlighed?", "a": "Ja, men tjek at der ikke sidder en røgalarm i samme rum, røgvæske kan udløse optiske alarmer. Luft ud undervejs."}, {"q": "Hvad hvis noget går i stykker nytårsaften?", "a": "Ring på " + PHONE_DISPLAY + ". Vi har reservedele og kan i mange tilfælde hjælpe over telefonen, også aften og weekend."}]}
      related={[{"href": "/festpakke-100", "label": "Festpakke 50-100", "priceId": "pakke_fest_100"}, {"href": "/festpakke-stor", "label": "Festpakke 30-50"}, {"href": "/festlys", "label": "Festlys"}, {"href": "/diskolys", "label": "Lej diskolys"}, {"href": "/julefrokost", "label": "Lyd til julefrokost"}]}
    />
  );
}
