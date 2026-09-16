import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Friday bars — AV rental Copenhagen", "description": "From the working day to a good evening together. Start with music as colleagues arrive, then build the energy as the bar turns into a dance floor. Add a DJ/music host with a DJ booth for at least three hours.", alternates: { canonical: "https://lejhojtaler.dk/en/events/fredagsbar", languages: localeAlternates("/events/fredagsbar") }};
export default function Page(){return <SituationPage slug="fredagsbar" locale="en"/>;}
