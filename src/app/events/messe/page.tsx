import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Messer & stande, lyd, lys og AV i København", "description": "Et tydeligt budskab på få kvadratmeter. Til produktvideoer, demoer og korte oplæg på standen. Vi afklarer placering, strøm og adgang med jer, også ved arrangementer i Bella Center.", alternates: { canonical: "https://lejhojtaler.dk/events/messe", languages: localeAlternates("/events/messe") }};
export default function Page(){return <SituationPage slug="messe" locale="da"/>;}
