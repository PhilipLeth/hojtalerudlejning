import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Receptioner — lyd, lys og AV i København", "description": "Musik og taler med plads til samtalen. Et diskret anlæg til velkomst, baggrundsmusik og taler. Placeringen følger rummets indretning, og niveauet justeres til gæsternes samtaler.", alternates: { canonical: "https://lejhojtaler.dk/events/reception", languages: localeAlternates("/events/reception") }};
export default function Page(){return <SituationPage slug="reception" locale="da"/>;}
