import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Diskret AV-opstilling, se vores eksempel | Lejhøjtaler.dk",
 description: "Lyd, skærme, projektorer, mikrofoner og lys til møder, messer, receptioner og mindre koncerter. Levering, opsætning og tekniker efter aftale.",
 alternates: { canonical: "https://lejhojtaler.dk/cases", languages: localeAlternates("/cases") },
 openGraph: { title: "Diskret AV-opstilling, se vores eksempel", description: "Lyd, skærme, projektorer, mikrofoner og lys til møder, messer, receptioner og mindre koncerter. Levering, opsætning og tekniker efter aftale.", url: "https://lejhojtaler.dk/cases", images: ["/images/events/reception-detail.webp"], locale: "da_DK" },
};
export default function Page() { return <EventHome locale="da" cases/>; }
