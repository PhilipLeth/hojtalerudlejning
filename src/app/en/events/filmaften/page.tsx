import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Film nights & screenings — AV rental Copenhagen", "description": "A big picture with sound to match. For film clubs, shared screenings and sport on screen. Displays work in bright rooms; projection needs controlled light. You arrange the content and screening rights.", alternates: { canonical: "https://lejhojtaler.dk/en/events/filmaften", languages: localeAlternates("/events/filmaften") }};
export default function Page(){return <SituationPage slug="filmaften" locale="en"/>;}
