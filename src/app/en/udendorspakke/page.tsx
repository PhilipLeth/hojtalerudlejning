import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Outdoor Package | Soundboks, extra battery and string lights | 895 DKK | Lejhøjtaler.dk",
  description:
    "Outdoor package: Soundboks 4, extra battery and 10 m string lights for 895 DKK — save 140 DKK. Party in the courtyard, park or on the beach with no power at all. Rent in Copenhagen.",
  keywords: ["party without power speaker rental", "soundboks rental copenhagen", "garden party sound hire", "bachelor party speaker rental", "battery speaker rental denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/udendorspakke",
    languages: localeAlternates("/udendorspakke"),
  },
  openGraph: {
    title: "Outdoor package | Soundboks, extra battery and string lights | 895 DKK",
    description: "Soundboks 4, extra battery and 10 m string lights. Courtyard, beach or park — save 140 DKK.",
    url: "https://lejhojtaler.dk/en/udendorspakke",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/udendorspakke"
      name="Outdoor package"
      price={895}
      headline="The outdoor package — the whole party without a socket"
      sub="Soundboks 4, extra battery and 10 m string lights. Courtyard, beach or park — save 140 DKK."
      image="/images/product-soundboks.webp"
      imageAlt="Outdoor package with Soundboks 4, extra battery and string lights"
      productId="pakke_udendors"
      faqPhrase="the outdoor package"
      capacity={{ level: 2, label: "up to 50 people" }}
      bullets={[
        "Soundboks 4 — powerful bass, battery-powered, Bluetooth",
        "Extra battery: two batteries last a whole evening and night",
        "10 m string lights, so there is light when the sun goes down",
        "No power, no extension cords, no cables across the grass",
        "Save 140 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Garden party, bachelor party or a ceremony in the garden?</h2>
          <p className="mb-6 text-white/50">
            It is the same challenge every time: there is no socket, and the party has to last past midnight. Two batteries mean the system does not die in the middle of it all.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/havefest" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Sound for garden parties
            </Link>
            <Link href="/polterabend" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              Sound for bachelor parties
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
