import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Speaker Package 100 Rental Copenhagen | 1,495 DKK | Lejhøjtaler.dk",
  description:
    "Rent a speaker package for 50-100 guests in Copenhagen for 1,495 DKK. 2× 12\" EV speakers on stands with a 12\" subwoofer. The step above the large speaker package.",
  keywords: ["speaker package with subwoofer rental", "pa system with bass hire copenhagen", "speakers for 100 people rental", "subwoofer rental copenhagen"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/hojtalerpakke-bas",
    languages: localeAlternates("/hojtalerpakke-bas"),
  },
  openGraph: {
    title: "Speaker package 100 rental | 1,495 DKK",
    description: "2× 12\" EV speakers on stands + 12\" subwoofer. For 50-100 guests.",
    url: "https://lejhojtaler.dk/en/hojtalerpakke-bas",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/hojtalerpakke-bas"
      name="Speaker package 100"
      price={1495}
      headline="Rent a speaker package for 50-100 guests"
      sub={"The large 12\" EV speakers on stands with a 12\" subwoofer underneath — the step above the large speaker package."}
      image="/images/product-festival-bas.webp"
      imageAlt="Speaker package with two 12 inch EV speakers on stands and a subwoofer for rent in Copenhagen"
      productId="hojtaler_100"
      faqPhrase="the speaker package with subwoofer"
      capacity={{ level: 3, label: "50-100 people" }}
      bullets={[
        "2× 12\" EV powered speakers",
        "Speaker stands included",
        "12\" subwoofer for the bottom end of the music",
        "Bluetooth + all cables",
        "No lights — Party package 150 is the same sound plus lights and fog",
      ]}
    />
  );
}
