import { prisDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: `Large speaker package Rental Copenhagen | ${prisDkk("hojtaler_100")} | Lejhøjtaler.dk`,
  description:
    `Rent a speaker package for 50-100 guests in Copenhagen for ${prisDkk("hojtaler_100")}. 2× 12\" EV ZLX 12P G2 with a Behringer 12\" subwoofer. The step above the medium speaker package.`,
  keywords: ["speaker package with subwoofer rental", "pa system with bass hire copenhagen", "speakers for 100 people rental", "subwoofer rental copenhagen"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/hojtalerpakke-bas",
    languages: localeAlternates("/hojtalerpakke-bas"),
  },
  openGraph: {
    images: ogImages("/images/product-festival-bas-v2.webp"),
    title: `Large speaker package rental | ${prisDkk("hojtaler_100")}`,
    description: "2× 12\" EV ZLX 12P G2 + Behringer 12\" subwoofer. For 50-100 guests.",
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
      name="Large speaker package"
      headline="Rent a speaker package for 50-100 guests"
      sub={"The large 12\" EV ZLX 12P G2 with a Behringer 12\" subwoofer, the step above the medium speaker package. Stands are an add-on."}
      image="/images/product-hojtalerpakke-stor-white.webp"
      imageAlt="Large speaker package with two 12 inch EV speakers and a subwoofer for rent in Copenhagen"
      productId="hojtaler_100"
      faqPhrase="the speaker package with subwoofer"
      capacity={{ level: 3, label: "50-100 people" }}
      bullets={[
        "2× 12\" EV powered speakers",
        "Speaker stands can be added",
        "12\" subwoofer for the bottom end of the music",
        "Bluetooth + all cables",
        "No lights, Party package 150 is the same sound plus lights and fog",
      ]}
    />
  );
}
