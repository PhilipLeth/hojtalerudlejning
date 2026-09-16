import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Complete AV solutions for meetings and events | Lejhøjtaler.dk",
 description: "Sixteen occasions with ready-made AV packages. Compare what is included and book online. A quote only if the room is unusual.",
 alternates: { canonical: "https://lejhojtaler.dk/en/eventloesninger", languages: localeAlternates("/eventloesninger") },
 openGraph: { title: "Complete AV solutions for meetings and events", description: "Ready-made AV packages by occasion. Compare and book online.", url: "https://lejhojtaler.dk/en/eventloesninger", images: ["/images/events/expo.webp"], locale: "en_GB" },
};
export default function Page() { return <EventHome locale="en" detail/>; }
