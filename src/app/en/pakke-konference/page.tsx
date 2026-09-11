import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Conference Bundle Rental Copenhagen | 1,395 DKK | Lejhøjtaler.dk",
  description:
    "Conference bundle with 55\" display, wireless headset and two speakers — ready for the meeting room for 1,395 DKK. Save 140 DKK. Book online in Copenhagen.",
  keywords: ["conference equipment rental copenhagen", "screen and sound for conference hire", "av equipment conference denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/pakke-konference",
    languages: localeAlternates("/pakke-konference"),
  },
  openGraph: {
    title: "Conference bundle rental | 1,395 DKK",
    description: "55\" display + wireless headset + small speaker package. Save 140 DKK.",
    url: "https://lejhojtaler.dk/en/pakke-konference",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/pakke-konference"
      name="Conference bundle"
      price={1395}
      headline="The conference bundle — ready for the meeting"
      sub={"55\" display + wireless headset + small speaker package. Save 140 DKK."}
      image="/images/product-skaerm.webp"
      imageAlt="Conference bundle with large screen, headset and speakers"
      productId="pakke_konference"
      bullets={[
        "55\" LED display on a tripod stand",
        "Wireless headset",
        "2× 10\" speakers with Bluetooth",
        "All cables and adapters",
        "Save 140 DKK compared to single prices",
      ]}
    />
  );
}
