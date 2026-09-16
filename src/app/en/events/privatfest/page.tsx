import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Birthdays & private parties, AV rental Copenhagen", "description": "The right sound for your room and guests. For birthdays, anniversaries and parties in hired venues. Choose simple music playback or add lighting when dancing is on the programme.", alternates: { canonical: "https://lejhojtaler.dk/en/events/privatfest", languages: localeAlternates("/events/privatfest") }};
export default function Page(){return <SituationPage slug="privatfest" locale="en"/>;}
