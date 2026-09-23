import type { Metadata } from "next";
import EventHome from "@/components/EventHome";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {
 title: "Lej festudstyr i København | Lyd og lys udlejning | Lejhøjtaler.dk",
 description: "Udlejning af festudstyr i København: højtalere, festlys, røgmaskine, mikrofon og projektor. Se prisen med det samme og book online. Hent i København S, eller tilvælg levering og opsætning.",
 alternates: { canonical: "https://lejhojtaler.dk", languages: localeAlternates("/") },
 openGraph: { title: "Lej festudstyr i København | Lyd og lys udlejning", description: "Udlejning af festudstyr: lyd, lys, røg, mikrofon og skærm. Se prisen med det samme og book online.", url: "https://lejhojtaler.dk", images: ["/images/events/reception-detail-v2.webp"], locale: "da_DK" },
};
export default function Page() { return <EventHome locale="da"/>; }
