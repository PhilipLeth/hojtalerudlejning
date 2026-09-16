import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Præsentationer — lyd, lys og AV i København", "description": "Gør plads til budskabet på skærmen. Til pitch, undervisning og gennemgang af resultater. Vi vælger billedstørrelse efter tekst, synsafstand og lys og tester tilslutningen før start.", alternates: { canonical: "https://lejhojtaler.dk/events/praesentation", languages: localeAlternates("/events/praesentation") }};
export default function Page(){return <SituationPage slug="praesentation" locale="da"/>;}
