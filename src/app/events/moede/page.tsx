import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Møder, lyd, lys og AV i København", "description": "Et møde, hvor alle kan høre og følge med. Til personalemøder og workshops i lokaler uden fast AV. Start med billedet, og tilføj mikrofon og lyd, når afstanden eller gruppen kræver det.", alternates: { canonical: "https://lejhojtaler.dk/events/moede", languages: localeAlternates("/events/moede") }};
export default function Page(){return <SituationPage slug="moede" locale="da"/>;}
