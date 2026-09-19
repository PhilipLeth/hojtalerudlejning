import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: "Disco light package Copenhagen | 685 DKK | Lejhøjtaler.dk",
  description: "Disco light effect and disco ball, the dancefloor for 685 DKK. Save 155 DKK. Rental in Copenhagen.",
  keywords: ["disco light rental copenhagen", "disco ball rental", "dancefloor lights rental", "party lights copenhagen"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/diskolys",
    languages: localeAlternates("/diskolys"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-diskolys-taendt-v2.webp"),
    title: "Disco light package Copenhagen | 685 DKK | Lejhøjtaler.dk",
    description: "Disco light effect and a motorised disco ball with spotlight. The cheapest way to a real dancefloor, save 155 DKK.",
    url: "https://lejhojtaler.dk/en/diskolys",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/diskolys"
      name="Disco light bar"
      price={685}
      headline="Disco light bar, the dancefloor in one box"
      sub="Disco light effect and a motorised disco ball with spotlight. The cheapest way to a real dancefloor, save 155 DKK."
      image="/images/product-pakke-diskolys-taendt-v2-white.webp"
      imageAlt="Disco light bar switched on: a mirror ball on its stand with spotlight and an LED par light"
      productId="pakke_diskolys"
      faqPhrase="disco light bar"
      capacity={{ level: 1, label: "the dancefloor" }}
      bullets={[
        "LED par light with automatic colour effects, no controller, just power",
        "40 cm disco ball with motor, spotlight and stand",
        "Fits in less than a moving box, easy to bring home by bike",
        "Optional fog machine makes the beams visible in the air",
        "Save 155 DKK vs renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Missing the fog?</h2>
          <p className="mb-6 text-white/50">
            Light beams are invisible in clean air, you only see coloured dots on the wall. Add a fog machine and the beams appear, and it looks like a club.
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
