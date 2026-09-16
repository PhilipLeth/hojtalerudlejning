import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Presentations — AV rental Copenhagen", "description": "Give your message the screen it needs. For pitches, training and results presentations. Choose the image size for your content, viewing distance and light, and test the connection before you begin.", alternates: { canonical: "https://lejhojtaler.dk/en/events/praesentation", languages: localeAlternates("/events/praesentation") }};
export default function Page(){return <SituationPage slug="praesentation" locale="en"/>;}
