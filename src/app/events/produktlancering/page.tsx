import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Produktlanceringer, lyd, lys og AV i København", "description": "Fra afsløring til præsentation. Saml billede, værtens mikrofon og lys omkring produktet. Vi planlægger rækkefølgen af video, tale og musik, så overgangen bliver rolig.", alternates: { canonical: "https://lejhojtaler.dk/events/produktlancering", languages: localeAlternates("/events/produktlancering") }};
export default function Page(){return <SituationPage slug="produktlancering" locale="da"/>;}
