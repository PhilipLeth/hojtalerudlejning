import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Corporate Event with Sound Engineer | Sound + mixer + mic + tech | 6,195 DKK | Lejhøjtaler.dk",
  description:
    "Corporate event with a sound engineer: large speaker package + Yamaha mixer + wireless mic + AV technician for 4 hours. Delivered, set up and collected for 6,195 DKK — save 285 DKK. Speeches and music for up to 100 people.",
  keywords: ["corporate event sound engineer copenhagen", "company party sound system with technician", "microphone and technician for reception", "av technician corporate event denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/firmaevent-lydmand",
    languages: localeAlternates("/firmaevent-lydmand"),
  },
  openGraph: {
    title: "Corporate event with sound engineer | 6,195 DKK",
    description: "Large speaker package + mixer + wireless mic + sound engineer for 4 hours. Delivered, set up and collected — save 285 DKK.",
    url: "https://lejhojtaler.dk/en/firmaevent-lydmand",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/firmaevent-lydmand"
      name="Corporate event with sound engineer"
      price={6195}
      priceUnit="/event"
      headline="Corporate event with a sound engineer"
      sub="Large speaker package + mixer + wireless mic + AV technician for 4 hours. Speeches, music and someone running it all — save 285 DKK."
      image="/images/product-pakke-lydmand-firma.webp"
      imageAlt="Corporate event with sound engineer: speakers, mixer and microphone"
      productId="pakke_lydmand_firma"
      bookLabel="Book the corporate event package"
      ctaText="Delivery, setup, 4 hours with the sound engineer and collection are all included. Invoice with EAN is no problem. One price:"
      faqMode="extraOnly"
      faqExtra={[
        {
          q: "Do I have to collect anything myself?",
          a: "No. Delivery, setup and collection are included in the price. The sound engineer arrives with the gear, sets up and runs a sound check before the guests arrive — and takes everything home again afterwards. We cover all of Copenhagen and the surrounding area.",
        },
        {
          q: "Can we get an invoice with an EAN number?",
          a: "Yes. Choose payment by invoice in the booking and write the company name and EAN number in the comment, and we send the invoice there. We charge an invoicing fee of 100 DKK.",
        },
        {
          q: "Can the sound engineer also run a presentation or a screen?",
          a: "He is an AV technician, so sound for a presentation, several microphones and music between speeches is routine. We do not rent screens or projectors right now — write to us if you have your own, and he connects it with the sound.",
        },
        {
          q: "What if the party lasts longer than 4 hours?",
          a: "Add extra hours with the sound engineer as an extra in the booking — 1,000 DKK per hour. Write the start and end time in the comment and we plan the setup around it.",
        },
      ]}
      bullets={[
        "2× EV 12\" speakers (up to 100 guests)",
        "Yamaha mixer with effects — reverb on the speeches",
        "Wireless handheld microphone for speeches and presentations",
        "Sound engineer for 4 hours — the mic works when the boss stands up",
        "Delivery, setup and collection included",
        "Save 285 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Dancing afterwards?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Big party with sound engineer: subwoofer, stands, lights and fog for the dancefloor after dinner.
          </p>
          <Link
            href="/en/stor-fest-lydmand"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            See Big party with sound engineer – <LivePrice productId="pakke_lydmand_stor" prefix="" suffix=" kr" />
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
