import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Fredagsbarer — lyd, lys og AV i København", "description": "Fra arbejdsdag til en god aften sammen. Start med musik, mens kollegerne ankommer, og skru op, når baren bliver til dansegulv. Tilvælg DJ/musikafvikler med DJ-pult og mindst tre timers musik.", alternates: { canonical: "https://lejhojtaler.dk/events/fredagsbar", languages: localeAlternates("/events/fredagsbar") }};
export default function Page(){return <SituationPage slug="fredagsbar" locale="da"/>;}
