import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Bryllupper, lyd, lys og AV i København", "description": "Fra den første tale til den sidste dans. Planlæg lyd til middag og fest, og overvej en separat batteriløsning til vielsen. Musikafvikling, mikrofoner og skift mellem rum aftales efter dagens program.", alternates: { canonical: "https://lejhojtaler.dk/events/bryllup", languages: localeAlternates("/events/bryllup") }};
export default function Page(){return <SituationPage slug="bryllup" locale="da"/>;}
