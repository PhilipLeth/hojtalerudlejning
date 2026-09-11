import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Movie Night Package | Projector, screen and speakers | 1,195 DKK | Lejhøjtaler.dk",
  description:
    "Movie night package with projector, screen and speakers — everything for an outdoor cinema in the backyard for 1,195 DKK. Book online in Copenhagen.",
  keywords: ["projector and screen rental copenhagen", "outdoor cinema hire", "projector for party rental", "movie night equipment copenhagen", "projector screen rental denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/filmaften",
    languages: localeAlternates("/filmaften"),
  },
  openGraph: {
    title: "Movie night package | Projector, screen and speakers | 1,195 DKK",
    description: "Projector, screen and speakers — everything for an outdoor cinema in the backyard for 1,195 DKK.",
    url: "https://lejhojtaler.dk/en/filmaften",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/filmaften"
      name="Movie night package"
      price={1195}
      headline="The movie night package — cinema in the courtyard"
      sub="Full HD projector, 160 cm screen on a stand and two speakers. Everything for movie night — save 90 DKK."
      image="/images/product-projektor.webp"
      imageAlt="Movie night package with projector, screen and speakers"
      productId="pakke_filmaften"
      capacity={{ level: 2, label: "up to 40 people" }}
      bullets={[
        "Full HD projector with HDMI and remote control",
        "160 cm screen on a stand — free-standing, nothing to hang up",
        "2× Alto 10\" speakers: a projector's own sound is not enough",
        "All cables and power included",
        "Save 90 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Watching outdoors?</h2>
          <p className="mb-6 text-white/50">
            Wait until it is properly dark — a Full HD projector cannot compete with summer evening light. For daylight or a large room, take the Projector Pro with 5000 lumen instead.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/projektor-pro" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Projector Pro (5000 lumen)
            </Link>
            <Link href="/av-udstyr" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              All AV equipment
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
