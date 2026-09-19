import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "DJ headphone rental Copenhagen | Fun Generation HP 5 | 100 DKK",
  description:
    "Hire closed-back DJ headphones in Copenhagen for 100 DKK. Fun Generation HP 5 with mini-jack and 6.3 mm adapter. Included with the DJ controller, or book them on their own.",
  keywords: ["dj headphone rental copenhagen", "hire dj headphones", "dj headphones hire"],
  alternates: { canonical: "https://lejhojtaler.dk/en/hovedtelefoner", languages: localeAlternates("/hovedtelefoner") },
  openGraph: {
    title: "DJ headphone rental | 100 DKK",
    description: "Fun Generation HP 5. Included with the DJ controller, or book them on their own.",
    url: "https://lejhojtaler.dk/en/hovedtelefoner",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/hovedtelefoner"
      name="DJ headphones · Fun Generation HP 5"
      price={100}
      headline="Hire DJ headphones"
      sub="DJ headphones are not available for rent right now. The DJ system is an AlphaTheta XDJ-AZ, and DJs bring their own headphones. bring your own deck."
      image="/images/product-hovedtelefoner.webp"
      imageAlt="Fun Generation HP 5 DJ headphones for hire"
      productId="dj_headphones"
      bookLabel="Add headphones to basket"
      faqPhrase="DJ headphones"
      bullets={[
        "Fun Generation HP 5, closed-back",
        "Mini-jack and 6.3 mm adapter included",
        "3 m cable",
        "Included when you hire the DJ controller",
        "100 DKK for the whole rental period",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Hire the controller, headphones included</h2>
          <p className="mb-6 text-white/50">
            The DJ controller is booked with an iPad, flight case and these headphones. Need headphones only? Add them to the basket for 100 DKK.
          </p>
          <Link href="/en/dj-pult" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
            See DJ controller packages
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
