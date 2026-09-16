import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Komplette AV-løsninger til møder, messer og events | Lejhøjtaler.dk",
 description: "Lyd, skærme, projektorer, mikrofoner og lys til møder, messer, receptioner og mindre koncerter. Levering, opsætning og tekniker efter aftale.",
 alternates: { canonical: "https://lejhojtaler.dk/eventloesninger", languages: localeAlternates("/eventloesninger") },
 openGraph: { title: "Komplette AV-løsninger til møder, messer og events", description: "Lyd, skærme, projektorer, mikrofoner og lys til møder, messer, receptioner og mindre koncerter. Levering, opsætning og tekniker efter aftale.", url: "https://lejhojtaler.dk/eventloesninger", images: ["/images/events/reception-detail.webp"], locale: "da_DK" },
};
export default function Page() { return <EventHome locale="da" detail/>; }
