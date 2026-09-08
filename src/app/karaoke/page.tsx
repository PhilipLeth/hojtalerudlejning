import { Metadata } from "next";
import BundleGrid from "@/components/BundleGrid";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import GoogleReviews from "@/components/GoogleReviews";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import { LocationKicker } from "@/components/PhoneLink";

/**
 * /karaoke — kategorisiden for karaoke.
 *
 * Karaoke var på pause fra august til 8. september 2026, hvor siden stod som
 * en ren beskedside uden priser eller bookingknap. Den sælger igen: maskinen,
 * skærmen der viser teksterne, og de to pakker hvor lyden er med.
 */
export const metadata: Metadata = {
  title: "Lej karaoke i København | Maskine og pakker fra 695 kr | Lejhøjtaler.dk",
  description:
    "Lej karaoke i København. Karaokemaskine med to trådløse mikrofoner fra 695 kr, eller en pakke med skærm og højtalere fra 1.300 kr. Intet depositum — book online.",
  keywords: [
    "lej karaoke",
    "karaoke udlejning københavn",
    "lej karaokemaskine",
    "karaokeanlæg leje",
    "karaoke til fest",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/karaoke" },
  openGraph: {
    title: "Lej karaoke i København | Fra 695 kr",
    description:
      "Karaokemaskine med to trådløse mikrofoner fra 695 kr, eller hele pakken med skærm og højtalere. Book online.",
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

      <section className="relative flex min-h-[55vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: "url(/images/hero.webp)" }} />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            <LocationKicker extra="Betal ved afhentning" />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lej karaoke
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              i København
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Maskinen har to trådløse mikrofoner og skærm indbygget. Skal teksterne
            kunne læses fra sofaen, lejer du en skærm med — eller tager hele pakken.
          </p>
          <a
            href="#pakker"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Se karaokepakkerne
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <div id="pakker">
          <BundleGrid
            ids={["pakke_karaoke", "pakke_karaoke_fest"]}
            eyebrow="Karaokepakke"
            title="Alt til aftenen i én pakke"
            subtitle="Maskine, skærm og højtalere sat sammen — billigere end delene hver for sig."
          />
        </div>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="mb-2 text-center text-3xl font-bold">Maskine og skærm</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Karaokemaskinen kan stå alene til en lille aften. Er I flere end en
            sofagruppe, er en skærm på stativ forskellen på at synge med og at gætte.
          </p>
          <CategoryProductGrid
            items={[
              { id: "karaoke", href: "/karaoke-maskine", tag: "2 trådløse mikrofoner" },
              { id: "skaerm_32", href: "/skaerm-32", tag: "Til teksterne" },
              { id: "skaerm_55", href: "/skaerm" },
            ]}
          />
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="mb-2 text-center text-3xl font-bold">Lyd nok til at synge over</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Maskinens egen højtaler rækker til stuen. Skal der synges til fest,
            skal stemmen kunne høres over snakken — så lejer du højtalere med.
          </p>
          <CategoryProductGrid
            items={[
              { id: "party", href: "/hojtalerpakke-lille" },
              { id: "festival", href: "/hojtalerpakke-normal", tag: "Til de store fester" },
            ]}
          />
        </section>

        <FaqSection items={CATEGORY_FAQ["karaoke"]} />

        <GoogleReviews />
        <Footer />
      </main>
    </>
  );
}
