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
