import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Firmafester & julefrokoster, lyd, lys og AV i København", "description": "Taler ved bordene. Musik på dansegulvet. Firmafesten skifter karakter i løbet af aftenen. Planlæg én løsning, der kan håndtere velkomst, indslag og musik, og vælg DJ eller egen afspilning.", alternates: { canonical: "https://lejhojtaler.dk/events/firmafest", languages: localeAlternates("/events/firmafest") }};
export default function Page(){return <SituationPage slug="firmafest" locale="da"/>;}
