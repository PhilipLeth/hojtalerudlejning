import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Fredagsbarer, lyd, lys og AV i København", "description": "Fra arbejdsdag til en god aften sammen. Start med musik, mens kollegerne ankommer, og skru op, når baren bliver til dansegulv. Tilvælg DJ/musikafvikler fra tre timer, og vælg DJ-pult og lydpakke separat.", alternates: { canonical: "https://lejhojtaler.dk/events/fredagsbar", languages: localeAlternates("/events/fredagsbar") }};
export default function Page(){return <SituationPage slug="fredagsbar" locale="da"/>;}
