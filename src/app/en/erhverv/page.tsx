import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Business event AV in Copenhagen | Lejhøjtaler.dk",
 description: "Sound, displays, projectors, microphones and lighting for meetings, exhibitions, receptions and intimate concerts. Delivery, setup and technicians by agreement.",
 alternates: { canonical: "https://lejhojtaler.dk/en/erhverv", languages: localeAlternates("/erhverv") },
 openGraph: { title: "Business event AV in Copenhagen", description: "Sound, displays, projectors, microphones and lighting for meetings, exhibitions, receptions and intimate concerts. Delivery, setup and technicians by agreement.", url: "https://lejhojtaler.dk/en/erhverv", images: ["/images/events/reception-detail-v2.webp"], locale: "en_GB" },
};
export default function Page() { return <EventHome locale="en" detail/>; }
