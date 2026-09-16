import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Discreet event AV — a setup example | Lejhøjtaler.dk",
 description: "Sound, displays, projectors, microphones and lighting for meetings, exhibitions, receptions and intimate concerts. Delivery, setup and technicians by agreement.",
 alternates: { canonical: "https://lejhojtaler.dk/en/cases", languages: localeAlternates("/cases") },
 openGraph: { title: "Discreet event AV — a setup example", description: "Sound, displays, projectors, microphones and lighting for meetings, exhibitions, receptions and intimate concerts. Delivery, setup and technicians by agreement.", url: "https://lejhojtaler.dk/en/cases", images: ["/images/events/reception-detail.webp"], locale: "en_GB" },
};
export default function Page() { return <EventHome locale="en" cases/>; }
