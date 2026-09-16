import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Mindre koncerter — lyd, lys og AV i København", "description": "Et nærværende livesæt med styr på lyden. Til akustiske indslag, duoer og mindre livesæt. Pakkerne er udgangspunkter; vi gennemgår musikerens inputliste og behov for monitorer, før opgaven bekræftes.", alternates: { canonical: "https://lejhojtaler.dk/events/koncert", languages: localeAlternates("/events/koncert") }};
export default function Page(){return <SituationPage slug="koncert" locale="da"/>;}
