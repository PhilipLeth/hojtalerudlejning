import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Komplette AV-løsninger til møder, messer og events | Lejhøjtaler.dk",
 description: "Seksten anledninger med færdige AV-pakker. Sammenlign indhold og book online. Tilbud kun ved særlige rum.",
 alternates: { canonical: "https://lejhojtaler.dk/eventloesninger", languages: localeAlternates("/eventloesninger") },
 openGraph: { title: "Komplette AV-løsninger til møder, messer og events", description: "Færdige AV-pakker efter anledning. Sammenlign og book online.", url: "https://lejhojtaler.dk/eventloesninger", images: ["/images/events/expo.webp"], locale: "da_DK" },
};
export default function Page() { return <EventHome locale="da" detail/>; }
