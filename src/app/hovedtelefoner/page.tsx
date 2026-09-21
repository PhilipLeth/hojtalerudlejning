import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: `Lej DJ-hovedtelefoner København | Fun Generation HP 5 | ${prisKr("dj_headphones")}`,
  description:
    `Lej lukkede DJ-hovedtelefoner i København for ${prisKr("dj_headphones")}. Fun Generation HP 5 med mini-jack og 6,3 mm-adapter. Følger med DJ-pulten, og kan bookes alene online.`,
  keywords: ["lej dj hovedtelefoner", "dj headphones leje", "hovedtelefoner udlejning københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/hovedtelefoner", languages: localeAlternates("/hovedtelefoner") },
  openGraph: {
    images: ogImages(),
    title: `Lej DJ-hovedtelefoner | ${prisKr("dj_headphones")}`,
    description: "Fun Generation HP 5. Følger med DJ-pulten, eller book dem alene.",
    url: "https://lejhojtaler.dk/hovedtelefoner",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="hovedtelefoner"
      name="DJ-hovedtelefoner · Fun Generation HP 5"
      headline="Lej DJ-hovedtelefoner"
      sub="DJ-hovedtelefoner udlejes ikke lige nu. DJ-pulten er en AlphaTheta XDJ, og hovedtelefoner medbringer DJ'en selv."
      imageAlt="Fun Generation HP 5 DJ-hovedtelefoner til leje"
      productId="dj_headphones"
      bookLabel="Læg hovedtelefoner i kurven"
      faqPhrase="DJ-hovedtelefoner"
      bullets={[
        "Fun Generation HP 5, lukket design",
        "Mini-jack og 6,3 mm-adapter med",
        "3 m kabel",
        "Følger med, når I lejer DJ-pulten",
        `${prisKr("dj_headphones")} for hele lejeperioden`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Lej pulten, og hovedtelefonerne er med</h2>
          <p className="mb-6 text-white/50">
            DJ-pulten bookes med iPad, flightcase og de her hovedtelefoner. Skal I kun bruge hovedtelefonerne, ligger de i kurven for 100 kr.
          </p>
          <Link href="/dj-pult" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
            Se DJ-pult og pakker
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
