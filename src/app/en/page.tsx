import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Speaker, sound and light rental in Copenhagen | Lejhøjtaler.dk",
 description: "Book speakers, microphones and lighting online in Copenhagen. Choose a package and add it to the basket. Delivery and setup as add-ons.",
 alternates: { canonical: "https://lejhojtaler.dk/en", languages: localeAlternates("/") },
 openGraph: { title: "Speaker, sound and light rental in Copenhagen", description: "Book sound, mics and lighting online. Choose a package and add it to the basket.", url: "https://lejhojtaler.dk/en", images: ["/images/events/reception-detail.webp"], locale: "en_GB" },
};
export default function Page() { return <EventHome locale="en"/>; }
