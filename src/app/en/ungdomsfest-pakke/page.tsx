import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Youth Party Package Copenhagen | Sound and Disco Lights | 1,395 DKK | Lejhøjtaler.dk",
  description: "Soundboks 4, disco light effect and mirror ball in one package — sound and lights for a youth party at 1,395 DKK. Save 190 DKK. Rental in Copenhagen, set up in ten minutes.",
  keywords: ["youth party package rental copenhagen", "18th birthday party sound and lights", "disco lights and speaker rental", "teen party equipment hire copenhagen"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/ungdomsfest-pakke",
    languages: localeAlternates("/ungdomsfest-pakke"),
  },
  openGraph: {
    title: "Youth Party Package Copenhagen | Sound and Disco Lights | 1,395 DKK | Lejhøjtaler.dk",
    description: "Soundboks 4, disco light effect and mirror ball. Kill the ceiling light, switch this on — save 190 DKK.",
    url: "https://lejhojtaler.dk/en/ungdomsfest-pakke",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/ungdomsfest-pakke"
      name="Youth party package"
      price={1395}
      headline="Youth party package — sound and disco lights in one price"
      sub="Soundboks 4, disco light effect and 30 cm mirror ball. Battery-powered sound, lights that make the dancefloor — save 190 DKK."
      image="/images/product-pakke-ungdomsfest-taendt.webp"
      imageAlt="Youth party package switched on: Soundboks 4, LED par light and mirror ball with spotlight in a dark room"
      productId="pakke_ungdomsfest"
      faqPhrase="youth party package"
      capacity={{ level: 2, label: "up to 50 guests in the basement, garage or living room" }}
      bullets={[
        "Soundboks 4 — big bass, Bluetooth and battery, no socket needed",
        "LED par light with automatic colour effects — plug and play",
        "30 cm mirror ball with motor and spotlight — the classic dotted effect",
        "Fog machine and coloured fairy lights can be added in the booking",
        "Save 190 DKK vs renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">More than 50 guests?</h2>
          <p className="mb-6 text-white/50">
            Then it is the large youth party package: two 12&quot; speakers, a light package on a stand, a 40 cm mirror ball and a fog machine — a proper disco for a hall or a barn.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/ungdomsfest-pakke-stor" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Large youth party package
            </Link>
            <Link href="/en/ungdomsfest" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              All about sound and lights for youth parties
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
