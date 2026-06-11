import BookingFlow from "@/components/BookingFlow";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <BookingFlow />
      <HowItWorks />
      <Footer />

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
              "Højtalerudlejning i København. Lej højtaler, PA-anlæg og lydudstyr til fest, event og party. Festudstyr til leje fra 400 kr/weekend.",
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
            name: "Party-højtaler udlejning",
            description:
              "Kompakt 10\" party-højtaler til leje. Op til 40 personer. Inkl. alle kabler (iPhone, USB-C, AUX). Ideel til fødselsdage, havefester og mindre events i København.",
            image: "https://lejhojtaler.dk/images/product-party.png",
            brand: {
              "@type": "Brand",
              name: "Lejhøjtaler.dk",
            },
            offers: {
              "@type": "Offer",
              price: "400",
              priceCurrency: "DKK",
              priceValidUntil: "2026-12-31",
              availability: "https://schema.org/InStock",
              url: "https://lejhojtaler.dk/#book",
              description: "Fra 400 kr/weekend (fre–man). Højtalerleje København.",
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
            name: "Festival-højtaler udlejning",
            description:
              "Kraftig 12\" festival-højtaler til leje. 40–100 personer. Inkl. stativer og alle kabler. Perfekt til store fester, events og udendørs arrangementer i København.",
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
    </main>
  );
}
