import HomeHero from "@/components/HomeHero";
import BundleGrid from "@/components/BundleGrid";
import Link from "next/link";
import { FEST_LADDER_FORSIDE_IDS, prisSpaend, startPrisKr } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";
import GoogleReviews from "@/components/GoogleReviews";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StickyBookBar from "@/components/StickyBookBar";
import { PHONE_E164 } from "@/lib/phone";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HomeHero />
      <BundleGrid
        ids={FEST_LADDER_FORSIDE_IDS}
        title="Vælg anlæg efter antal gæster"
        subtitle="Du skal ikke gætte på tommer og watt — sig hvor mange der kommer, så er pakken sat sammen på forhånd. Levering og opsætning kan tilvælges."
        note={
          <>
            Flere end 100 gæster?{" "}
            <Link href="/festpakke-150" className="text-brand-400 underline-offset-2 hover:underline">
              Festpakke 150
            </Link>{" "}
            og{" "}
            <Link href="/festpakke-250" className="text-brand-400 underline-offset-2 hover:underline">
              Festpakke 250
            </Link>{" "}
            dækker de større fester.
          </>
        }
      />
      {/* Anmeldelserne står lige under pakkerne — det er dér, valget træffes */}
      <GoogleReviews />
      <ProductGrid />
      {/* Lejefraserne folk faktisk søger på — interne links med lejeordet i
          ankerteksten, så siderne bag dem kan rangere på det. Footeren fanger
          de forældreløse; det her er forsidens egen stemme. */}
      <section className="mx-auto max-w-4xl px-4 pb-20 text-center">
        <p className="mb-3 text-sm uppercase tracking-widest text-white/30">Populært at leje lige nu</p>
        <p className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium">
          <Link href="/soundboks-4" className="text-brand-400 underline-offset-4 transition hover:text-brand-300 hover:underline">
            Lej en Soundboks
          </Link>
          <Link href="/diskolys" className="text-brand-400 underline-offset-4 transition hover:text-brand-300 hover:underline">
            Lej diskolys
          </Link>
          <Link href="/festlys" className="text-brand-400 underline-offset-4 transition hover:text-brand-300 hover:underline">
            Lej festlys
          </Link>
          <Link href="/roegmaskine" className="text-brand-400 underline-offset-4 transition hover:text-brand-300 hover:underline">
            Lej en røgmaskine
          </Link>
          <Link href="/lej-hojtaler" className="text-brand-400 underline-offset-4 transition hover:text-brand-300 hover:underline">
            Lej højtalere
          </Link>
        </p>
      </section>
      <HowItWorks />
      <FAQ />
      <Footer />
      <StickyBookBar />

      <LocalBusinessJsonLd
        extra={{
          priceRange: prisSpaend(),
          image: "https://lejhojtaler.dk/images/logo-lejhojtaler.webp",
          description:
            `Højtalerudlejning i København. Lej højtaler, PA-anlæg, batterihøjtaler og lydudstyr til fest, event og party. Billig levering i hele København. Festudstyr til leje fra ${startPrisKr()}/weekend.`,
          url: "https://lejhojtaler.dk",
        }}
      />
    </main>
  );
}
