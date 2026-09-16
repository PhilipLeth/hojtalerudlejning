import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Lyd, lys og AV til events i København | Lejhøjtaler.dk",
 description: "Book lyd, skærm, mikrofon og lys online i København. Vælg pakke, læg i kurven. Levering og opsætning kan tilvælges.",
 alternates: { canonical: "https://lejhojtaler.dk", languages: localeAlternates("/") },
 openGraph: { title: "Lyd, lys og AV til events i København", description: "Book lyd, skærm, mikrofon og lys online. Vælg pakke og læg i kurven.", url: "https://lejhojtaler.dk", images: ["/images/events/reception-detail.webp"], locale: "da_DK" },
};
export default function Page() { return <EventHome locale="da"/>; }
