import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Complete AV solutions for meetings and events | Lejhøjtaler.dk",
 description: "Sound, displays, projectors, microphones and lighting for meetings, exhibitions, receptions and intimate concerts. Delivery, setup and technicians by agreement.",
 alternates: { canonical: "https://lejhojtaler.dk/en/eventloesninger", languages: localeAlternates("/eventloesninger") },
 openGraph: { title: "Complete AV solutions for meetings and events", description: "Sound, displays, projectors, microphones and lighting for meetings, exhibitions, receptions and intimate concerts. Delivery, setup and technicians by agreement.", url: "https://lejhojtaler.dk/en/eventloesninger", images: ["/images/events/reception-detail.webp"], locale: "en_GB" },
};
export default function Page() { return <EventHome locale="en" detail/>; }
