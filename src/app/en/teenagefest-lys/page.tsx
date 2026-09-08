import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Teen party lights Copenhagen | 945 DKK | Lejhøjtaler.dk",
  description: "Disco effect, disco ball and coloured fairy lights — the basement becomes a club for 945 DKK. Save 140 DKK. Rental in Copenhagen.",
  keywords: ["teen party lights rental", "18th birthday party lights", "disco lights for birthday party"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/teenagefest-lys",
    languages: localeAlternates("/teenagefest-lys"),
  },
  openGraph: {
    title: "Teen party lights Copenhagen | 945 DKK | Lejhøjtaler.dk",
    description: "Disco effect, disco ball and 10 m of coloured fairy lights. Kill the ceiling light, switch this on — save 140 DKK.",
    url: "https://lejhojtaler.dk/en/teenagefest-lys",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/teenagefest-lys"
      name="Teen party lights"
      price={945}
      headline="Teen party lights — the basement becomes a club"
      sub="Disco effect, disco ball and 10 m of coloured fairy lights. Kill the ceiling light, switch this on — save 140 DKK."
      image="/images/product-pakke-teenagefest-taendt.webp"
      imageAlt="Teen party lights switched on: mirror ball, LED par light and a coloured festoon string"
      productId="pakke_teenagefest"
      faqPhrase="teen party lights"
      capacity={{ level: 1, label: "the basement or garage" }}
      bullets={[
        "LED par light with colour effects — automatic, no controller",
        "30 cm disco ball with motor and spotlight",
        "10 m coloured fairy lights for wall or ceiling",
        "Everything runs on normal sockets",
        "Save 140 DKK vs renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Need music too?</h2>
          <p className="mb-6 text-white/50">
            The sound for a teen party is usually a Soundboks — battery-powered, loud, and carried down the basement stairs in one hand.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/soundboks-4" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Rent a Soundboks
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
