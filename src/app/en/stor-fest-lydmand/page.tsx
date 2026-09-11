import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Big Party with Sound Engineer | Full rig + lights + fog + tech | 6,995 DKK | Lejhøjtaler.dk",
  description:
    "Big party with a sound engineer: large speaker package + subwoofer + stands + light package + fog machine + AV technician for 4 hours. Delivered, set up and collected for 6,995 DKK — save 280 DKK. For up to 150 guests.",
  keywords: ["big party sound engineer copenhagen", "sound system rental with technician 150 people", "party sound lights fog with setup copenhagen", "dj rig with technician denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/stor-fest-lydmand",
    languages: localeAlternates("/stor-fest-lydmand"),
  },
  openGraph: {
    title: "Big party with sound engineer | 6,995 DKK",
    description: "Large speaker package + subwoofer + stands + lights + fog + sound engineer for 4 hours. Delivered, set up and collected — save 280 DKK.",
    url: "https://lejhojtaler.dk/en/stor-fest-lydmand",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/stor-fest-lydmand"
      name="Big party with sound engineer"
      price={6995}
      priceUnit="/event"
      headline="Big party with a sound engineer"
      sub="Full rig with bass, lights and fog + AV technician for 4 hours. We set it all up and keep the dancefloor going — save 280 DKK."
      image="/images/product-pakke-lydmand-stor.webp"
      imageAlt="Big party with sound engineer: speakers, fog machine and the engineer's mixer"
      productId="pakke_lydmand_stor"
      bookLabel="Book the big party package"
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
          q: "Can we play our own music when there is a sound engineer?",
          a: "Yes. Connect a phone via Bluetooth, bring a DJ or let the engineer run your playlist. He makes sure it sounds right and that speeches and music never fight over the system.",
        },
      ]}
      bullets={[
        "2× EV 12\" speakers on stands (up to 150 guests)",
        "12\" subwoofer — the deep bass for the dancefloor",
        "Light package: 2 coloured lamps + centre effect on a stand",
        "Fog machine incl. fluid — makes the light beams visible",
        "Sound engineer for 4 hours — sets up, runs the sound check and controls sound, lights and fog",
        "Delivery, setup and collection included",
        "Save 280 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Smaller party?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Party package with sound engineer: speakers, lights and technician without bass and fog — for up to 100 people.
          </p>
          <Link
            href="/en/festpakke-lydmand"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            See Party package with sound engineer – <LivePrice productId="pakke_lydmand_fest" prefix="" suffix=" kr" />
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
