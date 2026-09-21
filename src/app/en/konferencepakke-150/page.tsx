import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Conference Package 150 | Speakers, microphone, headset and screen | ${prisDkk("pakke_konference_150")} | Lejhøjtaler.dk`,
  description:
    `Conference package 150 with two 12\" speakers on stands, Shure wireless microphone, headset and 55\" display. For halls with 100-150 participants, ${prisDkk("pakke_konference_150")}.`,
  keywords: ["conference equipment rental copenhagen", "microphone and speaker hire", "av equipment for conference denmark", "sound for general assembly rental", "screen and microphone rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/konferencepakke-150",
    languages: localeAlternates("/konferencepakke-150"),
  },
  openGraph: {
    images: ogImages("/images/product-skaerm.webp"),
    title: `Conference package 150 | Speakers, microphone, headset and screen | ${prisDkk("pakke_konference_150")}`,
    description: `Two 12\" speakers on stands, Shure wireless microphone, headset and 55\" display. For 100-150 participants, ${prisDkk("pakke_konference_150")}.`,
    url: "https://lejhojtaler.dk/en/konferencepakke-150",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/konferencepakke-150"
      name="Conference package 150"
      headline="Conference package 150, so both the speaker and the hall are with you"
      sub={`2× EV 12\" on stands, Shure wireless microphone, wireless headset and 55\" display. For 100-150 participants, save ${rabatDkk("pakke_konference_150")}.`}
      imageAlt="Conference package with speakers, microphone, headset and large screen"
      productId="pakke_konference_150"
      capacity={{ level: 3, label: "100-150 people" }}
      bullets={[
        "2× EV 12\" powered speakers on stands, speech is clear at the very back",
        "Shure BLX wireless handheld microphone in stage quality",
        "Wireless headset so the presenter can move freely",
        "55\" display on a stand with HDMI, slides and video",
        "All cables and power included",
        `Save ${rabatDkk("pakke_konference_150")} compared to renting the parts separately`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Panel, several microphones or a hybrid meeting?</h2>
          <p className="mb-6 text-white/50">
            Two wireless microphones plug straight into the speakers. For four on stage, book the panel package.
            If the room also needs to join Teams or Zoom, book the Teams and Zoom package. Both are booked online.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/lej-mikrofon" className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400">
              Book microphone packages
            </Link>
            <Link href="/en/lydanlaeg" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              See the whole ladder
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
