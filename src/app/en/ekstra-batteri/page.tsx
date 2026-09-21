import { prisDkk } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Soundboks Battery Rental | ${prisDkk("batteri")} | Lejhøjtaler.dk`,
  description:
    `Rent an extra battery for the Soundboks 4 for ${prisDkk("batteri")}. Double the playtime without power, for garden parties, beaches and graduation rides. Rent in Copenhagen.`,
  keywords: ["extra battery speaker rental", "soundboks extra battery hire", "battery speaker all night"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/ekstra-batteri",
    languages: localeAlternates("/ekstra-batteri"),
  },
  openGraph: {
    images: ogImages("/images/product-thumpgo-v2.webp"),
    title: `Soundboks battery rental | ${prisDkk("batteri")}`,
    description: "Extra battery for the Soundboks 4, double the playtime without power.",
    url: "https://lejhojtaler.dk/en/ekstra-batteri",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/ekstra-batteri"
      name="Soundboks battery"
      headline="Rent an extra battery for the Soundboks 4"
      sub="An extra battery for the Soundboks 4, so the party does not end when the first one runs dry."
      imageAlt="Soundboks battery for rent"
      productId="batteri"
      bookLabel="Book an extra battery"
      faqPhrase="an extra battery"
      bullets={[
        "Original Soundboks battery, fits the Soundboks 4",
        "Double the playtime, typically 20+ hours in total at party volume",
        "Swapped in half a minute without tools",
        "Delivered fully charged together with the speaker",
        "Included in the Outdoor package and the Graduation package",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">How long does one battery last?</h2>
          <p className="mb-6 text-white/50">
            At normal party volume the Soundboks 4 lasts about 40 hours on low and 10-12 hours on high. If you play loud from afternoon to night, the extra battery is what saves the evening.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/udendorspakke" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              See the Outdoor package
            </Link>
            <Link href="/en/soundboks-4" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              See Soundboks 4
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
