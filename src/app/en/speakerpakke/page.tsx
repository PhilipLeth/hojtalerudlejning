import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Speaker Package with Microphone | Medium speaker package + handheld mic | ${prisDkk("pakke_speaker_mik")} | Lejhøjtaler.dk`,
  description:
    `Speaker package: medium speaker package and wired handheld microphone for ${prisDkk("pakke_speaker_mik")}, save ${rabatDkk("pakke_speaker_mik")}. Music and speeches for 30-50 guests, the mic plugs straight into the speaker. Rent in Copenhagen.`,
  keywords: ["speaker and microphone rental copenhagen", "sound system with mic hire", "speakers for speeches and music copenhagen", "pa system with microphone denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/speakerpakke",
    languages: localeAlternates("/speakerpakke"),
  },
  openGraph: {
    images: ogImages("/images/product-festival-v2.webp"),
    title: `Speaker package | Speakers + microphone | ${prisDkk("pakke_speaker_mik")}`,
    description: `Medium speaker package + handheld microphone. Sound and speeches for 30-50 guests, save ${rabatDkk("pakke_speaker_mik")}.`,
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
      headline="Speaker package, music and speeches with no mixer in between"
      sub={`Medium speaker package + wired handheld microphone. The mic plugs straight into the speaker, save ${rabatDkk("pakke_speaker_mik")}.`}
      image="/images/product-festival-v2-white.webp"
      imageAlt="Speaker package with two EV speakers and a handheld microphone"
      productId="pakke_speaker_mik"
      faqPhrase="the speaker package"
      capacity={{ level: 2, label: "30-50 people" }}
      bullets={[
        "2× EV 12\" speakers with Bluetooth",
        "Wired handheld microphone, straight into the speaker",
        "No mixer to learn, plug in and talk",
        "All cables included",
        `Save ${rabatDkk("pakke_speaker_mik")} compared to renting the parts separately`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Does the speaker need to move around?</h2>
          <p className="mb-6 text-white/50">
            Then take the Speech & music package with a wireless microphone instead. For several microphones or a band we add a mixer, see the mixers.
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
