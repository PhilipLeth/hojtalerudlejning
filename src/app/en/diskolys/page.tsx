import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Disco light package Copenhagen | 845 DKK | Lejhøjtaler.dk",
  description: "Disco light effect and disco ball — the dancefloor for 845 DKK. Save 145 DKK. Rental in Copenhagen.",
  keywords: ["disco light rental copenhagen", "disco ball rental", "dancefloor lights rental", "party lights copenhagen"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/diskolys",
    languages: localeAlternates("/diskolys"),
  },
  openGraph: {
    title: "Disco light package Copenhagen | 845 DKK | Lejhøjtaler.dk",
    description: "Disco light effect and a motorised disco ball with spotlight. The cheapest way to a real dancefloor — save 145 DKK.",
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
      name="Disco light package"
      price={845}
      headline="Disco light package — the dancefloor in one box"
      sub="Disco light effect and a motorised disco ball with spotlight. The cheapest way to a real dancefloor — save 145 DKK."
      image="/images/product-discokugle.webp"
      imageAlt="Disco light package"
      productId="pakke_diskolys"
      faqPhrase="disco light package"
      capacity={{ level: 1, label: "the dancefloor" }}
      bullets={[
        "LED par light with automatic colour effects — no controller, just power",
        "40 cm disco ball with motor, spotlight and stand",
        "Fits in less than a moving box — easy to bring home by bike",
        "Optional fog machine makes the beams visible in the air",
        "Save 145 DKK vs renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Missing the fog?</h2>
          <p className="mb-6 text-white/50">
            Light beams are invisible in clean air — you only see coloured dots on the wall. Add a fog machine and the beams appear, and it looks like a club.
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
