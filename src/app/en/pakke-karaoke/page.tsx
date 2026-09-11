import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Karaoke Bundle Rental Copenhagen | 1,300 DKK | Lejhøjtaler.dk",
  description:
    "Karaoke bundle with machine, 32\" screen and two speakers — karaoke for up to 40 people for 1,300 DKK. Save 385 DKK. Book online in Copenhagen.",
  keywords: ["karaoke package rental copenhagen", "karaoke with screen hire", "karaoke system rental denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/pakke-karaoke",
    languages: localeAlternates("/pakke-karaoke"),
  },
  openGraph: {
    title: "Karaoke bundle rental | 1,300 DKK",
    description: "Karaoke machine + 32\" screen + 2× Alto speakers. Everything for karaoke — save 385 DKK.",
    url: "https://lejhojtaler.dk/en/pakke-karaoke",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/pakke-karaoke"
      name="Karaoke bundle"
      price={1300}
      headline="The karaoke bundle — machine, screen and sound"
      sub={"Karaoke machine + 32\" screen + 2× Alto speakers. Everything for karaoke — save 385 DKK."}
      image="/images/product-pakke-karaoke-v2.webp"
      imageAlt={"Karaoke bundle with machine, 32\" screen and speakers for rent"}
      productId="pakke_karaoke"
      bullets={[
        "Singing Machine + 2 wireless microphones",
        "32\" LED screen on a tripod stand for the lyrics",
        "2× Alto 10\" speakers with Bluetooth",
        "HDMI + all cables",
        "Save 385 DKK compared to single prices (1,685 DKK)",
        "Karaoke for up to 40 people",
      ]}
    />
  );
}
