import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Conferences — AV rental Copenhagen", "description": "Keep the programme moving, from the first presentation to the final question. Presentations, panels and audience questions. Plan microphones, speaker handovers and slides that can be read from the back.", alternates: { canonical: "https://lejhojtaler.dk/en/events/konference", languages: localeAlternates("/events/konference") }};
export default function Page(){return <SituationPage slug="konference" locale="en"/>;}
