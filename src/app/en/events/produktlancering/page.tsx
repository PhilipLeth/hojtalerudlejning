import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Product launches, AV rental Copenhagen", "description": "From the reveal to the presentation. Bring together visuals, the host’s microphone and lighting around the product. Plan the sequence of video, speech and music for smooth handovers.", alternates: { canonical: "https://lejhojtaler.dk/en/events/produktlancering", languages: localeAlternates("/events/produktlancering") }};
export default function Page(){return <SituationPage slug="produktlancering" locale="en"/>;}
