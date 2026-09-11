import { Metadata } from "next";
import BundleGrid from "@/components/BundleGrid";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";
import { LYDMAND_PAKKER } from "@/lib/products";

export const metadata: Metadata = {
  title: "Sound Engineer Hire Copenhagen | 1,000 DKK/hour | Lejhøjtaler.dk",
  description:
    "Hire a sound engineer for your party or corporate event in Copenhagen — 1,000 DKK per hour incl. VAT. The AV technician sets up, runs the sound check and controls sound and microphones while you enjoy the event.",
  keywords: [
    "sound engineer hire copenhagen",
    "av technician copenhagen",
    "sound technician for party",
    "event sound engineer denmark",
    "hire sound tech copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lydmand",
    languages: localeAlternates("/lydmand"),
  },
  openGraph: {
    title: "Sound Engineer Hire Copenhagen | 1,000 DKK/hour",
    description:
      "AV technician on site: setup, sound check and running the sound during your event. 1,000 DKK per hour. Book online.",
    url: "https://lejhojtaler.dk/en/lydmand",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function SoundEngineerPage() {
  return (
    <ProductLanding
      locale="en"
      slug="en/lydmand"
      name="Sound engineer"
      price={1000}
      priceUnit="/hour"
      headline="Hire a sound engineer for your event"
      sub="An AV technician who sets up, runs the sound check and controls the sound — so you can enjoy the party instead of standing at the mixer."
      image="/images/product-lydmand.webp"
      imageAlt="Sound engineer: mixer, headphones and microphone"
      productId="lydmand"
      bookLabel="Book a sound engineer"
      ctaText="Add the sound engineer to your speaker rental, or pick one of the packages that include him. The price is"
      faqMode="extraOnly"
      bullets={[
        "AV technician on site — sets up and runs the sound check before the guests arrive",
        "Controls sound, microphones and music during the event: speeches, playlists, DJ or band",
        "Handles lights and fog too, if they are part of the setup",
        "Charged per hour — pick the 4-hour block when you need him for the whole evening",
        "Delivery, setup and collection are included in the packages with a sound engineer",
      ]}
      faqExtra={[
        {
          q: "What does the sound engineer do on the day?",
          a: "He sets up the system, tests it and runs a sound check with you before the guests arrive. During the event he controls sound, microphones and music — speeches, playlists, DJ or band — and packs down again when you are done.",
        },
        {
          q: "How much does a sound engineer cost?",
          a: "1,000 DKK per hour incl. VAT. If you add the sound engineer as an extra in the booking, that counts as one hour — write in the comment how many hours you need and we adjust the order before you pay. If you need him for the whole evening, the 4-hour block is the cheapest option, and it is included in the packages below.",
        },
        {
          q: "Do I still have to collect the equipment myself?",
          a: "No. In the packages with a sound engineer, delivery, setup and collection are always included — the engineer arrives with the gear, sets up and takes it home again. If you add him as an extra to a system you collect yourself, he sets up at your venue but does not transport the equipment.",
        },
        {
          q: "Can the sound engineer also run lights and fog?",
          a: "Yes. He is an AV technician, so light packages, fog machines and microphones are handled together with the sound. Tell us in the comment what is planned, and he comes prepared.",
        },
        {
          q: "How far do you travel?",
          a: "We cover all of Copenhagen and the surrounding area. If your event is further away, write to us and we will quote the travel.",
        },
      ]}
    >
      <BundleGrid
        locale="en"
        ids={LYDMAND_PAKKER}
        eyebrow="Packages with a sound engineer"
        title="System, technician and transport in one price"
        subtitle="We arrive with the gear, set up, run the sound for 4 hours and collect it again. Delivery, setup and collection are included in all three."
      />
    </ProductLanding>
  );
}
