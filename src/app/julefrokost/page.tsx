import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { catalogDiscount, prisKr } from "@/lib/products";

export const metadata: Metadata = {
  title: `Lyd og karaoke til julefrokost | Fra ${prisKr("pakke_karaoke")} | Lejhøjtaler.dk`,
  description: `Lej lyd og karaoke til julefrokosten i København fra ${prisKr("pakke_karaoke")}. Karaokemaskine med 2 mikrofoner, skærm og højtalere. Book online — betal ved afhentning.`,
  keywords: ["lyd til julefrokost", "karaoke til julefrokost", "højtaler julefrokost leje", "musikanlæg firmajulefrokost", "underholdning julefrokost"],
  alternates: { canonical: "https://lejhojtaler.dk/julefrokost" },
  openGraph: {
    title: `Lyd og karaoke til julefrokost | Fra ${prisKr("pakke_karaoke")} | Lejhøjtaler.dk`,
    description: `Lej lyd og karaoke til julefrokosten i København fra ${prisKr("pakke_karaoke")}. Karaokemaskine med 2 mikrofoner, skærm og højtalere. Book online — betal ved afhentning.`,
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
      headlinePriceId="pakke_karaoke"
      intro={"Karaoke er det, der får kollegerne op fra stolene. Maskine, skærm til teksterne og højtalere der kan følge med — samlet til én pris."}
      primaryProductId="pakke_firmafest"
      primaryName={"Firmafestpakke"}
      primaryWhy={"Julefrokosten starter med en tale og ender på dansegulvet. Mikrofonen klarer den første del, subwooferen den anden — og lys og røg gør, at kantinen holder op med at ligne en kantine."}
      gridItems={[{"id": "pakke_firmafest", "tag": "Anbefalet"}, {"id": "pakke_karaoke", "tag": `Spar ${catalogDiscount("pakke_karaoke")},-`}, {"id": "pakke_karaoke_fest", "tag": `Spar ${catalogDiscount("pakke_karaoke_fest")},-`}, {"id": "karaoke"}, {"id": "lyseffekt"}]}
      tips={[{"title": "Karaoke redder julefrokosten", "text": "Der er altid en periode efter maden, hvor stemningen falder. Karaoke er det, der får folk op igen — og det virker på tværs af aldersgrupper."}, {"title": "Book november i god tid", "text": "November og starten af december er årets travleste periode. Fredage og lørdage bliver booket flere uger i forvejen."}, {"title": "Tjek lokalets strøm", "text": "Karaokemaskine, skærm og højtalere trækker tilsammen ikke meget, men de skal have adgang til to stikkontakter. Sig til, hvis I mangler forlængerledning."}, {"title": "Lys gør det til en fest", "text": "En enkelt lyseffekt til " + prisKr("lyseffekt") + " ændrer et kontorlokale eller en kantine til et festlokale på fem minutter."}]}
      faq={[{"q": "Hvad er forskellen på de to karaokepakker?", "a": "Karaokepakken til " + prisKr("pakke_karaoke") + " har 32\" skærm og små højtalere og passer til op til 40 personer. Karaoke-festpakken til " + prisKr("pakke_karaoke_fest") + " har 55\" skærm og store højtalere og klarer op til 100 personer."}, {"q": "Skal vi bruge internet til karaoke?", "a": "Ja, hvis I vil bruge YouTube-karaoke via skærmen. Maskinen har også indbyggede sange og Bluetooth, så I kan streame fra en telefon."}, {"q": "Kan vi leje det til firmaets adresse?", "a": "Ja. Levering og opsætning i København koster " + prisKr("levering_ud") + ", og " + prisKr("levering_begge") + " hvis vi også henter igen efter frokosten — også hvis det bliver sent."}, {"q": "Hvor mange mikrofoner er der med?", "a": "To trådløse mikrofoner følger med karaokemaskinen, så I kan synge duet uden at sende den samme mikrofon rundt."}]}
      related={[{"href": "/firmafestpakke", "label": "Firmafestpakken", "priceId": "pakke_firmafest"}, {"href": "/karaoke", "label": "Alt om karaoke"}, {"href": "/nytaar", "label": "Lyd til nytårsfest"}, {"href": "/erhverv", "label": "Udlejning til erhverv"}]}
    />
  );
}
