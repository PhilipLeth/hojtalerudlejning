import HomeHero from "@/components/HomeHero";
import BundleGrid from "@/components/BundleGrid";
import ProductGrid from "@/components/ProductGrid";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StickyBookBar from "@/components/StickyBookBar";

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
            telephone: "+4531132852",
            priceRange: "95-1195 kr",
            image: "https://lejhojtaler.dk/images/logo-lejhojtaler.png",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5.0",
              reviewCount: "4",
              bestRating: "5",
            },
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
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: "Friday",
                opens: "14:00",
                closes: "18:00",
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: "Monday",
                opens: "15:00",
                closes: "17:00",
              },
            ],
          }),
        }}
      />
    </main>
  );
}
