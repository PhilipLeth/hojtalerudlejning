import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Receptions, AV rental Copenhagen", "description": "Music and speeches with space for conversation. A discreet setup for welcome music, background sound and speeches. Speaker placement follows the room, with volume suited to conversation.", alternates: { canonical: "https://lejhojtaler.dk/en/events/reception", languages: localeAlternates("/events/reception") }};
export default function Page(){return <SituationPage slug="reception" locale="en"/>;}
