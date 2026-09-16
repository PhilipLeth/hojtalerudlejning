import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Small concerts, AV rental Copenhagen", "description": "An intimate live set with sound taken care of. For acoustic performances, duos and small live sets. Packages are starting points; we review the input list and monitor requirements before confirming the job.", alternates: { canonical: "https://lejhojtaler.dk/en/events/koncert", languages: localeAlternates("/events/koncert") }};
export default function Page(){return <SituationPage slug="koncert" locale="en"/>;}
