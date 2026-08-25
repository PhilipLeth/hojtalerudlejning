import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";

export const metadata: Metadata = {
  title: "Lyd til konfirmation København | Fra 495 kr | Lejhøjtaler.dk",
  description: "Lej lyd til konfirmationen i København fra 495 kr. Højtalere til tale, musik og fest — nemt at betjene, alle kabler med. Book online på 2 minutter.",
  keywords: ["lyd til konfirmation", "højtaler konfirmation", "musikanlæg konfirmation", "lej lyd konfirmation københavn", "mikrofon til konfirmation"],
  alternates: { canonical: "https://lejhojtaler.dk/konfirmation" },
  openGraph: {
    title: "Lyd til konfirmation København | Fra 495 kr | Lejhøjtaler.dk",
    description: "Lej lyd til konfirmationen i København fra 495 kr. Højtalere til tale, musik og fest — nemt at betjene, alle kabler med. Book online på 2 minutter.",
    url: "https://lejhojtaler.dk/konfirmation",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      slug="konfirmation"
      headline={"Lyd til konfirmation"}
      headlinePrice={"fra 495 kr."}
      intro={"Taler der kan høres, og musik der holder festen kørende bagefter. Vi udlejer det hele samlet, så I bare skal tilslutte telefonen."}
      primaryProductId="pakke_fest_stor"
      primaryName={"Stor festpakke"}
      primaryPrice={895}
      primaryWhy={"En konfirmation har både taler og fest. De store højtalere klarer begge dele til op til 100 gæster, og lys-pakken laver lokalet om når bordene er ryddet til side."}
      gridItems={[{"id": "pakke_fest_stor", "tag": "Anbefalet"}, {"id": "pakke_fest_lille"}, {"id": "traadloes_mikrofon"}, {"id": "party"}, {"id": "lyskaeder"}]}
      tips={[{"title": "Husk mikrofon til talerne", "text": "Konfirmationer er talefester. En trådløs mikrofon til 295 kr er den billigste måde at sikre, at bedstemors tale også når det bagerste bord."}, {"title": "Book i god tid", "text": "April og maj er vores travleste måneder. Konfirmationsweekenderne bliver typisk booket 2-3 måneder i forvejen — især lørdagene."}, {"title": "Musik til både unge og voksne", "text": "Højtalerne kobles til telefonen via Bluetooth, så I kan skifte mellem playlister hen over dagen uden at rode med kabler."}, {"title": "Levering hvis I har travlt", "text": "Vi kan levere og sætte op i København for 495 kr, så I kan koncentrere jer om borddækning i stedet for teknik."}]}
      faq={[{"q": "Hvor mange gæster kan den lille festpakke klare?", "a": "Op til cirka 40 personer i et almindeligt festlokale eller en have. Er I flere end 50, anbefaler vi den store festpakke med 12\" højtalere."}, {"q": "Kan jeg få en mikrofon til talerne?", "a": "Ja. Trådløs mikrofon koster 295 kr og kan tilvælges direkte i bookingen. Den tilsluttes højtalerne på under et minut."}, {"q": "Hvornår skal jeg hente og aflevere?", "a": "Standard er afhentning fredag og aflevering mandag — samme pris uanset om du bruger det én eller fem dage. Du vælger selv datoerne i bookingen, og om du henter først eller sidst på dagen."}, {"q": "Hvad hvis konfirmationen er udenfor?", "a": "Højtalerne kan sagtens stå udendørs i tørvejr. Har I ikke strøm i haven, kan vi anbefale en batteridreven Soundboks i stedet."}]}
      related={[{"href": "/festpakke-stor", "label": "Stor festpakke – 895 kr"}, {"href": "/foedselsdag", "label": "Lyd til fødselsdag"}, {"href": "/havefest", "label": "Lyd til havefest"}, {"href": "/traadloes-mikrofon", "label": "Trådløs mikrofon"}]}
    />
  );
}
