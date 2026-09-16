import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Konferencer, lyd, lys og AV i København", "description": "Når programmet skal holde fra første oplæg til sidste spørgsmål. Oplæg, panel og spørgsmål fra salen. Vi planlægger mikrofoner, skift mellem talere og et billede, der kan læses fra bagerste række.", alternates: { canonical: "https://lejhojtaler.dk/events/konference", languages: localeAlternates("/events/konference") }};
export default function Page(){return <SituationPage slug="konference" locale="da"/>;}
