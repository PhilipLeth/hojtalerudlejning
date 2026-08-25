import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisKr } from "@/lib/products";

export const metadata: Metadata = {
  title: `Højtaler til polterabend København | Fra ${prisKr("thumpgo")} | Lejhøjtaler.dk`,
  description: `Lej en batteridreven højtaler til polterabend i København fra ${prisKr("thumpgo")}. Ingen strøm nødvendig — tag den med i parken, på havnen eller i bussen. Book online.`,
  keywords: ["højtaler til polterabend", "lej højtaler polterabend", "batteri højtaler leje", "musik til polterabend", "soundboks leje københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/polterabend" },
  openGraph: {
    title: `Højtaler til polterabend København | Fra ${prisKr("thumpgo")} | Lejhøjtaler.dk`,
    description: `Lej en batteridreven højtaler til polterabend i København fra ${prisKr("thumpgo")}. Ingen strøm nødvendig — tag den med i parken, på havnen eller i bussen. Book online.`,
    url: "https://lejhojtaler.dk/polterabend",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      slug="polterabend"
      headline={"Højtaler til polterabend"}
      headlinePriceId="thumpgo"
      intro={"Musik der kan følge med hele dagen — uden stikkontakt. Batteridrevne højtalere I kan tage med i parken, på havnen og videre til festen."}
      primaryProductId="pakke_udendors"
      primaryName={"Udendørspakke"}
      primaryWhy={"Polterabenden flytter sig — fra baggården til parken til stranden. Anlægget kører på batteri, det ekstra batteri gør at det ikke går ud midt i det hele, og lyskæden tager over når det bliver mørkt."}
      gridItems={[{"id": "pakke_udendors", "tag": "Anbefalet"}, {"id": "thumpgo"}, {"id": "soundboks"}, {"id": "traadloes_mikrofon"}, {"id": "rog"}]}
      tips={[{"title": "Batteri slår kabel", "text": "En polterabend flytter sig. Vælg batteridrevet, så I ikke er bundet til en stikkontakt — begge vores batterihøjtalere spiller hele dagen på én opladning."}, {"title": "Tag den med på cyklen", "text": "Thump GO vejer 10 kg og kan spændes fast på en ladcykel. Bæretaske kan tilkøbes for " + prisKr("taske") + ", hvis den skal med i bagagerummet."}, {"title": "Hold øje med naboerne", "text": "Udendørs musik i København må ikke være til gene. Skru ned efter kl. 22, og flyt festen indenfor — så undgår I en klage."}, {"title": "Mikrofon til talerne", "text": "Skal der holdes tale eller laves konkurrencer undervejs, kan en trådløs mikrofon tilsluttes begge højtalere."}]}
      faq={[{"q": "Hvor længe holder batteriet?", "a": "Mackie Thump GO spiller op til 12 timer, Soundboks 4 op til 40 timer ved normal lydstyrke. Begge leveres fuldt opladt og med oplader."}, {"q": "Kan højtaleren tåle at være udenfor?", "a": "Ja, i tørvejr. Den må ikke stå i regnvejr eller i sand direkte. Kommer der en byge, så pak den ind — vi sender en bæretaske med, hvis I tilkøber den."}, {"q": "Hvad hvis vi vil have mere bas?", "a": "Soundboks 4 til " + prisKr("soundboks") + " har markant mere tryk end Thump GO. Til indendørs fester kan en subwoofer tilkøbes for " + prisKr("subwoofer") + "."}, {"q": "Kan vi hente fredag og aflevere søndag?", "a": "Ja. Prisen er den samme for 1 til 5 dages leje, så en weekend koster det samme som én dag."}]}
      related={[{"href": "/udendorspakke", "label": "Udendørspakken", "priceId": "pakke_udendors"}, {"href": "/soundboks-4", "label": "Soundboks 4"}, {"href": "/studenterkoersel", "label": "Højtaler til studenterkørsel"}, {"href": "/havefest", "label": "Lyd til havefest"}]}
    />
  );
}
