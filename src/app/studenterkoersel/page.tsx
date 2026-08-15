import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";

export const metadata: Metadata = {
  title: "Højtaler til studenterkørsel | Lej Soundboks fra 595 kr | Lejhøjtaler.dk",
  description: "Lej højtaler til studenterkørsel i København fra 595 kr. Batteridreven Soundboks med kraftig bas — holder hele turen uden strøm. Book online på 2 minutter.",
  keywords: ["højtaler til studenterkørsel", "soundboks studenterkørsel", "lej højtaler studentervogn", "musik studenterkørsel", "batteri højtaler student"],
  alternates: { canonical: "https://lejhojtaler.dk/studenterkoersel" },
  openGraph: {
    title: "Højtaler til studenterkørsel | Lej Soundboks fra 595 kr | Lejhøjtaler.dk",
    description: "Lej højtaler til studenterkørsel i København fra 595 kr. Batteridreven Soundboks med kraftig bas — holder hele turen uden strøm. Book online på 2 minutter.",
    url: "https://lejhojtaler.dk/studenterkoersel",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      slug="studenterkoersel"
      headline={"Højtaler til studenterkørsel"}
      headlinePrice={"fra 595 kr."}
      intro={"Musik der kan høres over motoren og 30 syngende studenter. Batteridrevet, så den bare skal spændes fast på vognen."}
      primaryProductId="soundboks"
      primaryName={"Soundboks 4"}
      primaryPrice={595}
      primaryWhy={"Den er bygget til præcis det her: kraftig bas, op til 40 timers batteri og robust nok til at stå på en lastbil. Ingen kabler, ingen generator — bare tænd og kør."}
      gridItems={[{"id": "soundboks", "tag": "Anbefalet"}, {"id": "thumpgo"}, {"id": "batteri"}, {"id": "traadloes_mikrofon"}]}
      tips={[{"title": "Spænd den godt fast", "text": "Soundboksen skal surres til vognen med spændbånd — den vejer 11 kg og må ikke kunne skride under opbremsning. Vi låner gerne bånd med ud."}, {"title": "Book tidligt i juni", "text": "Studenterkørsel er koncentreret på få uger i juni, og vores batterihøjtalere er udlejet først. Book gerne i april."}, {"title": "Ekstra batteri til lange dage", "text": "Kører I fra morgen til aften, kan et ekstra batteri tilkøbes for 145 kr — så er I sikre på musik hele vejen rundt."}, {"title": "Husk regnvejr", "text": "Dansk juni er uforudsigelig. Hav en presenning eller en plastikpose klar, så højtaleren kan dækkes til, hvis det står ned."}]}
      faq={[{"q": "Holder batteriet en hel dags kørsel?", "a": "Ja. Soundboks 4 spiller op til 40 timer ved normal lydstyrke — ved fuld udblæsning nærmere 5-8 timer, hvilket rækker til en typisk rutedag. Ekstra batteri kan tilkøbes."}, {"q": "Kan den tåle at stå på en lastbil?", "a": "Soundboksen er bygget til udendørs brug og tåler vibrationer og støv. Den skal bare spændes forsvarligt fast og holdes fri af direkte regn."}, {"q": "Hvad koster det for en hel uge?", "a": "Vi tager samme pris for 1 til 5 dage. Skal I bruge den længere, så ring på 23 63 23 03, så finder vi en pris."}, {"q": "Hvem hæfter, hvis den bliver ødelagt?", "a": "Lejer hæfter for skader ud over almindeligt slid — se lejevilkårene. Derfor: spænd den fast, og lad den ikke stå uden opsyn."}]}
      related={[{"href": "/soundboks-4", "label": "Soundboks 4"}, {"href": "/polterabend", "label": "Højtaler til polterabend"}, {"href": "/lej-hojtaler", "label": "Alle højtalere"}]}
    />
  );
}
