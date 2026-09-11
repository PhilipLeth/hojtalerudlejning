import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Wedding Package | Sound, microphone, lights and low fog | 2,695 DKK | Lejhøjtaler.dk",
  description:
    "Wedding package: 2× EV 12\" speakers on stands, wireless microphone for the speeches, light package, string lights and low fog machine for 2,695 DKK — save 180 DKK. Delivery and setup available in Copenhagen.",
  keywords: ["wedding sound system rental copenhagen", "wedding package hire", "microphone for wedding speeches rental", "low fog first dance copenhagen", "wedding lighting rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/bryllupspakke",
    languages: localeAlternates("/bryllupspakke"),
  },
  openGraph: {
    title: "Wedding package | Sound, microphone, lights and low fog | 2,695 DKK",
    description: "Speakers on stands, wireless microphone, lights, string lights and low fog for the first dance. Save 180 DKK.",
    url: "https://lejhojtaler.dk/en/bryllupspakke",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/bryllupspakke"
      name="Wedding package"
      price={2695}
      headline="The wedding package — speeches and dancefloor in one"
      sub="Speakers on stands, wireless microphone, lights, string lights and low fog for the first dance. Save 180 DKK."
      image="/images/product-pakke-bryllup-taendt.webp"
      imageAlt="The wedding package: two EV speakers on stands, wireless microphone, warm white string lights and the low fog machine"
      productId="pakke_bryllup"
      faqPhrase="the wedding package"
      capacity={{ level: 3, label: "up to 100 people" }}
      bullets={[
        "2× EV 12\" speakers on stands — speeches during dinner, party afterwards",
        "Wireless microphone so the speeches are heard at the back",
        "Light package: 2 coloured lamps + centre effect",
        "10 m string lights for the tent or ceiling",
        "Low fog machine — \"dancing on clouds\" for the first dance",
        "Save 180 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Should we set up before the guests arrive?</h2>
          <p className="mb-6 text-white/50">
            On a wedding day there is no time to rig a sound system. We drive out in the morning, set up ready to use and collect again after the party — 795 DKK both ways. Choose it in the booking.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/bryllup" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Everything about wedding sound
            </Link>
            <Link href="/en/lydanlaeg" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              More than 100 guests?
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
