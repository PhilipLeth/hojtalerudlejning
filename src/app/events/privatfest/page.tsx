import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Fødselsdage & privatfester, lyd, lys og AV i København", "description": "Den rigtige lyd til jeres lokale og gæster. Til fødselsdag, jubilæum og fest i et lejet lokale. Vælg enkel musikafspilning eller en pakke med lys, når der skal danses.", alternates: { canonical: "https://lejhojtaler.dk/events/privatfest", languages: localeAlternates("/events/privatfest") }};
export default function Page(){return <SituationPage slug="privatfest" locale="da"/>;}
