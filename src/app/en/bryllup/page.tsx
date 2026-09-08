import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisDkk } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: `Wedding Sound & Light Rental Copenhagen | From ${prisDkk("pakke_fest_stor")} | Lejhøjtaler.dk`,
  description: `Rent sound and lighting for a wedding in Copenhagen from ${prisDkk("pakke_fest_stor")}. Speakers for the speeches and the dancefloor, a wireless microphone and ambient light. Delivery and setup available.`,
  keywords: [
    "wedding sound rental copenhagen",
    "wedding pa system hire copenhagen",
    "wedding lighting rental copenhagen",
    "microphone rental for wedding speeches",
    "wedding speaker rental denmark",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/bryllup",
    languages: localeAlternates("/bryllup"),
  },
  openGraph: {
    title: `Wedding Sound & Light Rental Copenhagen | From ${prisDkk("pakke_fest_stor")} | Lejhøjtaler.dk`,
    description: `Speakers for the speeches and the dancefloor, a wireless microphone and ambient light. Delivery and setup available.`,
    url: "https://lejhojtaler.dk/en/bryllup",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      locale="en"
      slug="bryllup"
      popularFor="weddings"
      headline={"Sound for your wedding"}
      headlinePriceId="pakke_fest_stor"
      intro={"Speeches everyone can hear, and a dancefloor that holds up well past midnight. We deliver and set it up, so you can concentrate on the day."}
      primaryProductId="pakke_bryllup"
      primaryName={"wedding package"}
      primaryWhy={"The day has two halves, and the package covers both: a wireless microphone so the speeches reach the back table during dinner, and lighting, fairy lights and low fog once the tables are cleared. Two 12\" EV speakers on stands handle up to 100 guests."}
      gridItems={[{ id: "pakke_bryllup", tag: "Recommended" }, { id: "pakke_fest_stor" }, { id: "traadloes_mikrofon_pro" }, { id: "lyskaeder" }, { id: "low_fog" }]}
      tips={[
        { title: "Two microphones is peace of mind", text: "One microphone is enough for dinner speeches, but a second one means the next speaker can get ready while the previous one is still talking — and you have a spare if a battery dies." },
        { title: "Place the speakers before the guests arrive", text: "The stands belong to the side of the table layout, not behind the lectern. That is what keeps the microphone from feeding back." },
        { title: "Let us set it up", text: "Delivery and setup is " + prisDkk("levering_ud") + ", and " + prisDkk("levering_begge") + " if we collect it again afterwards. On a wedding day, both ways is the best money you will spend — we come in the morning and collect after the party." },
        { title: "Low fog for the first dance", text: "The ice-cooled fog floor gives you the 'dancing on clouds' effect for your first dance. It is " + prisDkk("low_fog") + " and it is the detail the guests remember." },
      ]}
      faq={[
        { q: "Can you deliver and set up on the day itself?", a: "Yes. Delivery and setup in Copenhagen is " + prisDkk("levering_ud") + ". We agree a window in the morning and collect the equipment again after the party." },
        { q: "How many guests can the system handle?", a: "The large party package covers 40-100 guests. If you are under 40, the small party package at " + prisDkk("pakke_fest_lille") + " is plenty." },
        { q: "Can we connect a DJ or a band?", a: "Yes. The speakers have ordinary XLR and jack inputs, so a DJ can plug straight in. Tell us when you book and we will send the right cables with you." },
        { q: "What about music for an outdoor ceremony?", a: "For an outdoor ceremony with no power we recommend a battery-powered Soundboks 4 — it can stand discreetly to the side and plays through the whole ceremony." },
      ]}
      related={[
        { href: "/bryllupspakke", label: "The wedding package", priceId: "pakke_bryllup" },
        { href: "/festpakke-stor", label: "Large party package" },
        { href: "/traadloes-mikrofon-pro", label: "Wireless microphone PRO" },
        { href: "/bryllupslys", label: "Wedding lighting" },
      ]}
    />
  );
}
