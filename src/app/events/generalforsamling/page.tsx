import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Generalforsamlinger, lyd, lys og AV i København", "description": "Tydelig tale og plads til spørgsmål. Dirigenten skal høres, og medlemmerne skal kunne stille spørgsmål. Vælg en enkel talepakke eller to mikrofoner og billede til dagsorden og regnskab.", alternates: { canonical: "https://lejhojtaler.dk/events/generalforsamling", languages: localeAlternates("/events/generalforsamling") }};
export default function Page(){return <SituationPage slug="generalforsamling" locale="da"/>;}
