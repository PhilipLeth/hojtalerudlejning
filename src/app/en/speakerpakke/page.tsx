import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Speaker Package with Microphone | Large speaker package + handheld mic | 1,045 DKK | Lejhøjtaler.dk",
  description:
    "Speaker package: large speaker package and wired handheld microphone for 1,045 DKK — save 45 DKK. Music and speeches for 30-50 guests, the mic plugs straight into the speaker. Rent in Copenhagen.",
  keywords: ["speaker and microphone rental copenhagen", "sound system with mic hire", "speakers for speeches and music copenhagen", "pa system with microphone denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/speakerpakke",
    languages: localeAlternates("/speakerpakke"),
  },
  openGraph: {
    title: "Speaker package | Speakers + microphone | 1,045 DKK",
    description: "Large speaker package + handheld microphone. Sound and speeches for 30-50 guests — save 45 DKK.",
    url: "https://lejhojtaler.dk/en/speakerpakke",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/speakerpakke"
      name="Speaker package"
      price={1045}
      headline="Speaker package — music and speeches with no mixer in between"
      sub="Large speaker package + wired handheld microphone. The mic plugs straight into the speaker — save 45 DKK."
      image="/images/product-festival.webp"
      imageAlt="Speaker package with two EV speakers and a handheld microphone"
      productId="pakke_speaker_mik"
      faqPhrase="the speaker package"
      capacity={{ level: 2, label: "30-50 people" }}
      bullets={[
        "2× EV 12\" speakers with Bluetooth",
        "Wired handheld microphone — straight into the speaker",
        "No mixer to learn — plug in and talk",
        "All cables included",
        "Save 45 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Does the speaker need to move around?</h2>
          <p className="mb-6 text-white/50">
            Then take the Speech & music package with a wireless microphone instead. For several microphones or a band we add a mixer — see the mixers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/pakke-tale-musik" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              See the Speech & music package
            </Link>
            <Link href="/en/mixer" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              See mixers
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
