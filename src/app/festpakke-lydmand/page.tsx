import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Festpakke med lydmand | Anlæg + lys + tekniker | 5.995 kr | Lejhøjtaler.dk",
  description:
    "Festpakke med lydmand: stor højtalerpakke + lys-pakke + AV-tekniker i 4 timer. Leveret, sat op og hentet igen for 5.995 kr — spar 290 kr. Lyd og lys til op til 100 gæster i København.",
  keywords: ["festpakke med lydmand", "lej lydanlæg med tekniker", "fest med lydmand københavn", "lyd og lys med opsætning", "lydmand til fødselsdag"],
  alternates: {
    canonical: "https://lejhojtaler.dk/festpakke-lydmand",
    languages: localeAlternates("/festpakke-lydmand"),
  },
  openGraph: {
    title: "Festpakke med lydmand | 5.995 kr",
    description: "Stor højtalerpakke + lys-pakke + lydmand i 4 timer. Leveret, sat op og hentet igen — spar 290 kr.",
    url: "https://lejhojtaler.dk/festpakke-lydmand",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="festpakke-lydmand"
      name="Festpakke med lydmand"
      price={5995}
      priceUnit="/event"
      headline="Festpakke med lydmand"
      sub="Stor højtalerpakke + lys-pakke + AV-tekniker i 4 timer. Vi kommer, sætter op, styrer lyden og pakker sammen — spar 290 kr."
      image="/images/product-pakke-lydmand-fest.webp"
      imageAlt="Festpakke med lydmand: højtalere, lys og lydmandens mixer"
      productId="pakke_lydmand_fest"
      bookLabel="Book festpakke med lydmand"
      ctaText="Levering, opsætning, 4 timer med lydmand og afhentning er med i prisen. Alt i én pris:"
      faqMode="extraOnly"
      faqExtra={[
        {
          q: "Skal jeg selv hente noget?",
          a: "Nej. Levering, opsætning og afhentning er med i prisen. Lydmanden kommer med grejet, sætter op og laver lydprøve, før gæsterne kommer — og tager det hele med hjem igen bagefter. Vi kører i hele København og omegn.",
        },
        {
          q: "Hvornår kommer I og sætter op?",
          a: "Typisk 1-2 timer før gæsterne kommer, så alt er testet i ro og mag. Vi aftaler tidspunktet med dig, når bookingen er bekræftet. De 4 timer med lydmand tæller fra festen starter — opsætningen er oveni.",
        },
        {
          q: "Hvad hvis festen varer længere end 4 timer?",
          a: "Så vælger du ekstra timer med lydmanden som tilvalg i bookingen — 1.000 kr pr. time. Skriv i kommentaren hvornår festen starter og slutter, så planlægger vi opsætningen efter det.",
        },
        {
          q: "Hvor mange gæster rækker pakken til?",
          a: "Op til 100 personer indendørs. Skal I være flere, så se Stor fest med lydmand, hvor der er subwoofer, stativer og røg med — eller skriv til os, hvis I er over 150.",
        },
      ]}
      bullets={[
        "2× EV 12\" højtalere med Bluetooth (op til 100 pers.)",
        "Lys-pakke: 2 farvede lamper + centereffekt på stativ",
        "Lydmand i 4 timer — sætter op, laver lydprøve og styrer lyden",
        "Levering, opsætning og afhentning er med",
        "Spar 290 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Større fest?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Stor fest med lydmand: subwoofer, stativer, lys og røg oveni — til op til 150 personer.
          </p>
          <Link
            href="/stor-fest-lydmand"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            Se Stor fest med lydmand – <LivePrice productId="pakke_lydmand_stor" prefix="" suffix=" kr" />
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
