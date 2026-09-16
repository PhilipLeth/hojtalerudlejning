import type { Metadata } from "next";
import SeasonCampaign from "@/components/SeasonCampaign";
import { localeAlternates } from "@/lib/hreflang";
import { prisDkk } from "@/lib/products";

export const metadata: Metadata = {
  title: `Christmas party sound rental Copenhagen | From ${prisDkk("jul_hygge")}`,
  description: "Hire sound and lighting for a Christmas lunch or December Friday bar in Copenhagen. Office hygge, canteen speech, or a dance floor. Book online.",
  alternates: { canonical: "https://lejhojtaler.dk/en/julefrokost", languages: localeAlternates("/julefrokost") },
  openGraph: {
    title: "Christmas party sound rental Copenhagen",
    description: "Office hygge, canteen speech or Friday bar. Book online.",
    url: "https://lejhojtaler.dk/en/julefrokost",
    images: ["/images/julefrokost-hero.webp"],
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return <SeasonCampaign seasonId="julefrokost" locale="en" />;
}
