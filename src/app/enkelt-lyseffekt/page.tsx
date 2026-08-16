import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Enkelt Lyseffekt København | 195 kr | Lejhøjtaler.dk",
  description:
    "Lej enkelt LED-festlys i København fra 195 kr/weekend. Plug and play farveeffekt på fod — perfekt til fødselsdag, konfirmation og hjemmefest. Book online på 2 min.",
  keywords: [
    "lej lyseffekt københavn",
    "enkelt lyseffekt leje",
    "LED festlys udlejning",
    "lej discolys til fest",
    "festlys leje billigt",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/enkelt-lyseffekt" },
  openGraph: {
    title: "Lej Enkelt Lyseffekt København | 195 kr",
    description:
      "1 LED-par-lys (uden stativ) — plug and play farveeffekt til din fest. Book online, betal ved afhentning.",
    url: "https://lejhojtaler.dk/enkelt-lyseffekt",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="enkelt-lyseffekt"
      name="Enkelt lyseffekt"
      price={195}
      headline="Lej enkelt lyseffekt i København"
      sub="1 LED-par-lys (uden stativ) — plug and play farveeffekt der sætter stemning på få minutter."
      image="/images/product-lyseffekt.webp"
      imageAlt="Enkelt LED-festlys til leje i København"
      productId="lyseffekt"
      bullets={[
        "1 LED-par-lys (uden stativ) med automatiske farveeffekter",
        "Plug and play — tilslut strøm og den kører",
        "Perfekt til stuer, festlokaler og havefest op til ca. 40 personer",
        "Kombiner med højtalerpakke eller vælg den i lille festpakke",
        "Tilvælg røgmaskine for endnu mere effekt i lyset",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-4 text-2xl font-bold">Hvornår er en enkelt lyseffekt nok?</h2>
          <p className="mb-4 text-white/50">
            Til de fleste hjemmefester, konfirmationer og fødselsdage er én god lyseffekt
            nok til at skabe feststemning uden at fylde lokalet med udstyr. Vil I have
            lysbar til større dansegulv, er{" "}
            <a href="/lys-pakke" className="text-brand-400 underline-offset-2 hover:underline">
              lys-pakken
            </a>{" "}
            det rigtige valg.
          </p>
          <p className="text-white/50">
            Tilvælg lyseffekten direkte i bookingen sammen med højtalere — eller vælg{" "}
            <a href="/festpakke-lille" className="text-brand-400 underline-offset-2 hover:underline">
              lille festpakke
            </a>{" "}
            hvor lyd og lys allerede er samlet.
          </p>
        </div>
      </section>
    </ProductLanding>
  );
}
