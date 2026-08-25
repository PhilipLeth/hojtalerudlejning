import { Metadata } from "next";
import Footer from "@/components/Footer";
import PausetKategori from "@/components/PausetKategori";
import { LocationKicker } from "@/components/PhoneLink";

/**
 * /karaoke — på pause.
 *
 * Karaoke er taget ud af sortimentet sammen med skærme, projektor og lærred
 * (se PAUSEDE_PRODUKTER i src/lib/products.ts). Siden bliver liggende, fordi
 * den har en placering i Google og pausen kan rulles tilbage — men den viser
 * hverken pakker, priser eller en bookingknap, for der er ikke noget at booke.
 * Teksten siger det ligeud og peger videre til lyd, lys og røg.
 */
export const metadata: Metadata = {
  title: "Lej Karaoke København — udlejes ikke lige nu | Lejhøjtaler.dk",
  description:
    "Vi udlejer ikke karaoke lige nu. Vi har samlet udlejningen om højtalere, festlys og røg — se højtalerpakkerne til festen i stedet.",
  alternates: { canonical: "https://lejhojtaler.dk/karaoke" },
  openGraph: {
    title: "Lej Karaoke København — udlejes ikke lige nu | Lejhøjtaler.dk",
    description: "Karaoke er på pause. Vi udlejer højtalere, festlys og røg i København.",
    url: "https://lejhojtaler.dk/karaoke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function KaraokePage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Karaoke", item: "https://lejhojtaler.dk/karaoke" },
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
            Karaoke
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              udlejes ikke lige nu
            </span>
          </h1>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <PausetKategori
          hvad="karaoke"
          detalje="Karaokemaskinen og skærmen til teksterne er sat på pause sammen med resten af AV-udstyret. Skal der synges alligevel, er en højtaler med mikrofon det, der skal til — og den udlejer vi stadig."
        />
        <Footer />
      </main>
    </>
  );
}
