import { prisDkk } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: `Microphone Stand Rental Copenhagen | ${prisDkk("mikrofonstativ")} | Lejhøjtaler.dk`,
  description:
    `Rent a microphone stand in Copenhagen for ${prisDkk("mikrofonstativ")}: floor stand with boom arm for speeches, vocals and karaoke. Rent it with the microphone or on its own. One price for up to five days.`,
  keywords: ["microphone stand rental copenhagen", "mic stand hire", "boom mic stand rental", "microphone stand rental denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/mikrofonstativ",
    languages: localeAlternates("/mikrofonstativ"),
  },
  openGraph: {
    images: ogImages("/images/product-mikrofonstativ-v2-white.webp"),
    title: `Microphone stand rental | ${prisDkk("mikrofonstativ")}`,
    description: "Floor stand with boom arm for speeches and vocals. Rent it with the microphone or on its own.",
    url: "https://lejhojtaler.dk/en/mikrofonstativ",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/mikrofonstativ"
      name="Microphone stand"
      headline="Rent a microphone stand"
      sub="A floor stand with a boom arm, so speakers have both hands free for their notes and the microphone stays put while people sing."
      imageAlt="Microphone stand with boom arm for rent"
      productId="mikrofonstativ"
      bookLabel="Book a microphone stand"
      faqPhrase="microphone stand"
      bullets={[
        "Fun Generation floor stand with adjustable height and boom arm",
        "Fits all our microphones, wired and wireless",
        "Microphone not included, choose it separately",
        "Add it to the microphone or the speaker package in the booking",
        "Stable tripod base, even with dancing nearby",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">When does the microphone need a stand?</h2>
          <p className="mb-6 text-white/50">
            When speeches are read from notes, when people sing, and when the same microphone is passed around all
            evening. A microphone resting in its stand between speeches doesn&apos;t end up on the floor either.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/lej-mikrofon" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              See microphones
            </Link>
            <Link href="/en/tilbehoer#stativer" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              See all stands
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
