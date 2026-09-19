import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: "Wedding light package Copenhagen | 1.200 DKK | Lejhøjtaler.dk",
  description: "Fairy lights, uplights and low fog for the wedding waltz, dancing on clouds for 1,200 DKK. Save 135 DKK. Rental in Copenhagen.",
  keywords: ["wedding lights rental copenhagen", "low fog wedding first dance", "wedding party lights"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/bryllupslys",
    languages: localeAlternates("/bryllupslys"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-bryllupslys-taendt.webp"),
    title: "Wedding light package Copenhagen | 1.200 DKK | Lejhøjtaler.dk",
    description: "Warm light above the tables, uplights on the walls and low fog for the first dance, save 135 DKK.",
    url: "https://lejhojtaler.dk/en/bryllupslys",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/bryllupslys"
      name="Wedding light bar"
      price={1200}
      headline="Wedding light bar, waltz on clouds"
      sub="Warm light above the tables, uplights on the walls and low fog for the first dance, save 135 DKK."
      image="/images/product-pakke-bryllupslys-taendt-white.webp"
      imageAlt="Wedding light bar switched on: warm white string lights, four LED uplights and the low fog machine"
      productId="pakke_bryllupslys"
      faqPhrase="wedding light bar"
      capacity={{ level: 2, label: "a barn or banquet hall" }}
      bullets={[
        "The low fog machine makes the 'dancing on clouds' effect from wedding videos",
        "10 m warm white fairy lights above the tables",
        "4 LED uplights, pick one colour and the hall follows",
        "Everything runs on normal power, no technician",
        "Save 135 DKK vs renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Need sound as well?</h2>
          <p className="mb-6 text-white/50">
            Our wedding package has it all: speakers, a wireless microphone for the speeches, lights and low fog, in one booking.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/festlys" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              All party lights
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
