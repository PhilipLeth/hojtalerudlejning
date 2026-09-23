import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "AV og eventteknik til erhverv i København | Lejhøjtaler.dk",
 description: "Lyd, skærme, projektorer, mikrofoner og lys til møder, messer, receptioner og mindre koncerter. Levering, opsætning og tekniker efter aftale.",
 alternates: { canonical: "https://lejhojtaler.dk/erhverv", languages: localeAlternates("/erhverv") },
 openGraph: { title: "AV og eventteknik til erhverv i København", description: "Lyd, skærme, projektorer, mikrofoner og lys til møder, messer, receptioner og mindre koncerter. Levering, opsætning og tekniker efter aftale.", url: "https://lejhojtaler.dk/erhverv", images: ["/images/events/reception-detail-v2.webp"], locale: "da_DK" },
};
export default function Page() { return <EventHome locale="da" detail/>; }
