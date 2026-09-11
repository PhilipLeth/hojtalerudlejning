import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Projector Pro (5000 lumen) Rental Copenhagen | 795 DKK | Lejhøjtaler.dk",
  description:
    "Rent a 5000 lumen PRO projector in Copenhagen for 795 DKK. Sharp even in lit rooms and daylight — for halls, trade shows and large meetings. Book online.",
  keywords: ["projector pro rental copenhagen", "5000 lumen projector hire", "bright projector rental denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/projektor-pro",
    languages: localeAlternates("/projektor-pro"),
  },
  openGraph: {
    title: "Projector Pro (5000 lumen) rental | 795 DKK",
    description: "Powerful 5000 lumen projector — sharp even in daylight.",
    url: "https://lejhojtaler.dk/en/projektor-pro",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/projektor-pro"
      name="Projector Pro (5000 lumen)"
      price={795}
      headline="Rent the Projector Pro — 5000 lumen"
      sub="Powerful 5000 lumen projector — sharp even in daylight."
      image="/images/product-projektor-pro-v2.webp"
      imageAlt="5000 lumen projector for rent"
      productId="projektor_pro"
      faqPhrase="the Projector Pro"
      bullets={[
        "5000 ANSI lumen — works in daylight",
        "Full HD resolution",
        "HDMI + power cable included",
        "Perfect for conferences and large rooms",
        "Combine with the screen for 195 DKK",
      ]}
    />
  );
}
