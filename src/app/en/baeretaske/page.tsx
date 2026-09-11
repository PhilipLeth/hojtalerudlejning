import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Speaker Carry Bag Rental | 95 DKK | Lejhøjtaler.dk",
  description:
    "Rent a padded carry bag for the small speaker package for 95 DKK. Safe transport by bike, bus or car — speakers and cables together in one place. Rent in Copenhagen.",
  keywords: ["speaker carry bag rental", "bag for speakers hire copenhagen", "speakers by bike copenhagen", "speaker transport bag"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/baeretaske",
    languages: localeAlternates("/baeretaske"),
  },
  openGraph: {
    title: "Carry bag rental | 95 DKK",
    description: "Padded sports bag for safe transport by bike or car.",
    url: "https://lejhojtaler.dk/en/baeretaske",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/baeretaske"
      name="Carry bag"
      price={95}
      headline="Rent a carry bag for the speakers"
      sub="A padded sports bag that holds the small speaker package and all the cables — so you can collect by bike."
      image="/images/product-taske.webp"
      imageAlt="Padded carry bag for speakers"
      productId="taske"
      bookLabel="Book a carry bag"
      faqPhrase="a carry bag"
      bullets={[
        "Padded — the speakers do not take knocks on the bike path",
        "Room for 2× Alto 10\" speakers and all cables",
        "Shoulder strap and handles",
        "Fits in a bike basket, a cargo bike or on the back seat",
        "Included in the Graduation package",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Collecting by bike?</h2>
          <p className="mb-6 text-white/50">
            The small speaker package weighs 12 kg and fits in the bag. Add it to the booking and the speakers are packed and ready when you arrive.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/hojtalerpakke-lille" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              See the Small speaker package
            </Link>
            <Link href="/en/lej-hojtaler" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              All speakers
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
