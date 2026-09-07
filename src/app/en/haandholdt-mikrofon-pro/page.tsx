import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Shure Beta 58A Rental Copenhagen | 395 DKK | Lejhøjtaler.dk",
  description:
    "Rent a Shure Beta 58A wired microphone in Copenhagen for 395 DKK per weekend. The industry standard for vocals and speeches. XLR cable included. Pay on pickup.",
  keywords: [
    "shure beta 58a rental copenhagen",
    "vocal microphone rental copenhagen",
    "microphone rental for singers",
    "professional microphone hire copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/haandholdt-mikrofon-pro",
    languages: localeAlternates("/haandholdt-mikrofon-pro"),
  },
  openGraph: {
    title: "Shure Beta 58A Rental Copenhagen | 395 DKK",
    description:
      "Shure Beta 58A wired microphone — the classic for vocals and speeches. Book online.",
    url: "https://lejhojtaler.dk/en/haandholdt-mikrofon-pro",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/haandholdt-mikrofon-pro"
      name="Handheld microphone PRO (wired)"
      price={395}
      headline="Rent a Shure Beta 58A"
      sub="Shure Beta 58A with cable — the classic for vocals and speeches."
      image="/images/product-mikrofon-kabel-pro.webp"
      imageAlt="Shure Beta 58A microphone for rent in Copenhagen"
      productId="haandholdt_mikrofon_pro"
      faqPhrase="a Shure Beta 58A"
      bullets={[
        "Shure Beta 58A — the industry standard",
        "XLR cable included",
        "Made for vocals and speeches",
        "Plugs straight into our speakers",
        "Collect Friday, return Monday",
      ]}
    />
  );
}
