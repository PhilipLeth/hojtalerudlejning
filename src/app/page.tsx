import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Lyd, lys og AV til events i København | Lejhøjtaler.dk",
 description: "Lyd, skærme, projektorer, mikrofoner og lys til møder, messer, receptioner og mindre koncerter. Levering, opsætning og tekniker efter aftale.",
 alternates: { canonical: "https://lejhojtaler.dk", languages: localeAlternates("/") },
 openGraph: { title: "Lyd, lys og AV til events i København", description: "Lyd, skærme, projektorer, mikrofoner og lys til møder, messer, receptioner og mindre koncerter. Levering, opsætning og tekniker efter aftale.", url: "https://lejhojtaler.dk", images: ["/images/events/reception-detail.webp"], locale: "da_DK" },
};
export default function Page() { return <EventHome locale="da"/>; }
