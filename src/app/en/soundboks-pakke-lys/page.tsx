import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Soundboks Package with Lights | Soundboks 4 + light package | 1,090 DKK | Lejhøjtaler.dk",
  description:
    "Soundboks package with lights: Soundboks 4 and light package for 1,090 DKK — save 100 DKK. Battery-powered sound and party lights for up to 50 people. Rent in Copenhagen.",
  keywords: ["soundboks with lights rental copenhagen", "soundboks package hire", "battery speaker and party lights rental", "soundboks 4 rental denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/soundboks-pakke-lys",
    languages: localeAlternates("/soundboks-pakke-lys"),
  },
  openGraph: {
    title: "Soundboks package with lights | 1,090 DKK",
    description: "Soundboks 4 + light package. Battery-powered sound and lights — save 100 DKK.",
    url: "https://lejhojtaler.dk/en/soundboks-pakke-lys",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/soundboks-pakke-lys"
      name="Soundboks package with lights"
      price={1090}
      headline="Soundboks package with lights — sound without a socket, lights that make it a party"
      sub="Soundboks 4 + light package with 2 coloured lamps and a centre effect. The bass runs on battery, the lights need a socket — save 100 DKK."
      image="/images/product-soundboks.webp"
      imageAlt="Soundboks package with lights: Soundboks 4 and light package"
      productId="pakke_soundboks_lys"
      faqPhrase="the Soundboks package with lights"
      capacity={{ level: 2, label: "up to 50 people" }}
      bullets={[
        "Soundboks 4 — powerful bass, battery-powered, Bluetooth",
        "Light package: 2 coloured LED lamps + centre effect on a stand",
        "The lights need power — plan for that if you are outdoors",
        "Charger, AUX cable and all light cables included",
        "Save 100 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Completely off-grid?</h2>
          <p className="mb-6 text-white/50">
            If both sound and lights have to run without a socket, take the Outdoor package with an extra battery and a string of lights instead — it is built for courtyards, parks and beaches.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/udendorspakke" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              See the Outdoor package
            </Link>
            <Link href="/en/soundboks-4" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              See Soundboks 4 on its own
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
