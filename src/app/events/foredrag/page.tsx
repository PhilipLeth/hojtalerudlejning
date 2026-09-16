import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Foredrag & undervisning, lyd, lys og AV i København", "description": "Lad publikum koncentrere sig om indholdet. Til foredrag, kurser og oplæg. En håndholdt mikrofon giver fleksibilitet; et headset frigør hænderne, når oplægsholderen bevæger sig eller demonstrerer noget.", alternates: { canonical: "https://lejhojtaler.dk/events/foredrag", languages: localeAlternates("/events/foredrag") }};
export default function Page(){return <SituationPage slug="foredrag" locale="da"/>;}
