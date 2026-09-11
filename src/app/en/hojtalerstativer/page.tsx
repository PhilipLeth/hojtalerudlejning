import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Speaker Stands Rental Copenhagen | 100 DKK | Lejhøjtaler.dk",
  description:
    "Rent 2 professional speaker stands in Copenhagen for 100 DKK. Lifts the speakers to ear level so the sound reaches the whole room. Fits all our speaker packages.",
  keywords: ["speaker stands rental copenhagen", "speaker stand hire", "pa speaker stands denmark", "tripod speaker stands rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/hojtalerstativer",
    languages: localeAlternates("/hojtalerstativer"),
  },
  openGraph: {
    title: "Speaker stands rental | 100 DKK",
    description: "2 professional stands — lifts the sound to ear level. Fits all our speakers.",
    url: "https://lejhojtaler.dk/en/hojtalerstativer",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/hojtalerstativer"
      name="Speaker stands"
      price={100}
      headline="Rent speaker stands"
      sub="2 professional stands that lift the speakers to ear level — so the sound travels over heads instead of into the backs of the front row."
      image="/images/product-stativer.webp"
      imageAlt="Two professional speaker stands for rent"
      productId="stativer"
      bookLabel="Book speaker stands"
      faqPhrase="speaker stands"
      bullets={[
        "2 stands with adjustable height (up to about 2 m)",
        "Fit Alto 10\" and EV 12\" — all our speaker packages",
        "Tripod with safety pin, stable on floors and grass",
        "Add them in the booking together with the speakers",
        "Included in Speaker package 100 and the party packages from 150 guests",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">When should the speakers go on stands?</h2>
          <p className="mb-6 text-white/50">
            With the speakers on the floor, the guests at the front block the sound for everyone else. With 30 people or more in the room, stands do more for the sound than an extra speaker would.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/lej-hojtaler" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              See speaker packages
            </Link>
            <Link href="/en/subwoofer" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              See the subwoofer
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
