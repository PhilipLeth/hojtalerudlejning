import BookingFlow from "@/components/BookingFlow";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StickyBookBar from "@/components/StickyBookBar";
import ExitIntent from "@/components/ExitIntent";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <BookingFlow />
      <Testimonials />
      <HowItWorks />
      <FAQ />
      <Footer />
      <StickyBookBar />

      {/* JSON-LD: LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Scharling Studio / Lejhøjtaler.dk",
            legalName: "Scharling Studio",
            taxID: "DK40994904",
            description:
              "Højtalerudlejning i København. Lej højtaler, PA-anlæg og lydudstyr til fest, event og party. Festudstyr til leje fra 399 kr/weekend.",
            url: "https://lejhojtaler.dk",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Halvtolv 9, 1. th",
              postalCode: "1436",
              addressLocality: "København K",
              addressCountry: "DK",
            },
            areaServed: {
              "@type": "City",
              name: "København",
            },
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

      {/* JSON-LD: Product — Party-højtaler */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Lille højtalerpakke udlejning",
            description:
              "2× 10\" Alto højtalere med Bluetooth til leje. Op til 40 personer. 12 kg i bæretaske — klar til cyklen. Inkl. alle kabler.",
            image: "https://lejhojtaler.dk/images/product-party.png",
            brand: {
              "@type": "Brand",
              name: "Lejhøjtaler.dk",
            },
            offers: {
              "@type": "Offer",
              price: "399",
              priceCurrency: "DKK",
              priceValidUntil: "2026-12-31",
              availability: "https://schema.org/InStock",
              url: "https://lejhojtaler.dk/#book",
              description: "Fra 399 kr/weekend (fre–man). Højtalerleje København.",
            },
          }),
        }}
      />

      {/* JSON-LD: Product — Festival-højtaler */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Stor højtalerpakke udlejning",
            description:
              "2× 12\" EV højtalere med Bluetooth til leje. 40–100 personer. Inkl. stativer og alle kabler. Perfekt til store fester og events i København.",
            image: "https://lejhojtaler.dk/images/product-festival.png",
            brand: {
              "@type": "Brand",
              name: "Lejhøjtaler.dk",
            },
            offers: {
              "@type": "Offer",
              price: "700",
              priceCurrency: "DKK",
              priceValidUntil: "2026-12-31",
              availability: "https://schema.org/InStock",
              url: "https://lejhojtaler.dk/#book",
              description: "Fra 700 kr/weekend (fre–man). PA-anlæg udlejning København.",
            },
          }),
        }}
      />

      {/* JSON-LD: Product — Lys-pakke */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Lys-pakke udlejning",
            description:
              "Festlys til leje: 2 farvede LED-lamper + centereffekt på stativ. Tilkøb til din højtaler for den fulde festoplevelse.",
            image: "https://lejhojtaler.dk/images/product-lys.png",
            brand: {
              "@type": "Brand",
              name: "Lejhøjtaler.dk",
            },
            offers: {
              "@type": "Offer",
              price: "500",
              priceCurrency: "DKK",
              priceValidUntil: "2026-12-31",
              availability: "https://schema.org/InStock",
              url: "https://lejhojtaler.dk/#book",
              description: "500 kr tilkøb. Festudstyr leje København.",
            },
          }),
        }}
      />

      <ExitIntent />
    </main>
  );
}
