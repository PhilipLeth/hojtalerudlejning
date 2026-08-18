import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Konferencepakke 150 | Højtalere, mikrofon, headset og skærm | 1.795 kr | Lejhøjtaler.dk",
  description:
    "Konferencepakke 150: 2× EV 12\" højtalere på stativer, Shure trådløs mikrofon, trådløst headset og 55\" skærm for 1.795 kr — spar 235 kr. Til sale med 100-150 deltagere i København.",
  keywords: ["konferenceudstyr leje", "lej mikrofon og højtaler", "av udstyr til konference", "lydudstyr til generalforsamling", "skærm og mikrofon leje"],
  alternates: { canonical: "https://lejhojtaler.dk/konferencepakke-150" },
  openGraph: {
    title: "Konferencepakke 150 | Højtalere, mikrofon, headset og skærm | 1.795 kr",
    description: "2× 12\" højtalere + Shure trådløs mic + headset + 55\" skærm — spar 235 kr.",
    url: "https://lejhojtaler.dk/konferencepakke-150",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Konferencepakke150Page() {
  return (
    <ProductLanding
      slug="konferencepakke-150"
      name="Konferencepakke 150"
      price={1795}
      headline="Konferencepakke 150 — så både taleren og salen er med"
      sub="2× EV 12&quot; på stativer, Shure trådløs mikrofon, trådløst headset og 55&quot; skærm. Til 100-150 deltagere — spar 235 kr."
      image="/images/product-skaerm.webp"
      imageAlt="Konferencepakke med højtalere, mikrofon, headset og storskærm"
      productId="pakke_konference_150"
      capacity={{ level: 3, label: "100-150 pers." }}
      bullets={[
        "2× EV 12\" aktive højtalere på stativer — tale er tydelig helt bagest",
        "Shure BLX trådløs håndholdt mikrofon i scenekvalitet",
        "Trådløst headset, så oplægsholderen kan bevæge sig frit",
        "55\" skærm på stativ med HDMI — slides og video",
        "Alle kabler og strøm med",
        "Spar 235 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Panel, flere mikrofoner eller hybridmøde?</h2>
          <p className="mb-6 text-white/50">
            To trådløse mikrofoner går direkte i højtalerne. Skal der være tre eller fire på scenen — eller skal salens
            lyd sendes videre til Teams eller Zoom — sætter vi en mixer på. Det klarer vi som et tilbud, så vi ved præcis
            hvad der skal med.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/erhverv"
              className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400"
            >
              Få et tilbud
            </Link>
            <Link
              href="/lydanlaeg"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Se hele stigen
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
