import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Discreet event AV, a setup example | Lejhøjtaler.dk",
 description: "Photos of actual AV setups in Copenhagen. See the equipment in the room, then book the matching package online.",
 alternates: { canonical: "https://lejhojtaler.dk/en/cases", languages: localeAlternates("/cases") },
 openGraph: { title: "Discreet event AV, a setup example", description: "Photos of actual setups. See the gear, then book the package online.", url: "https://lejhojtaler.dk/en/cases", images: ["/images/events/reception-front.webp"], locale: "en_GB" },
};
export default function Page() { return <EventHome locale="en" cases/>; }
