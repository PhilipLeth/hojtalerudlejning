import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisKr } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lyd og lys til ungdomsfest København | Fra ${prisKr("pakke_ungdomsfest")} | Lejhøjtaler.dk`,
  description: `Lej lyd og diskolys til ungdomsfesten i København fra ${prisKr("pakke_ungdomsfest")}. Soundboks, discokugle, lyseffekter og røg i færdige pakker, til 18-årsfødselsdagen, efterfesten og gymnasiefesten. Book online på 2 minutter.`,
  keywords: ["ungdomsfest", "lyd til ungdomsfest", "lys til ungdomsfest", "fest for unge udstyr", "18 års fødselsdag fest", "gymnasiefest lyd og lys", "efterfest lys", "blå mandag fest", "lej diskolys københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/ungdomsfest",
    languages: localeAlternates("/ungdomsfest"),
  },
  openGraph: {
    images: ogImages(),
    title: `Lyd og lys til ungdomsfest København | Fra ${prisKr("pakke_ungdomsfest")} | Lejhøjtaler.dk`,
    description: `Lej lyd og diskolys til ungdomsfesten i København fra ${prisKr("pakke_ungdomsfest")}. Soundboks, discokugle, lyseffekter og røg i færdige pakker. Book online på 2 minutter.`,
    url: "https://lejhojtaler.dk/ungdomsfest",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      slug="ungdomsfest"
      headline={"Lyd og lys til ungdomsfest"}
      headlinePriceId="pakke_ungdomsfest"
      intro={"En ungdomsfest er lyd, der kan mærkes, og lys, der gør kælderen til en klub. Vi udlejer det samlet i to pakker, den lille kører på batteri, den store fylder et forsamlingshus. Forældre booker, de unge godkender."}
      primaryProductId="pakke_fest_stor"
      primaryName={"Festpakke 30-50"}
      primaryWhy={"To 12\" EV-højtalere spiller højt nok til 50 gæster uden at blive skingre, og lysbaren laver dansegulvet: sluk loftslyset, og rummet er et andet. Sat op på ti minutter, uden en tekniker."}
      gridItems={[{ id: "pakke_ungdomsfest", tag: "Anbefalet" }, { id: "pakke_ungdomsfest_stor", tag: "Til 100 gæster" }, { id: "pakke_teenagefest" }, { id: "soundboks" }, { id: "rog" }, { id: "discokugle" }]}
      tips={[
        { title: "Sluk loftslyset, det er hele tricket", text: "Diskolys virker kun i et mørkt rum. Ét LED-par-lys og en discokugle med spot er nok til at forvandle en kælder, hvis loftslyset er slukket. I et oplyst rum ser det samme grej ud af ingenting." },
        { title: "Røg gør lyset synligt", text: "Lysstrålerne og kuglens prikker hænger først i luften, når der er røg. Røgmaskinen til " + prisKr("rog") + " er det tilvalg, der gør størst forskel, men tjek, at lokalet ikke har røgalarm koblet til brandvæsenet." },
        { title: "Batteri eller stikkontakt?", text: "Soundboksen i den lille pakke kører på batteri, men lyset kræver strøm. Er festen i en have eller et telt uden strøm, så planlæg en forlængerledning til lamperne." },
        { title: "Hold styr på lydniveauet", text: "Højtalerne i den store pakke kan spille højere, end naboerne bryder sig om. Aftal et tidspunkt, hvor bassen skrues ned, og hav mikrofonen klar, hvis der skal holdes tale for fødselaren." },
      ]}
      faq={[
        { q: "Hvad koster lyd og lys til en ungdomsfest?", a: "Ungdomsfest-pakken med Soundboks, lyseffekt og discokugle koster " + prisKr("pakke_ungdomsfest") + " for op til 5 dages leje. Den store pakke med to 12\" højtalere, lysbar, discokugle og røg koster " + prisKr("pakke_ungdomsfest_stor") + ". Begge er billigere end delene hver for sig." },
        { q: "Har I UV-lys, strobe eller laser?", a: "Ikke endnu. Vi lejer discokugler, LED-lyseffekter, lysbar på stativ, uplights og røgmaskine ud, det er det, der står i pakkerne, og det er det, vi kan levere. Vil I have UV-lys, strobe eller laser til festen, så skriv til os: får vi nok forespørgsler, køber vi det ind." },
        { q: "Kan en 16- eller 18-årig selv leje?", a: "Lejeren skal være fyldt 18 år og betaler ved bookingen. I praksis booker en forælder, og den unge henter sammen med en voksen. Alt er plug and play, så ingen behøver at kunne noget om teknik." },
        { q: "Hvor mange gæster kan pakkerne klare?", a: "Den lille ungdomsfest-pakke er til op til 50 gæster i en kælder, garage eller stue. Den store med to 12\" højtalere klarer op til 100 i et forsamlingshus eller en hal, tilvælg subwooferen, hvis I er flere eller vil have mere bas." },
        { q: "Hvornår skal jeg hente og aflevere?", a: "Standard er afhentning fredag og aflevering mandag, samme pris uanset om festen er fredag eller lørdag. Du vælger selv datoerne i bookingen, og vi kan levere og sætte op i København for " + prisKr("levering_ud") + "." },
      ]}
      related={[
        { href: "/festpakke-stor", label: "Festpakke 30-50", priceId: "pakke_fest_stor" },
        { href: "/festpakke-100", label: "Festpakke 50-100", priceId: "pakke_fest_100" },
        { href: "/lyspakker", label: "Lyspakker, kun lys", priceId: "pakke_festlys_50" },
        { href: "/foedselsdag", label: "Lyd til fødselsdag" },
        { href: "/studenterkoersel", label: "Lyd til studenterkørsel" },
        { href: "/festlys", label: "Alt om festlys" },
      ]}
    />
  );
}
