import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";

export const metadata: Metadata = {
  title: "Lyd til havefest København | Fra 495 kr | Lejhøjtaler.dk",
  description: "Lej lyd til havefesten i København fra 495 kr. Højtalere til udendørs brug, lyskæder og batteriløsninger uden strøm. Book online — betal ved afhentning.",
  keywords: ["lyd til havefest", "højtaler til havefest", "udendørs højtaler leje", "musikanlæg have", "lyskæder til havefest"],
  alternates: { canonical: "https://lejhojtaler.dk/havefest" },
  openGraph: {
    title: "Lyd til havefest København | Fra 495 kr | Lejhøjtaler.dk",
    description: "Lej lyd til havefesten i København fra 495 kr. Højtalere til udendørs brug, lyskæder og batteriløsninger uden strøm. Book online — betal ved afhentning.",
    url: "https://lejhojtaler.dk/havefest",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      slug="havefest"
      headline={"Lyd til havefest"}
      headlinePrice={"fra 495 kr."}
      intro={"Musik i haven uden at genere naboerne. Vi hjælper med at vælge det rigtige anlæg til afstanden, antal gæster og om der overhovedet er strøm."}
      primaryProductId="pakke_udendors"
      primaryName={"Udendørspakke"}
      primaryPrice={795}
      primaryWhy={"Der er sjældent en stikkontakt i haven. Soundboks 4 kører på batteri, det ekstra batteri holder festen kørende efter midnat, og lyskæden giver lys når solen er gået ned."}
      gridItems={[{"id": "pakke_udendors", "tag": "Anbefalet"}, {"id": "pakke_fest_lille"}, {"id": "thumpgo"}, {"id": "lyskaeder"}, {"id": "lyskaeder_farvet"}]}
      tips={[{"title": "To højtalere slår én stor", "text": "Udendørs er der ingen vægge til at kaste lyden tilbage. To højtalere fordelt i haven giver jævn lyd ved lavere lydstyrke — og dermed færre klager."}, {"title": "Vend lyden væk fra naboen", "text": "Peg højtalerne ind mod jeres eget hus i stedet for ud mod skel. Det giver samme oplevelse for gæsterne og markant mindre støj hos naboen."}, {"title": "Ingen strøm i haven?", "text": "Mackie Thump GO til 345 kr kører på batteri i op til 12 timer. Ingen forlængerledning gennem køkkenvinduet."}, {"title": "Lyskæder gør aftenen", "text": "10 meter lyskæde til 195 kr — varm hvid eller farvet. Det er den billigste måde at gøre en have til et festlokale, når det bliver mørkt."}]}
      faq={[{"q": "Hvor sent må jeg spille musik i haven?", "a": "Der er ingen fast lovgivning, men i København gælder almindelige nabohensyn — skru ned ved 22-23-tiden på hverdage. Sig det til naboerne i forvejen, så er de langt mere tolerante."}, {"q": "Kan højtalerne tåle udendørs brug?", "a": "Ja, i tørvejr. De må ikke stå i regn eller direkte på våd græsplæne. Stil dem på et bord eller et stativ, og tag dem ind hvis vejret vender."}, {"q": "Hvad hvis der ikke er strøm i haven?", "a": "Så vælg en batteridreven højtaler. Mackie Thump GO spiller op til 12 timer og Soundboks 4 op til 40 timer på én opladning."}, {"q": "Hvor mange gæster rækker den lille festpakke til?", "a": "Op til cirka 40 personer. Er I flere, eller er haven stor, så tag den store festpakke med 12\" højtalere og fuld lys-pakke til 895 kr."}]}
      related={[{"href": "/udendorspakke", "label": "Udendørspakken – 795 kr"}, {"href": "/foedselsdag", "label": "Lyd til fødselsdag"}, {"href": "/blog/lyd-til-havefest", "label": "Guide: lyd til havefest"}, {"href": "/lyskaeder", "label": "Lyskæder"}]}
    />
  );
}
