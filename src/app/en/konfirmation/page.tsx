import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisDkk } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: `Confirmation Party Sound Rental Copenhagen | From ${prisDkk("pakke_fest_lille")} | Lejhøjtaler.dk`,
  description: `Rent speakers and lighting for a confirmation party in Copenhagen from ${prisDkk("pakke_fest_lille")}. Speeches that carry and music that keeps the party going. All cables included.`,
  keywords: [
    "party speaker rental copenhagen",
    "sound system rental for family party",
    "pa system hire copenhagen",
    "microphone rental for speeches copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/konfirmation",
    languages: localeAlternates("/konfirmation"),
  },
  openGraph: {
    title: `Confirmation Party Sound Rental Copenhagen | From ${prisDkk("pakke_fest_lille")} | Lejhøjtaler.dk`,
    description: `Speeches that carry and music that keeps the party going. Book online.`,
    url: "https://lejhojtaler.dk/en/konfirmation",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      locale="en"
      slug="konfirmation"
      popularFor="confirmation parties"
      headline={"Sound for a confirmation party"}
      headlinePriceId="pakke_fest_lille"
      intro={"Speeches that can be heard, and music that keeps the party going afterwards. We rent it out as one set, so all you have to do is connect your phone."}
      primaryProductId="pakke_fest_stor"
      primaryName={"large party package"}
      primaryWhy={"A confirmation is both a speech occasion and a party. The large speakers handle both for up to 100 guests, and the light package changes the room once the tables are pushed aside."}
      gridItems={[{ id: "pakke_fest_stor", tag: "Recommended" }, { id: "pakke_fest_lille" }, { id: "traadloes_mikrofon" }, { id: "party" }, { id: "lyskaeder" }]}
      tips={[
        { title: "Remember a microphone for the speeches", text: "Confirmations are speech parties. A wireless microphone at " + prisDkk("traadloes_mikrofon") + " is the cheapest way to make sure grandmother's speech reaches the back table too." },
        { title: "Book well ahead", text: "April and May are our busiest months. Confirmation weekends are typically booked 2-3 months in advance — Saturdays especially." },
        { title: "Music for both the young and the grown-ups", text: "The speakers connect to a phone over Bluetooth, so you can switch between playlists through the day without touching a cable." },
        { title: "Delivery if you are busy", text: "We can deliver and set up in Copenhagen for " + prisDkk("levering_ud") + ", so you can concentrate on laying the table instead of the technology." },
      ]}
      faq={[
        { q: "How many guests can the small party package handle?", a: "Up to about 40 people in an ordinary venue or a garden. If you are more than 50, we recommend the large party package with 12\" speakers." },
        { q: "Can I get a microphone for the speeches?", a: "Yes. A wireless microphone is " + prisDkk("traadloes_mikrofon") + " and can be added directly in the booking. It connects to the speakers in under a minute." },
        { q: "When do I collect and return?", a: "The standard is collection on Friday and return on Monday — the same price whether you use it for one day or five. You choose the dates in the booking, and whether you collect early or late in the day." },
        { q: "What if the party is outdoors?", a: "The speakers are fine outdoors in dry weather. If there is no power in the garden, we can recommend a battery-powered Soundboks instead." },
      ]}
      related={[
        { href: "/festpakke-stor", label: "Large party package", priceId: "pakke_fest_stor" },
        { href: "/foedselsdag", label: "Sound for a birthday" },
        { href: "/havefest", label: "Sound for a garden party" },
        { href: "/traadloes-mikrofon", label: "Wireless microphone" },
      ]}
    />
  );
}
