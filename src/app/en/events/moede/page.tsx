import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Meetings — AV rental Copenhagen", "description": "A meeting everyone can hear and follow. For team meetings and workshops without installed AV. Start with the display; add sound and a microphone when the room or audience calls for it.", alternates: { canonical: "https://lejhojtaler.dk/en/events/moede", languages: localeAlternates("/events/moede") }};
export default function Page(){return <SituationPage slug="moede" locale="en"/>;}
