import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Garden parties & outdoor events, AV rental Copenhagen", "description": "Music and speech in the open air. For gardens, courtyards and small outdoor gatherings. Choose battery sound away from mains power. Equipment needs a dry, sheltered position and a weather plan.", alternates: { canonical: "https://lejhojtaler.dk/en/events/udendoers", languages: localeAlternates("/events/udendoers") }};
export default function Page(){return <SituationPage slug="udendoers" locale="en"/>;}
