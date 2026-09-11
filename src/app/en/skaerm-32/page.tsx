import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import { catalogDiscount, catalogPartsPrice, prisTekst } from "@/lib/products";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "32\" Screen on Stand Rental Copenhagen | 395 DKK | Lejhøjtaler.dk",
  description:
    "Rent a 32\" LED screen on a stand in Copenhagen for 395 DKK. Compact and easy to move — perfect for karaoke and the small meeting room. Book online.",
  keywords: ["32 inch screen rental copenhagen", "screen on stand hire", "small screen for event rental", "karaoke screen rental denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/skaerm-32",
    languages: localeAlternates("/skaerm-32"),
  },
  openGraph: {
    title: "32\" screen on stand rental | 395 DKK",
    description: "32\" LED screen on a tripod stand — compact, easy to move and ready in 5 minutes.",
    url: "https://lejhojtaler.dk/en/skaerm-32",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/skaerm-32"
      name={"32\" Screen"}
      price={395}
      headline={"Rent a 32\" screen on a stand"}
      sub={"32\" LED screen on a tripod stand — compact, easy to move and ready in 5 minutes."}
      image="/images/product-skaerm-32.webp"
      imageAlt={"32\" LED screen on a tripod stand for rent in Copenhagen"}
      productId="skaerm_32"
      faqPhrase={"a 32\" screen"}
      bullets={[
        "32\" LED screen in Full HD",
        "Tripod stand with adjustable height",
        "HDMI cable and power cable included",
        "Small enough to fit in an ordinary car",
        "Perfect for karaoke lyrics, slides and photo shows",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Using it for karaoke?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Then it is cheaper in the Karaoke bundle together with the machine and speakers —{" "}
            <LivePrice productId="pakke_karaoke" prefix="" suffix=" DKK" /> instead of{" "}
            {prisTekst(catalogPartsPrice("pakke_karaoke"))} DKK.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/en/pakke-karaoke"
              className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400"
            >
              See the Karaoke bundle – save {catalogDiscount("pakke_karaoke")} DKK
            </Link>
            <Link
              href="/en/skaerm"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              See the 55&quot; large screen
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
