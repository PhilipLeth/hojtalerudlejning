import HomeHero from "@/components/HomeHero";
import BundleGrid from "@/components/BundleGrid";
import ProductGrid from "@/components/ProductGrid";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StickyBookBar from "@/components/StickyBookBar";
import { PHONE_E164 } from "@/lib/phone";
import { openingHoursSpecification } from "@/lib/openingHours";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HomeHero />
      <BundleGrid />
      <ProductGrid />
      <Testimonials />
      <HowItWorks />
      <FAQ />
      <Footer />
      <StickyBookBar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Scharling Studio / Lejhøjtaler.dk",
            legalName: "Scharling Studio",
            taxID: "DK40994904",
            telephone: PHONE_E164,
            priceRange: "95-1195 kr",
            image: "https://lejhojtaler.dk/images/logo-lejhojtaler.webp",
            description:
              "Højtalerudlejning i København. Lej højtaler, PA-anlæg, batterihøjtaler og lydudstyr til fest, event og party. Billig levering i hele København. Festudstyr til leje fra 345 kr/weekend.",
            url: "https://lejhojtaler.dk",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Halvtolv 9, 1. th",
              postalCode: "1436",
              addressLocality: "København K",
              addressCountry: "DK",
            },
            areaServed: { "@type": "City", name: "København" },
            openingHoursSpecification: openingHoursSpecification(),
          }),
        }}
      />
    </main>
  );
}
