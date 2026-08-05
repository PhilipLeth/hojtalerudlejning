import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";

export const metadata: Metadata = {
  title: "Lyd til fødselsdag København | Fra 500 kr | Lejhøjtaler.dk",
  description: "Lej lyd til fødselsdagen i København fra 500 kr. Højtalere til tale og fest, lys og karaoke — til både børnefødselsdag og de runde dage. Book online.",
  keywords: ["lyd til fødselsdag", "højtaler til fødselsdag", "musikanlæg fødselsdag leje", "lyd til rund fødselsdag", "børnefødselsdag musik"],
  alternates: { canonical: "https://lejhojtaler.dk/foedselsdag" },
  openGraph: {
    title: "Lyd til fødselsdag København | Fra 500 kr | Lejhøjtaler.dk",
    description: "Lej lyd til fødselsdagen i København fra 500 kr. Højtalere til tale og fest, lys og karaoke — til både børnefødselsdag og de runde dage. Book online.",
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
      headlinePrice={"fra 500 kr."}
      intro={"Fra børnefødselsdag med discolys til den runde dag med taler. Vi har pakkerne, og alle kabler følger med — I skal bare tilslutte telefonen."}
      primaryProductId="pakke_fest_lille"
      primaryName={"Lille festpakke"}
      primaryPrice={500}
      primaryWhy={"To Alto-højtalere og en lyseffekt dækker den typiske fødselsdag hjemme eller i et festlokale med op til 40 gæster. Skal der holdes taler, tilkøber I en trådløs mikrofon for 295 kr."}
      gridItems={[{"id": "pakke_fest_lille", "tag": "Anbefalet"}, {"id": "traadloes_mikrofon"}, {"id": "discokugle"}, {"id": "pakke_karaoke"}]}
      tips={[{"title": "Til de runde: husk mikrofon", "text": "50- og 60-års fødselsdage er talefester. En trådløs mikrofon sikrer, at alle taler kan høres — også når stemmen bliver tynd af rørelse."}, {"title": "Til børnefødselsdag: discolys", "text": "En discokugle til 245 kr eller en enkelt lyseffekt til 195 kr forvandler stuen til et diskotek. Børn er lette at underholde med lys og musik."}, {"title": "Karaoke er en sikker vinder", "text": "Karaokepakken med to mikrofoner og skærm til 1.100 kr fungerer for både børn og voksne — og fylder en hel eftermiddag."}, {"title": "Book weekenden, ikke dagen", "text": "Prisen er den samme for 1 til 5 dages leje, så hent fredag og aflever mandag, selvom festen kun er lørdag. Så har I tid til at sætte op i ro."}]}
      faq={[{"q": "Hvad koster lyd til en fødselsdag?", "a": "Den lille festpakke med to højtalere og lys koster 500 kr for op til 5 dages leje. Vil I kun have højtalere, koster den lille højtalerpakke 395 kr."}, {"q": "Kan I levere til adressen?", "a": "Ja. Levering og opsætning i København koster 495 kr — vi kommer ud, sætter op klar til brug og henter igen efter festen."}, {"q": "Er det svært at sætte op?", "a": "Nej. Højtalerne tilsluttes strøm, og telefonen forbindes via Bluetooth. Det tager under fem minutter, og alle kabler følger med."}, {"q": "Har I noget til børnefødselsdag?", "a": "Discokugle til 245 kr, en enkelt lyseffekt til 195 kr og karaokepakken er de mest populære til børn. Alt kan tilvælges direkte i bookingen."}]}
      related={[{"href": "/havefest", "label": "Lyd til havefest"}, {"href": "/konfirmation", "label": "Lyd til konfirmation"}, {"href": "/blog/foedselsdagsfest-lyd", "label": "Guide: lyd til fødselsdag"}]}
    />
  );
}
