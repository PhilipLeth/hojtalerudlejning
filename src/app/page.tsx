import HomeHero from "@/components/HomeHero";
import BundleGrid from "@/components/BundleGrid";
import { FEST_LADDER_IDS } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";
import Testimonials from "@/components/Testimonials";
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
        ids={FEST_LADDER_IDS}
        title="Vælg anlæg efter antal gæster"
        subtitle="Du skal ikke gætte på tommer og watt — sig hvor mange der kommer, så er pakken sat sammen på forhånd. Levering og opsætning kan tilvælges."
      />
      <ProductGrid />
      <Testimonials />
      <HowItWorks />
      <FAQ />
      <Footer />
      <StickyBookBar />

      <LocalBusinessJsonLd
        extra={{
          priceRange: "95-1195 kr",
          image: "https://lejhojtaler.dk/images/logo-lejhojtaler.webp",
          description:
            "Højtalerudlejning i København. Lej højtaler, PA-anlæg, batterihøjtaler og lydudstyr til fest, event og party. Billig levering i hele København. Festudstyr til leje fra 345 kr/weekend.",
          url: "https://lejhojtaler.dk",
        }}
      />
    </main>
  );
}
