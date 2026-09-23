import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Diskret AV-opstilling, se vores eksempel | Lejhøjtaler.dk",
 description: "Fotos af konkrete AV-opstillinger i København. Se grejet i rummet, og book den tilsvarende pakke online.",
 alternates: { canonical: "https://lejhojtaler.dk/cases", languages: localeAlternates("/cases") },
 openGraph: { title: "Diskret AV-opstilling, se vores eksempel", description: "Fotos af konkrete opstillinger. Se grejet, og book pakken online.", url: "https://lejhojtaler.dk/cases", images: ["/images/events/reception-front-v2.webp"], locale: "da_DK" },
};
export default function Page() { return <EventHome locale="da" cases/>; }
