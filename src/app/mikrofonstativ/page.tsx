import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: `Lej Mikrofonstativ København | ${prisKr("mikrofonstativ")} | Lejhøjtaler.dk`,
  description:
    `Lej mikrofonstativ i København for ${prisKr("mikrofonstativ")}: gulvstativ med galge til tale, sang og karaoke. Lejes sammen med mikrofonen eller for sig. Fast pris for op til fem dage.`,
  keywords: ["lej mikrofonstativ", "mikrofonstativ leje københavn", "mikrofonstativ med galge", "stativ til mikrofon"],
  alternates: {
    canonical: "https://lejhojtaler.dk/mikrofonstativ",
    languages: localeAlternates("/mikrofonstativ"),
  },
  openGraph: {
    images: ogImages("/images/product-mikrofonstativ-v2-white.webp"),
    title: `Lej mikrofonstativ | ${prisKr("mikrofonstativ")}`,
    description: "Gulvstativ med galge til tale og sang. Lejes med mikrofonen eller for sig.",
    url: "https://lejhojtaler.dk/mikrofonstativ",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="mikrofonstativ"
      name="Mikrofonstativ"
      headline="Lej mikrofonstativ"
      sub="Et gulvstativ med galge, så talerne har begge hænder fri til papirerne, og mikrofonen står stille, mens der bliver sunget."
      imageAlt="Mikrofonstativ med galge til leje"
      productId="mikrofonstativ"
      bookLabel="Book mikrofonstativ nu"
      faqPhrase="mikrofonstativ"
      bullets={[
        "Fun Generation gulvstativ med justerbar højde og galge",
        "Passer til alle vores mikrofoner, med og uden ledning",
        "Mikrofonen er ikke med, den vælges for sig",
        "Kan lægges på som tilvalg til mikrofonen eller højtalerpakken",
        "Står fast på trefod, også når der danses tæt på",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Hvornår skal mikrofonen på stativ?</h2>
          <p className="mb-6 text-white/50">
            Når der holdes taler fra papir, når der synges, og når den samme mikrofon går på omgang hele aftenen. En
            mikrofon, der står i stativet mellem talerne, bliver heller ikke tabt på gulvet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/lej-mikrofon" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Se mikrofoner
            </Link>
            <Link href="/tilbehoer#stativer" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              Se alle stativer
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
