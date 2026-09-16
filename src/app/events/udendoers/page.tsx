import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Havefester & udendørs events — lyd, lys og AV i København", "description": "Musik og tale under åben himmel. Til have, gårdmiljø og mindre udendørs samlinger. Vælg batterilyd, når strømmen er langt væk. Udstyret kræver tør, overdækket placering og en plan for vejret.", alternates: { canonical: "https://lejhojtaler.dk/events/udendoers", languages: localeAlternates("/events/udendoers") }};
export default function Page(){return <SituationPage slug="udendoers" locale="da"/>;}
