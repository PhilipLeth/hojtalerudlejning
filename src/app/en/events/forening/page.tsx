import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Club days & sports events, AV rental Copenhagen", "description": "Announcements, awards and music for your community. For clubhouses, awards and small activity days. We establish where announcements need to be heard and whether one speaker position is enough.", alternates: { canonical: "https://lejhojtaler.dk/en/events/forening", languages: localeAlternates("/events/forening") }};
export default function Page(){return <SituationPage slug="forening" locale="en"/>;}
