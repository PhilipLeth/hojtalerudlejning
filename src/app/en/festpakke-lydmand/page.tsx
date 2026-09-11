import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Party Package with Sound Engineer | Sound + lights + tech | 5,995 DKK | Lejhøjtaler.dk",
  description:
    "Party package with a sound engineer: large speaker package + light package + AV technician for 4 hours. Delivered, set up and collected for 5,995 DKK — save 290 DKK. Sound and lights for up to 100 guests in Copenhagen.",
  keywords: ["party package with sound engineer", "sound system rental with technician copenhagen", "party sound and lights with setup", "event technician copenhagen"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/festpakke-lydmand",
    languages: localeAlternates("/festpakke-lydmand"),
  },
  openGraph: {
    title: "Party package with sound engineer | 5,995 DKK",
    description: "Large speaker package + light package + sound engineer for 4 hours. Delivered, set up and collected — save 290 DKK.",
    url: "https://lejhojtaler.dk/en/festpakke-lydmand",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/festpakke-lydmand"
      name="Party package with sound engineer"
      price={5995}
      priceUnit="/event"
      headline="Party package with a sound engineer"
      sub="Large speaker package + light package + AV technician for 4 hours. We arrive, set up, run the sound and pack down — save 290 DKK."
      image="/images/product-pakke-lydmand-fest-v2.webp"
      imageAlt="Party package with sound engineer: speakers, lights and the engineer's mixer"
      productId="pakke_lydmand_fest"
      bookLabel="Book the party package with sound engineer"
      ctaText="Delivery, setup, 4 hours with the sound engineer and collection are all included. One price:"
      faqMode="extraOnly"
      faqExtra={[
        {
          q: "Do I have to collect anything myself?",
          a: "No. Delivery, setup and collection are included in the price. The sound engineer arrives with the gear, sets up and runs a sound check before the guests arrive — and takes everything home again afterwards. We cover all of Copenhagen and the surrounding area.",
        },
        {
          q: "When do you arrive to set up?",
          a: "Usually 1-2 hours before the guests arrive, so everything is tested calmly. We agree on the time with you once the booking is confirmed. The 4 hours with the sound engineer count from when the party starts — setup is on top.",
        },
        {
          q: "What if the party lasts longer than 4 hours?",
          a: "Add extra hours with the sound engineer as an extra in the booking — 1,000 DKK per hour. Write the start and end time in the comment and we plan the setup around it.",
        },
        {
          q: "How many guests does the package cover?",
          a: "Up to 100 people indoors. For more, see the Big party with sound engineer, which adds a subwoofer, stands and fog — or write to us if you are above 150.",
        },
      ]}
      bullets={[
        "2× EV 12\" speakers with Bluetooth (up to 100 guests)",
        "Light package: 2 coloured lamps + centre effect on a stand",
        "Sound engineer for 4 hours — sets up, runs the sound check and controls the sound",
        "Delivery, setup and collection included",
        "Save 290 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Bigger party?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Big party with sound engineer: subwoofer, stands, lights and fog on top — for up to 150 people.
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
