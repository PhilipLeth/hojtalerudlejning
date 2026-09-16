import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Talks & training — AV rental Copenhagen", "description": "Let your audience concentrate on the content. For talks, courses and lectures. A handheld microphone is flexible; a headset leaves the presenter’s hands free to move or demonstrate.", alternates: { canonical: "https://lejhojtaler.dk/en/events/foredrag", languages: localeAlternates("/events/foredrag") }};
export default function Page(){return <SituationPage slug="foredrag" locale="en"/>;}
