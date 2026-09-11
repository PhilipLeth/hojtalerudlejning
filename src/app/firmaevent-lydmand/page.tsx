import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Firmaevent med lydmand | Anlæg + mixer + mikrofon + tekniker | 6.195 kr | Lejhøjtaler.dk",
  description:
    "Firmaevent med lydmand: stor højtalerpakke + Yamaha-mixer + trådløs mikrofon + AV-tekniker i 4 timer. Leveret, sat op og hentet igen for 6.195 kr — spar 285 kr. Taler og musik til op til 100 personer.",
  keywords: ["lydmand firmafest", "lydanlæg med tekniker erhverv", "firmaevent lyd københavn", "mikrofon og tekniker til reception", "av-tekniker firmaevent"],
  alternates: {
    canonical: "https://lejhojtaler.dk/firmaevent-lydmand",
    languages: localeAlternates("/firmaevent-lydmand"),
  },
  openGraph: {
    title: "Firmaevent med lydmand | 6.195 kr",
    description: "Stor højtalerpakke + mixer + trådløs mikrofon + lydmand i 4 timer. Leveret, sat op og hentet igen — spar 285 kr.",
    url: "https://lejhojtaler.dk/firmaevent-lydmand",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="firmaevent-lydmand"
      name="Firmaevent med lydmand"
      price={6195}
      priceUnit="/event"
      headline="Firmaevent med lydmand"
      sub="Stor højtalerpakke + mixer + trådløs mikrofon + AV-tekniker i 4 timer. Taler, musik og én der passer det hele — spar 285 kr."
      image="/images/product-pakke-lydmand-firma-v2.webp"
      imageAlt="Firmaevent med lydmand: højtalere, mixer og mikrofon"
      productId="pakke_lydmand_firma"
      bookLabel="Book firmaevent med lydmand"
      ctaText="Levering, opsætning, 4 timer med lydmand og afhentning er med i prisen. Faktura med EAN er ingen sag. Alt i én pris:"
      faqMode="extraOnly"
      faqExtra={[
        {
          q: "Skal jeg selv hente noget?",
          a: "Nej. Levering, opsætning og afhentning er med i prisen. Lydmanden kommer med grejet, sætter op og laver lydprøve, før gæsterne kommer — og tager det hele med hjem igen bagefter. Vi kører i hele København og omegn.",
        },
        {
          q: "Kan vi få faktura med EAN-nummer?",
          a: "Ja. Vælg betaling på faktura i bookingen og skriv firmanavn og EAN-nummer i kommentaren, så sender vi fakturaen dertil. Vi tager et faktureringsgebyr på 100 kr.",
        },
        {
          q: "Kan lydmanden også køre en præsentation eller en skærm?",
          a: "Han er AV-tekniker, så lyd til en præsentation, flere mikrofoner og musik mellem talerne er hverdag. Skærm og projektor udlejer vi ikke lige nu — skriv, hvis I har jeres eget, så sætter han det sammen med lyden.",
        },
        {
          q: "Hvad hvis festen varer længere end 4 timer?",
          a: "Så vælger du ekstra timer med lydmanden som tilvalg i bookingen — 1.000 kr pr. time. Skriv i kommentaren hvornår festen starter og slutter, så planlægger vi opsætningen efter det.",
        },
      ]}
      bullets={[
        "2× EV 12\" højtalere (op til 100 pers.)",
        "Yamaha-mixer med effekter — rumklang på talerne",
        "Trådløs håndholdt mikrofon til taler og præsentationer",
        "Lydmand i 4 timer — mikrofonen virker, når direktøren rejser sig",
        "Levering, opsætning og afhentning er med",
        "Spar 285 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Skal der også danses?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Stor fest med lydmand: subwoofer, stativer, lys og røg til dansegulvet efter middagen.
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
