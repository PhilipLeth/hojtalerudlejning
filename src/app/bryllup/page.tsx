import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";

export const metadata: Metadata = {
  title: "Lyd til bryllup København | Fra 895 kr | Lejhøjtaler.dk",
  description: "Lej lyd og lys til bryllup i København fra 895 kr. Højtalere til taler og fest, trådløs mikrofon og stemningslys. Levering og opsætning kan tilvælges.",
  keywords: ["lyd til bryllup", "højtaler til bryllup leje", "musikanlæg bryllup", "mikrofon til bryllup", "lys til bryllup leje"],
  alternates: { canonical: "https://lejhojtaler.dk/bryllup" },
  openGraph: {
    title: "Lyd til bryllup København | Fra 895 kr | Lejhøjtaler.dk",
    description: "Lej lyd og lys til bryllup i København fra 895 kr. Højtalere til taler og fest, trådløs mikrofon og stemningslys. Levering og opsætning kan tilvælges.",
    url: "https://lejhojtaler.dk/bryllup",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      slug="bryllup"
      headline={"Lyd til bryllup"}
      headlinePrice={"fra 895 kr."}
      intro={"Taler alle kan høre, og et dansegulv der holder til langt over midnat. Vi leverer og sætter op, så I kan koncentrere jer om dagen."}
      primaryProductId="pakke_bryllup"
      primaryName={"Bryllupspakke"}
      primaryPrice={1695}
      primaryWhy={"Dagen har to dele, og pakken dækker begge: trådløs mikrofon så talerne kan høres helt bagest under middagen, og lys, lyskæde og low fog når bordene er ryddet. To 12\" EV-højtalere på stativer klarer op til 100 gæster."}
      gridItems={[{"id": "pakke_bryllup", "tag": "Anbefalet"}, {"id": "pakke_fest_stor"}, {"id": "traadloes_mikrofon_pro"}, {"id": "lyskaeder"}, {"id": "low_fog"}]}
      tips={[{"title": "To mikrofoner er tryghed", "text": "Til taler under middagen er én mikrofon nok, men en ekstra betyder, at næste taler kan gøre klar, mens den forrige stadig taler — og I har en reserve, hvis batteriet dør."}, {"title": "Placer højtalerne før gæsterne kommer", "text": "Stativerne skal stå til siden for bordopstillingen, ikke bag talerstolen. Det undgår hyletoner i mikrofonen."}, {"title": "Lad os sætte op", "text": "Levering og opsætning koster 495 kr, og 795 kr hvis vi også skal hente igen bagefter. På en bryllupsdag er begge veje de bedst brugte penge — vi kommer om formiddagen og henter efter festen."}, {"title": "Low fog til første dans", "text": "Røggulvet med is giver 'dansen på skyer'-effekten til jeres første dans. Den koster 295 kr og er den detalje, gæsterne husker."}]}
      faq={[{"q": "Kan I levere og sætte op på selve dagen?", "a": "Ja. Levering og opsætning i København koster 495 kr. Vi aftaler et tidsrum om formiddagen og henter udstyret igen efter festen."}, {"q": "Hvor mange gæster kan anlægget klare?", "a": "Den store festpakke dækker 40-100 gæster. Er I under 40, rækker den lille festpakke til 495 kr fint."}, {"q": "Kan vi tilslutte en DJ eller et band?", "a": "Ja. Højtalerne har almindelige XLR- og jack-indgange, så en DJ kan koble sig direkte på. Sig til ved booking, så sender vi de rigtige kabler med."}, {"q": "Hvad med musik til vielsen udenfor?", "a": "Til en udendørs vielse uden strøm anbefaler vi en batteridreven Soundboks 4 — den kan stå diskret og spiller hele ceremonien."}]}
      related={[{"href": "/bryllupspakke", "label": "Bryllupspakken – 1.695 kr"}, {"href": "/festpakke-stor", "label": "Stor festpakke"}, {"href": "/traadloes-mikrofon-pro", "label": "Trådløs mikrofon PRO"}, {"href": "/roeg", "label": "Low fog til første dans"}]}
    />
  );
}
