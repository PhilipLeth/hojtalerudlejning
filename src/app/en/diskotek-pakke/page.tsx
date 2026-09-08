import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Club light package Copenhagen | 1.295 DKK | Lejhøjtaler.dk",
  description: "Light package, disco effect and disco ball — a full dancefloor without fog for 1,295 DKK. Save 190 DKK. Rental in Copenhagen.",
  keywords: ["club lights rental copenhagen", "dj lights rental", "party lights no fog"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/diskotek-pakke",
    languages: localeAlternates("/diskotek-pakke"),
  },
  openGraph: {
    title: "Club light package Copenhagen | 1.295 DKK | Lejhøjtaler.dk",
    description: "Light bar on a stand, an extra effect and a disco ball. For venues with smoke alarms — save 190 DKK.",
    url: "https://lejhojtaler.dk/en/diskotek-pakke",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/diskotek-pakke"
      name="Club light package"
      price={1295}
      headline="Club light package — a full dancefloor, no fog"
      sub="Light bar on a stand, an extra effect and a disco ball. For venues with smoke alarms — save 190 DKK."
      image="/images/product-pakke-diskotek.webp"
      imageAlt="Club light package switched on: light bar on a stand, mirror ball and an extra LED par light"
      productId="pakke_diskotek"
      faqPhrase="club light package"
      capacity={{ level: 2, label: "a full dancefloor" }}
      bullets={[
        "Light package: 2 coloured lamps + centre effect on a stand",
        "Extra LED par light to cross the floor",
        "40 cm disco ball with motor and spotlight",
        "No fog — safe for venues with smoke alarms",
        "Save 190 DKK vs renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Is fog allowed at your venue?</h2>
          <p className="mb-6 text-white/50">
            Then take the Light show instead — same ball, but with a fog machine that makes the beams visible.
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
