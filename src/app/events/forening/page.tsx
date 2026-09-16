import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Foreningsdage & sportsarrangementer, lyd, lys og AV i København", "description": "Beskeder, præmier og musik til fællesskabet. Til klubhus, præmieoverrækkelse og mindre aktivitetsdage. Vi afklarer, hvor beskederne skal kunne høres, og om én højttalerposition er nok.", alternates: { canonical: "https://lejhojtaler.dk/events/forening", languages: localeAlternates("/events/forening") }};
export default function Page(){return <SituationPage slug="forening" locale="da"/>;}
