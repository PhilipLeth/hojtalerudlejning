import { Metadata } from "next";
import Footer from "@/components/Footer";
import PausetKategori from "@/components/PausetKategori";
import { LocationKicker } from "@/components/PhoneLink";

/**
 * /lej-projektor — på pause.
 *
 * Projektor, Pro, lærred og skærme er taget ud af sortimentet (se
 * PAUSEDE_PRODUKTER i src/lib/products.ts). Siden bliver liggende med sin
 * placering i Google, men uden priser og bookingknapper — den siger i stedet
 * hvad vi udlejer, så den, der leder efter et billede til sit event, ikke
 * spilder tiden på et tomt produktgrid.
 */
export const metadata: Metadata = {
  title: "Lej Projektor København — udlejes ikke lige nu | Lejhøjtaler.dk",
  description:
    "Vi udlejer ikke projektor, lærred eller skærm lige nu. Vi har samlet udlejningen om højtalere, festlys og røg i København.",
  alternates: { canonical: "https://lejhojtaler.dk/lej-projektor" },
  openGraph: {
    title: "Lej Projektor København — udlejes ikke lige nu | Lejhøjtaler.dk",
    description: "Projektor, lærred og skærm er på pause. Vi udlejer højtalere, festlys og røg.",
    url: "https://lejhojtaler.dk/lej-projektor",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LejProjektorPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Projektorer", item: "https://lejhojtaler.dk/lej-projektor" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="relative flex min-h-[45vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: "url(/images/hero.webp)" }} />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            <LocationKicker extra="Højtalere, lys og røg" />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Projektor og lærred
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              udlejes ikke lige nu
            </span>
          </h1>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <PausetKategori
          hvad="projektor, lærred og skærm"
          detalje="Skal der både være billede og lyd til dit event, kan vi tage lyden — mikrofon og højtalere står klar, og billedet må komme et andet sted fra."
        />
        <Footer />
      </main>
    </>
  );
}
