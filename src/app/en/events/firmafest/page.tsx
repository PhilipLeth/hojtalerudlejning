import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Company parties — AV rental Copenhagen", "description": "Dinner speeches. Music on the dance floor. A company party changes throughout the evening. Plan a setup for the welcome, entertainment and music, with a DJ or your own playback.", alternates: { canonical: "https://lejhojtaler.dk/en/events/firmafest", languages: localeAlternates("/events/firmafest") }};
export default function Page(){return <SituationPage slug="firmafest" locale="en"/>;}
