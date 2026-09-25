import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Party Equipment Rental Copenhagen | Sound, Light & AV | Lejhøjtaler.dk",
 description: "Party equipment rental in Copenhagen: speakers, party lighting, fog machine, microphones and projectors. See the price straight away and book online. Collect in Copenhagen S, or add delivery and setup.",
 alternates: { canonical: "https://lejhojtaler.dk/en", languages: localeAlternates("/") },
 openGraph: { title: "Party Equipment Rental Copenhagen | Sound, Light & AV", description: "Rent speakers, party lighting, fog, microphones and screens in Copenhagen. See the price straight away and book online.", url: "https://lejhojtaler.dk/en", images: ["/images/events/reception-detail-v2.webp"], locale: "en_GB" },
};
export default function Page() { return <EventHome locale="en"/>; }
