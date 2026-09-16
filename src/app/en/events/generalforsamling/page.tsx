import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "General assemblies, AV rental Copenhagen", "description": "Clear speech with room for questions. The chair needs to be heard and members need to ask questions. Choose a speech setup or two microphones with a display for the agenda and accounts.", alternates: { canonical: "https://lejhojtaler.dk/en/events/generalforsamling", languages: localeAlternates("/events/generalforsamling") }};
export default function Page(){return <SituationPage slug="generalforsamling" locale="en"/>;}
