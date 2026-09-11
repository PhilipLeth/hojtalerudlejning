import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisDkk } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: `Youth Party Sound and Lights Rental Copenhagen | From ${prisDkk("pakke_ungdomsfest")} | Lejhøjtaler.dk`,
  description: `Rent sound and disco lights for a youth party in Copenhagen from ${prisDkk("pakke_ungdomsfest")}. Soundboks, mirror ball, light effects and fog in ready-made packages — for 18th birthdays, after-parties and school parties. Book online in 2 minutes.`,
  keywords: [
    "youth party equipment rental copenhagen",
    "18th birthday party sound and lights",
    "disco lights rental copenhagen",
    "party speaker and light hire copenhagen",
    "teen party rental",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/ungdomsfest",
    languages: localeAlternates("/ungdomsfest"),
  },
  openGraph: {
    title: `Youth Party Sound and Lights Rental Copenhagen | From ${prisDkk("pakke_ungdomsfest")} | Lejhøjtaler.dk`,
    description: `Soundboks, mirror ball, light effects and fog in ready-made packages. Book online.`,
    url: "https://lejhojtaler.dk/en/ungdomsfest",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      locale="en"
      slug="ungdomsfest"
      popularFor="youth parties"
      headline={"Sound and lights for a youth party"}
      headlinePriceId="pakke_ungdomsfest"
      intro={"A youth party is sound you can feel and lights that turn the basement into a club. We rent it as two packages — the small one runs on battery, the large one fills a hall. Parents book, the young ones approve."}
      primaryProductId="pakke_ungdomsfest"
      primaryName={"youth party package"}
      primaryWhy={"The Soundboks 4 is loud enough for 50 guests and runs on battery, so it can stand anywhere. The disco light effect and the mirror ball make the dancefloor — kill the ceiling light and it is a different room. Set up in ten minutes, no technician."}
      gridItems={[{ id: "pakke_ungdomsfest", tag: "Recommended" }, { id: "pakke_ungdomsfest_stor", tag: "For 100 guests" }, { id: "pakke_teenagefest" }, { id: "soundboks" }, { id: "rog" }, { id: "discokugle" }]}
      tips={[
        { title: "Turn off the ceiling light — that is the whole trick", text: "Disco lights only work in a dark room. One LED par light and a mirror ball with a spotlight are enough to transform a basement if the ceiling light is off. In a lit room the same gear looks like nothing." },
        { title: "Fog makes the light visible", text: "The beams and the ball's dots only hang in the air when there is fog. The fog machine at " + prisDkk("rog") + " is the add-on that makes the biggest difference — but check that the venue's smoke alarm is not wired to the fire brigade." },
        { title: "Battery or socket?", text: "The Soundboks in the small package runs on battery, but the lights need power. If the party is in a garden or a tent without power, plan an extension lead for the lamps." },
        { title: "Keep an eye on the volume", text: "The speakers in the large package can play louder than the neighbours like. Agree on a time to turn the bass down — and have the microphone ready if someone is giving a speech for the birthday kid." },
      ]}
      faq={[
        { q: "What does sound and lighting for a youth party cost?", a: "The youth party package with Soundboks, light effect and mirror ball is " + prisDkk("pakke_ungdomsfest") + " for up to 5 days of rental. The large package with two 12\" speakers, light package, mirror ball and fog is " + prisDkk("pakke_ungdomsfest_stor") + ". Both are cheaper than the parts separately." },
        { q: "Do you have UV light, strobes or lasers?", a: "Not yet. We rent mirror balls, LED light effects, a light package on a stand, uplights and a fog machine — that is what is in the packages, and that is what we can deliver. If you want UV, strobe or laser for the party, write to us: with enough requests we will buy it in." },
        { q: "Can a 16- or 18-year-old rent it themselves?", a: "The renter must be 18 and pays at booking. In practice a parent books, and the young one collects together with an adult. Everything is plug and play, so nobody needs to know anything about the technology." },
        { q: "How many guests can the packages handle?", a: "The small youth party package is for up to 50 guests in a basement, garage or living room. The large one with two 12\" speakers handles up to 100 in a hall — add the subwoofer if you are more or want more bass." },
        { q: "When do I collect and return?", a: "The standard is collection on Friday and return on Monday — the same price whether the party is Friday or Saturday. You choose the dates in the booking, and we can deliver and set up in Copenhagen for " + prisDkk("levering_ud") + "." },
      ]}
      related={[
        { href: "/ungdomsfest-pakke", label: "Youth party package", priceId: "pakke_ungdomsfest" },
        { href: "/ungdomsfest-pakke-stor", label: "Large youth party package", priceId: "pakke_ungdomsfest_stor" },
        { href: "/teenagefest-lys", label: "Teen party lights — lights only", priceId: "pakke_teenagefest" },
        { href: "/foedselsdag", label: "Sound for a birthday" },
        { href: "/festlys", label: "All about party lights" },
      ]}
    />
  );
}
