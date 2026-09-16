import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Exhibitions & stands — AV rental Copenhagen", "description": "A clear message in a compact space. For product videos, demos and short stand presentations. We clarify placement, power and access with you, including events at Bella Center.", alternates: { canonical: "https://lejhojtaler.dk/en/events/messe", languages: localeAlternates("/events/messe") }};
export default function Page(){return <SituationPage slug="messe" locale="en"/>;}
