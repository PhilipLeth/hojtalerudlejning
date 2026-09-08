import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisDkk } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: `Garden Party Speaker Rental Copenhagen | From ${prisDkk("pakke_fest_lille")} | Lejhøjtaler.dk`,
  description: `Rent speakers and fairy lights for a garden party in Copenhagen from ${prisDkk("pakke_fest_lille")}. Battery-powered options for gardens with no power outlet. Music without upsetting the neighbours.`,
  keywords: [
    "garden party speaker rental copenhagen",
    "outdoor speaker hire copenhagen",
    "battery speaker rental copenhagen",
    "fairy lights rental for garden party",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/havefest",
    languages: localeAlternates("/havefest"),
  },
  openGraph: {
    title: `Garden Party Speaker Rental Copenhagen | From ${prisDkk("pakke_fest_lille")} | Lejhøjtaler.dk`,
    description: `Battery-powered speakers and fairy lights for the garden. Music without upsetting the neighbours.`,
    url: "https://lejhojtaler.dk/en/havefest",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      locale="en"
      slug="havefest"
      popularFor="garden parties"
      headline={"Sound for a garden party"}
      headlinePriceId="pakke_fest_lille"
      intro={"Music in the garden without upsetting the neighbours. We help you pick the right system for the distance, the number of guests, and whether there is any power out there at all."}
      primaryProductId="pakke_udendors"
      primaryName={"outdoor package"}
      primaryWhy={"There is rarely a socket in the garden. The Soundboks 4 runs on battery, the spare battery keeps the party going past midnight, and the fairy lights give you light once the sun is down."}
      gridItems={[{ id: "pakke_udendors", tag: "Recommended" }, { id: "pakke_fest_lille" }, { id: "thumpgo" }, { id: "lyskaeder" }, { id: "lyskaeder_farvet" }]}
      tips={[
        { title: "Two speakers beat one big one", text: "Outdoors there are no walls to bounce the sound back. Two speakers spread across the garden give even sound at a lower volume — and therefore fewer complaints." },
        { title: "Point the sound away from the neighbour", text: "Aim the speakers in towards your own house rather than out towards the fence. Same experience for your guests, markedly less noise next door." },
        { title: "No power in the garden?", text: "The Mackie Thump GO at " + prisDkk("thumpgo") + " runs on battery for up to 12 hours. No extension lead through the kitchen window." },
        { title: "Fairy lights make the evening", text: "10 metres of fairy lights at " + prisDkk("lyskaeder") + " — warm white or coloured. It is the cheapest way to turn a garden into a venue once it gets dark." },
      ]}
      faq={[
        { q: "How late can I play music in the garden?", a: "There is no fixed law, but ordinary consideration for neighbours applies in Copenhagen — turn it down around 10-11 PM on weekdays. Tell the neighbours in advance and they are far more tolerant." },
        { q: "Can the speakers cope with being outdoors?", a: "Yes, in dry weather. They must not stand in rain or directly on wet grass. Put them on a table or a stand, and bring them in if the weather turns." },
        { q: "What if there is no power in the garden?", a: "Then choose a battery-powered speaker. The Mackie Thump GO plays for up to 12 hours and the Soundboks 4 up to 40 hours on one charge." },
        { q: "How many guests does the small party package cover?", a: "Up to about 40 people. If you are more, or the garden is large, take the large party package with 12\" speakers and the full light package at " + prisDkk("pakke_fest_stor") + "." },
      ]}
      related={[
        { href: "/udendorspakke", label: "The outdoor package", priceId: "pakke_udendors" },
        { href: "/foedselsdag", label: "Sound for a birthday" },
        { href: "/soundboks-4", label: "Soundboks 4" },
        { href: "/lyskaeder", label: "Fairy lights" },
      ]}
    />
  );
}
