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

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Højtalerudlejning.dk",
            description:
              "Udlejning af højtalere og musikanlæg til fester i København",
            url: "https://hojtalerudlejning.dk",
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
    </main>
  );
}
