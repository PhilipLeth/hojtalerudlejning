import type { Metadata } from "next";
import SeasonCampaign from "@/components/SeasonCampaign";
import { localeAlternates } from "@/lib/hreflang";
import { prisKr } from "@/lib/products";

export const metadata: Metadata = {
  title: `Lyd til julefrokost | Fra ${prisKr("jul_hygge")} | Lejhøjtaler.dk`,
  description: `Lej lyd, lys og mikrofon til julefrokost i København. Julehyggen, firmafestpakken eller december-fredagsbaren. Book online.`,
  keywords: ["lyd til julefrokost", "højtaler julefrokost leje", "musikanlæg firmajulefrokost", "anlæg til julefrokost København"],
  alternates: { canonical: "https://lejhojtaler.dk/julefrokost", languages: localeAlternates("/julefrokost") },
  openGraph: {
    title: "Lyd til julefrokost | Lejhøjtaler.dk",
    description: "Kontorets hygge, kantinens tale eller fredagsbaren i december. Book online.",
    url: "https://lejhojtaler.dk/julefrokost",
    images: ["/images/julefrokost-hero.webp"],
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return <SeasonCampaign seasonId="julefrokost" locale="da" />;
}
