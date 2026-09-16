import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Weddings, AV rental Copenhagen", "description": "From the first speech to the last dance. Plan sound for dinner and dancing, and consider a separate battery setup for the ceremony. Agree music, microphones and room changes around your day.", alternates: { canonical: "https://lejhojtaler.dk/en/events/bryllup", languages: localeAlternates("/events/bryllup") }};
export default function Page(){return <SituationPage slug="bryllup" locale="en"/>;}
