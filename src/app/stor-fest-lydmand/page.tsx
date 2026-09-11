import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Stor fest med lydmand | Fuldt anlæg + lys + røg + tekniker | 6.995 kr | Lejhøjtaler.dk",
  description:
    "Stor fest med lydmand: stor højtalerpakke + subwoofer + stativer + lys-pakke + røgmaskine + AV-tekniker i 4 timer. Leveret, sat op og hentet igen for 6.995 kr — spar 280 kr. Til op til 150 gæster.",
  keywords: ["stor fest med lydmand", "lej lydanlæg med tekniker 150 personer", "fest lyd lys røg med opsætning", "lydmand til stor fest københavn", "dj anlæg med tekniker"],
  alternates: {
    canonical: "https://lejhojtaler.dk/stor-fest-lydmand",
    languages: localeAlternates("/stor-fest-lydmand"),
  },
  openGraph: {
    title: "Stor fest med lydmand | 6.995 kr",
    description: "Stor højtalerpakke + subwoofer + stativer + lys + røg + lydmand i 4 timer. Leveret, sat op og hentet igen — spar 280 kr.",
    url: "https://lejhojtaler.dk/stor-fest-lydmand",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="stor-fest-lydmand"
      name="Stor fest med lydmand"
      price={6995}
      priceUnit="/event"
      headline="Stor fest med lydmand"
      sub="Fuldt anlæg med bas, lys og røg + AV-tekniker i 4 timer. Vi sætter det hele op og holder dansegulvet kørende — spar 280 kr."
      image="/images/product-pakke-lydmand-stor.webp"
      imageAlt="Stor fest med lydmand: højtalere, røgmaskine og lydmandens mixer"
      productId="pakke_lydmand_stor"
      bookLabel="Book stor fest med lydmand"
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
          q: "Kan vi selv spille musik, når der er lydmand?",
          a: "Ja. I kan koble en telefon på via Bluetooth, have en DJ med eller lade lydmanden køre jeres playliste. Han sørger for at det lyder rigtigt og at taler og musik ikke slås om anlægget.",
        },
      ]}
      bullets={[
        "2× EV 12\" højtalere på stativer (op til 150 pers.)",
        "Subwoofer 12\" — den dybe bas til dansegulvet",
        "Lys-pakke: 2 farvede lamper + centereffekt på stativ",
        "Røgmaskine inkl. røgvæske — lyset bliver synligt",
        "Lydmand i 4 timer — sætter op, laver lydprøve og styrer lyd, lys og røg",
        "Levering, opsætning og afhentning er med",
        "Spar 280 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Mindre fest?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Festpakke med lydmand: højtalere, lys og tekniker uden bas og røg — til op til 100 personer.
          </p>
          <Link
            href="/festpakke-lydmand"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            Se Festpakke med lydmand – <LivePrice productId="pakke_lydmand_fest" prefix="" suffix=" kr" />
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
